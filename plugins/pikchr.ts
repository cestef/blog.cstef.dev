import { rehypeCodeHook, type MapLike } from "@beoe/rehype-code-hook";
import type { Root } from "hast";
import type { Plugin } from "unified";
import { z } from "zod";
import { parseAttributes } from "./utils/attributes";

import pikchr from "pikchr-wasm/speed";

export type PikchrConfig = {
	cache?: MapLike;
	class?: string;
};

const current = {
	instanciated: false,
};

const PikchrAttributesSchema = z.object({
	doNotRender: z
		.enum(["true", "false"])
		.optional()
		.transform((value) => {
			if (value === "true") {
				return true;
			}
			if (value === "false") {
				return false;
			}
			return undefined;
		}),
});

// Bit mask flags for Pikchr
/* Include PIKCHR_PLAINTEXT_ERRORS among the bits of mFlags on the 3rd
 ** argument to pikchr() in order to cause error message text to come out
 ** as text/plain instead of as text/html
 */
// #define PIKCHR_PLAINTEXT_ERRORS 0x0001

/* Include PIKCHR_DARK_MODE among the mFlag bits to invert colors.
 */
// #define PIKCHR_DARK_MODE        0x0002
enum PikchrFlags {
	PIKCHR_PLAINTEXT_ERRORS = 0x0001,
	PIKCHR_DARK_MODE = 0x0002,
}

export const rehypePikchr: Plugin<[PikchrConfig?], Root> = (options = {}) => {
	const salt = { class: options.class };
	// @ts-expect-error
	return rehypeCodeHook({
		...options,
		salt,
		language: "pikchr",
		code: async ({ code, meta }) => {
			if (!current.instanciated) {
				await pikchr.loadWASM();
				current.instanciated = true;
			}
			const attributes = PikchrAttributesSchema.parse(parseAttributes(meta));

			if (attributes.doNotRender) {
				return undefined;
			}
			// Get current microseconds
			const start = performance.now();
			const light = pikchr.render(code);
			const dark = pikchr.render(code, undefined, PikchrFlags.PIKCHR_DARK_MODE);
			return `<figure class="pikchr not-prose ${options.class ?? ""}"><div class="pikchr-light">${light}</div><div class="pikchr-dark">${dark}</div></figure>`;
		},
	});
};
