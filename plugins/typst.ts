import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import type { ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toText } from "hast-util-to-text";
import { SKIP, visitParents } from "unist-util-visit-parents";
import type { VFile } from "vfile";
import { getRenderCache, setRenderCache } from "./utils/cache";
import {
	customCetz,
	customStyles,
	gruvboxTheme,
	gruvBoxThemeDark,
} from "./utils/typst-utils";
import sharp from "sharp";
import { toHtml } from "hast-util-to-html";
export const compilerIns: { current: NodeCompiler | null } = { current: null };

interface Options {
	errorColor?: string;
}

const emptyOptions: Readonly<Options> = {};
const emptyClasses: ReadonlyArray<unknown> = [];

export default function rehypeTypst(
	options?: Readonly<Options> | null | undefined,
) {
	const settings = options || emptyOptions;

	return async (tree: Root, file: VFile): Promise<void> => {
		const start = performance.now();
		const matches: [any, any[]][] = [];
		// @ts-ignore
		visitParents(tree, null, (...args: [any, any[]]) => {
			matches.push(args);
			return tree;
		});

		const visitor = async (
			element: any,
			parents: any[],
		): Promise<typeof SKIP | undefined> => {
			const classes: ReadonlyArray<unknown> = Array.isArray(
				element.properties?.className,
			)
				? element.properties.className
				: emptyClasses;

			const languageMath = classes.includes("language-math");
			const mathDisplay = classes.includes("math-display");
			const mathInline = classes.includes("math-inline");

			let displayMode = mathDisplay;
			if (!languageMath && !mathDisplay && !mathInline) {
				return;
			}

			let parent = parents[parents.length - 1];
			let scope = element;

			if (
				element.tagName === "code" &&
				languageMath &&
				parent &&
				parent.type === "element" &&
				parent.tagName === "pre"
			) {
				scope = parent;
				parent = parents[parents.length - 2];
				displayMode = true;
			}

			if (!parent) return;

			const value = toText(scope, { whitespace: "pre" });
			let result: any = null;
			const cached = await getRenderCache("typst", { value, displayMode });
			if (cached) {
				result = cached;
			} else {
				try {
					result = {
						dark: await renderToSVGString(
							value,
							"dark",
							displayMode ? "display" : "inline",
						),
						light: await renderToSVGString(
							value,
							"light",
							displayMode ? "display" : "inline",
						),
					};
					await setRenderCache("typst", { value, displayMode }, result);
				} catch (error) {
					const cause = error as Error;
					file.message("Could not render math with typst", {
						ancestors: [...parents, element],
						cause,
						place: element.position,
						source: "rehype-typst",
					});

					console.error(error);

					result = [
						{
							type: "element",
							tagName: "span",
							properties: {
								className: ["typst-error"],
								style: `color:${settings.errorColor || "#cc0000"}`,
								title: String(error),
							},
							children: [{ type: "text", value }],
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
						root.properties.style = `vertical-align: -${shiftEm || 0}em; height: ${height / defaultEm}em; width: ${width / defaultEm}em;`;
						// @ts-ignore
						if (!root.properties.className)
							// @ts-ignore
							root.properties.className = [];
						if (displayMode) {
							// @ts-ignore
							root.properties.style += "; display: block; margin: 0 auto;";
						} else {
							// @ts-ignore
							(root.properties.className as string[]).push("typst-inline");
						}
						// @ts-ignore
						root.properties.className.push(`typst-${variant}`);
						out.push(root);
					} else {
						console.error("Unknown result", res);
					}
				}
				result = out;
			}

			const index = parent.children.indexOf(scope);
			if (Array.isArray(result)) {
				parent.children.splice(index, 1, ...(result as Array<ElementContent>));
			} else if (typeof result === "string") {
				console.log("result", result);
				scope.tagName = "span";
				scope.properties = {
					className: ["typst-error"],
					style: `color:${settings.errorColor || "#cc0000"}`,
					title: result,
				};
				scope.children = [{ type: "text", value }];
			} else {
				console.log("result", result);
				scope.tagName = "span";
				scope.properties = {
					className: ["typst-error"],
					style: `color:${settings.errorColor || "#cc0000"}`,
					title: "Unknown error",
				};
				scope.children = [{ type: "text", value }];
			}
			return SKIP;
		};

		const promises = matches.map(async (args) => {
			await visitor(...args);
		});
		await Promise.all(promises);
		const end = performance.now();
		console.log(`Typst took ${end - start}ms`);
	};
}

export async function renderToSVGString(
	code: string,
	theme: "dark" | "light",
	mode: "inline" | "display" | "raw" = "inline",
): Promise<any> {
	if (!compilerIns.current) {
		compilerIns.current = NodeCompiler.create();
	}
	const $typst = compilerIns.current;
	const res = await render($typst, code, mode, theme, "svg");
	$typst.evictCache(10);
	const height = Number.parseFloat(
		// @ts-ignore
		res.svg.children[0].properties.dataHeight as string,
	);
	const width = Number.parseFloat(
		// @ts-ignore
		res.svg.children[0].properties.dataWidth as string,
	);
	const svgString = toHtml(res.svg);
	const img = fromHtmlIsomorphic(
		`<img src="data:image/svg+xml,${encodeURIComponent(svgString)}" />`,
		{ fragment: true },
	).children[0];

	return {
		svg: img,
		baselinePosition: res.baselinePosition,
		height,
		width,
	};
}

export async function renderToPNGString(
	code: string,
	theme: "dark" | "light",
	mode: "inline" | "display" | "raw" = "inline",
): Promise<any> {
	if (!compilerIns.current) {
		compilerIns.current = NodeCompiler.create();
	}
	const $typst = compilerIns.current;
	const res = await render($typst, code, mode, theme, "png");
	$typst.evictCache(10);
	const png = `data:image/png;base64,${res.png.toString("base64")}`;
	const img = `<img src="${png}" alt="${code}" />`;
	return {
		svg: img,
		baselinePosition: res.baselinePosition,
	};
}

async function render(
	$typst: NodeCompiler,
	code: string,
	mode: "inline" | "display" | "raw",
	theme: "dark" | "light",
	output: "svg" | "png" = "svg",
): Promise<any> {
	const helperFunctions = `
#let colred(x) = text(fill: red, $#x$)
#let colblue(x) = text(fill: blue, $#x$)
#let colgreen(x) = text(fill: green, $#x$)
#let colyellow(x) = text(fill: yellow, $#x$)
    `;
	const packages = `
        ${customCetz}
    `;
	const inlineMathTemplate = `
#set page(height: auto, width: auto, margin: 0pt)
#set text(13pt)
#let s = state("t", (:))
${helperFunctions}
${packages}

#let pin(t) = context {
    let computed = measure(
        line(length: here().position().y)
    )
    s.update(it => it.insert(t, computed.width) + it)
}

#show math.equation: it => {
    box(it, inset: (top: 0.5em, bottom: 0.5em))
}

$pin("l1")${code}$

#context [
    #metadata(s.final().at("l1")) <label>
]
  `;
	const displayMathTemplate = `
#set page(height: auto, width: auto, margin: 0pt)
#set text(14pt)
${helperFunctions}
${packages}
$ ${code} $
  `;
	const rawTemplate = `
#set page(height: auto, width: auto, margin: 0pt)
#set text(14pt)
${helperFunctions}
${packages}
${code}
    `;
	const mainFileContent =
		mode === "raw"
			? rawTemplate
			: mode === "display"
				? displayMathTemplate
				: inlineMathTemplate;
	const docRes = $typst.compile({ mainFileContent });
	if (!docRes.result) {
		const taken = docRes.takeDiagnostics();
		if (taken === null) {
			return {};
		}
		const diags = $typst.fetchDiagnostics(taken);
		console.error(JSON.stringify(diags, null, 2));
		return {};
	}
	const doc = docRes.result;

	const svg = $typst.svg(doc);
	let baselinePosition = undefined;
	if (mode === "inline") {
		const query = $typst.query(doc, {
			selector: "<label>",
		});
		baselinePosition = Number.parseFloat(query[0].value.slice(0, -2));
	}
	if (output === "svg") {
		const root = fromHtmlIsomorphic(svg, {
			fragment: true,
		});
		// Inject <style> tag into the SVG
		const style = {
			type: "element",
			tagName: "style",
			properties: {},
			children: [
				{
					type: "text",
					value: `${theme === "dark" ? gruvBoxThemeDark : gruvboxTheme} ${customStyles}`,
				},
			],
		};
		// @ts-ignore
		root.children[0].children.unshift(style);
		return {
			svg: root,
			baselinePosition,
		};
	}

	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	return {
		png,
		baselinePosition,
	};
}
