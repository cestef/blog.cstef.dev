import { rehypeCodeHook, type MapLike } from "@beoe/rehype-code-hook";
import type { Root } from "hast";
import type { Plugin } from "unified";
import { z } from "zod";
import { parseAttributes } from "./utils/attributes";

import { toHtml } from "hast-util-to-html";
import { renderToSVGString } from "./typst";
import { getRenderCache, setRenderCache } from "./utils/cache";

export type TypstRawConfig = {
	cache?: MapLike;
	class?: string;
};

const TypstRawAttributesSchema = z.object({
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

export const rehypeTypstRaw: Plugin<[TypstRawConfig?], Root> = (
	options = {},
) => {
	const salt = { class: options.class };
	// @ts-expect-error
	return rehypeCodeHook({
		...options,
		salt,
		language: "typst",
		code: async ({ code, meta }) => {
			const start = performance.now();
			const attributes = TypstRawAttributesSchema.parse(parseAttributes(meta));

			if (attributes.doNotRender) {
				return undefined;
			}

			let result: any;
			const cached = await getRenderCache("typst", {
				value: code,
				displayMode: "raw",
			});
			if (cached) {
				// console.log("Typst raw cache hit", performance.now() - start);
				result = cached;
			} else {
				try {
					result = {
						dark: await renderToSVGString(code, "raw", "dark"),
						light: await renderToSVGString(code, "raw", "light"),
					};
					await setRenderCache(
						"typst",
						{ value: code, displayMode: "raw" },
						result,
					);
				} catch (error) {
					result = [
						{
							type: "element",
							tagName: "span",
							properties: {
								className: ["typst-error"],
								// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
								style: `color: #cc0000`,
								title: String(error),
							},
							children: [{ type: "text", value: code }],
						},
					];
				}
			}

			if (typeof result === "object" && "dark" in result && "light" in result) {
				const out = [];
				for (const variant in result) {
					const res = result[variant];
					if (
						typeof res === "object" &&
						"svg" in res &&
						typeof res.svg === "object"
					) {
						const root = res.svg as Root;
						// @ts-ignore
						const defaultEm = 11;
						const height = res.height;
						const width = res.width;
						const shift = height - (res as any).baselinePosition;
						const shiftEm = shift / defaultEm;
						// @ts-ignore
						root.properties.style = `vertical-align: -${shiftEm || 0}em; width: ${width / defaultEm}em;`;
						// @ts-ignore
						if (!root.properties.className)
							// @ts-ignore
							root.properties.className = [];
						// @ts-ignore
						root.properties.className.push(`typst-${variant}`);
						out.push(root);
					} else {
						console.error("Unknown result", res);
					}
				}
				result = out;
			}

			const root_div = {
				type: "element" as const,
				tagName: "div",
				properties: {
					className: ["typst-raw"],
				},
				children: result,
			};

			return toHtml(root_div);
		},
	});
};
