import { rehypeCodeHook, type MapLike } from "@beoe/rehype-code-hook";
import type { ElementContent, Root } from "hast";
import type { Plugin } from "unified";
import { z } from "zod";
import { parseAttributes } from "./utils/attributes";

import { renderToPNGString, renderToSVGString } from "./typst";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { getRenderCache, setRenderCache } from "./utils/cache";

export type TypstRawConfig = {
	cache?: MapLike;
	class?: string;
};

const current = {
	instanciated: false,
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

			let result: Array<ElementContent> | string | undefined;
			const cached = await getRenderCache("typst", {
				value: code,
				displayMode: "raw",
			});
			if (cached) {
				result = cached;
			} else {
				try {
					result = await renderToSVGString(code, "raw");
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

			if (
				typeof result === "object" &&
				"svg" in result &&
				typeof result.svg === "string"
			) {
				const root = fromHtmlIsomorphic(result.svg, {
					fragment: true,
				});
				const defaultEm = 11;
				const height = Number.parseFloat(
					// @ts-ignore
					root.children[0].properties.dataHeight as string,
				);
				const width = Number.parseFloat(
					// @ts-ignore
					root.children[0].properties.dataWidth as string,
				);
				const shift = height - (result as any).baselinePosition;
				const shiftEm = shift / defaultEm;
				// @ts-ignore
				root.children[0].properties.style = `vertical-align: -${shiftEm}em;`;
				// @ts-ignore

				root.children[0].properties.height = `${height / defaultEm}em`;
				// @ts-ignore
				root.children[0].properties.width = `${width / defaultEm}em`;
				// @ts-ignore
				if (!root.children[0].properties.className)
					// @ts-ignore
					root.children[0].properties.className = [];
				// @ts-ignore
				root.children[0].properties.style +=
					"; display: block; margin: 0 auto;";

				return root;
			}
		},
	});
};
