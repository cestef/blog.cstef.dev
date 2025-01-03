import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import type { ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toHtml } from "hast-util-to-html";
import { toText } from "hast-util-to-text";
import sharp from "sharp";
import { SKIP, visitParents } from "unist-util-visit-parents";
import type { VFile } from "vfile";
import { getRenderCache, hashValue, setRenderCache } from "./utils/cache";
import {
	customStyles,
	displayMathTemplate,
	inlineMathTemplate,
	rawTemplate,
	themes,
} from "./utils/typst-utils";
export const compilerIns: { current: NodeCompiler | null } = { current: null };
import { optimize } from "svgo";
import { remove } from "unist-util-remove";
import { THEME } from "../src/constants";

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
			const [element] = args;
			const classes: ReadonlyArray<unknown> = Array.isArray(
				element.properties?.className,
			)
				? element.properties.className
				: emptyClasses;

			const languageMath = classes.includes("language-math");
			const mathDisplay = classes.includes("math-display");
			const mathInline = classes.includes("math-inline");

			if (!languageMath && !mathDisplay && !mathInline) {
				return;
			}
			matches.push(args);
			return tree;
		});
		let cachedCount = 0;
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
			const cacheValue = { value, displayMode, theme: THEME };

			const hash = hashValue(cacheValue);
			const cached = await getRenderCache("typst", cacheValue, hash);
			if (cached) {
				result = cached;
				cachedCount++;
			} else {
				try {
					result = {
						dark: await renderToSVGString(
							value,
							displayMode ? "display" : "inline",
							"dark",
						),
						light: await renderToSVGString(
							value,
							displayMode ? "display" : "inline",
							"light",
						),
					};

					await setRenderCache("typst", cacheValue, result);
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
						root.properties.style = `vertical-align: -${shiftEm || 0}em; width: ${width / defaultEm}em;`;
						// @ts-ignore
						if (!root.properties.className)
							// @ts-ignore
							root.properties.className = [];
						if (displayMode) {
							// @ts-ignore
							root.properties.style += "; display: block; margin: 0 auto;";
							// @ts-ignore
							(root.properties.className as string[]).push("typst-doc");
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
			} else if (
				typeof result === "object" &&
				"svg" in result &&
				typeof result.svg === "string"
			) {
				const root = fromHtmlIsomorphic(result.svg, {
					fragment: true,
				});
				// console.log("root", root);
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
				if (displayMode) {
					// @ts-ignore
					root.children[0].properties.style +=
						"; display: block; margin: 0 auto;";
				} else {
					// @ts-ignore
					(root.children[0].properties.className as string[]).push(
						"typst-inline",
					);
				}
				result = root.children as Array<ElementContent>;
			} else {
				console.error("Unknown result", result);
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

		console.log(
			`Typst: ${((end - start) / 1000).toFixed(2)}s | ${promises.length} els. | ${((end - start) / promises.length).toFixed(2)} [ms/el] | ${file.path.replace(process.cwd(), "")} | ${cachedCount} cached (${((cachedCount / promises.length) * 100).toFixed(2)}%)`,
		);
	};
}

export async function renderToSVGString(
	code: string,
	mode: "inline" | "display" | "raw" = "inline",
	theme?: "dark" | "light",
): Promise<any> {
	if (!compilerIns.current) {
		compilerIns.current = NodeCompiler.create();
	}
	const $typst = compilerIns.current;
	const res = await render($typst, code, mode, "svg", theme);
	// console.log("res", res);
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

	const { data: optimized } = import.meta.env.PROD
		? (() => {
				try {
					return optimize(svgString, {
						multipass: true,
						datauri: "enc",
					});
				} catch (error) {
					console.error("Could not optimize SVG", error);
					return {
						data: `data:image/svg+xml,${encodeURIComponent(svgString)}`,
					};
				}
			})()
		: { data: `data:image/svg+xml,${encodeURIComponent(svgString)}` };

	const alt = code.slice(0, 50);
	// const img = fromHtmlIsomorphic(
	// 	`<img src="${optimized}" alt="${alt}" loading="lazy"/>`,
	// 	{ fragment: true },
	// ).children[0];
	const img = {
		type: "element",
		tagName: "img",
		properties: {
			src: optimized,
			alt: alt,
			loading: "lazy",
		},
		children: [],
	};

	return {
		svg: img,
		baselinePosition: res.baselinePosition,
		height,
		width,
	};
}

export async function renderToPNGString(
	code: string,
	mode: "inline" | "display" | "raw" = "inline",
	theme?: "dark" | "light",
): Promise<any> {
	if (!compilerIns.current) {
		compilerIns.current = NodeCompiler.create();
	}
	const $typst = compilerIns.current;
	const res = await render($typst, code, mode, "png", theme);
	$typst.evictCache(10);
	const png = `data:image/png;base64,${res.png.toString("base64")}`;
	const alt = code.slice(0, 50);
	const img = `<img src="${png}" alt="${alt}" loading="lazy"/>`;
	return {
		svg: img,
		baselinePosition: res.baselinePosition,
	};
}

async function render(
	$typst: NodeCompiler,
	code: string,
	mode: "inline" | "display" | "raw",
	output: "svg" | "png" = "svg",
	theme?: "dark" | "light",
): Promise<any> {
	const mainFileContent = (
		mode === "raw"
			? rawTemplate
			: mode === "display"
				? displayMathTemplate
				: inlineMathTemplate
	)(code);

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
		remove(root, (node) => (node as any).tagName === "style");
		// console.log(inspect(root));
		const typstTheme = themes[THEME];
		// Inject our own <style> tag into the SVG
		const style = {
			type: "element",
			tagName: "style",
			properties: {},
			children: [
				{
					type: "text",
					value: `${theme === "dark" ? typstTheme.darkTheme : typstTheme.lightTheme} ${customStyles}`,
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
