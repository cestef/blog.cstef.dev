import type { ElementContent, Root } from "hast";
import type { VFile } from "vfile";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { toText } from "hast-util-to-text";
import { SKIP, visitParents } from "unist-util-visit-parents";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";

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
		const matches: [any, any[]][] = [];
		// @ts-ignore
		visitParents(tree, "element", (...args: [any, any[]]) => {
			matches.push(args);
			return tree;
		});

		const visitor = async (
			element: any,
			parents: any[],
		): Promise<typeof SKIP | undefined> => {
			const start = performance.now();
			const classes: ReadonlyArray<unknown> = Array.isArray(
				element.properties.className,
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

			let result: Array<ElementContent> | string | undefined;

			try {
				result = await renderToSVGString(
					value,
					displayMode ? "display" : "inline",
				);
			} catch (error) {
				const cause = error as Error;
				file.message("Could not render math with typst", {
					ancestors: [...parents, element],
					cause,
					place: element.position,
					source: "rehype-typst",
				});

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
			}

			const index = parent.children.indexOf(scope);
			if (Array.isArray(result)) {
				parent.children.splice(index, 1, ...(result as Array<ElementContent>));
			} else if (typeof result === "string") {
				scope.tagName = "span";
				scope.properties = {
					className: ["typst-error"],
					style: `color:${settings.errorColor || "#cc0000"}`,
					title: result,
				};
				scope.children = [{ type: "text", value }];
			} else {
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
	};
}

export async function renderToSVGString(
	code: string,
	mode: "inline" | "display" | "raw" = "inline",
): Promise<any> {
	if (!compilerIns.current) {
		compilerIns.current = NodeCompiler.create();
	}
	const $typst = compilerIns.current;
	const res = renderToSVGString_($typst, code, mode);
	$typst.evictCache(10);
	return res;
}

async function renderToSVGString_(
	$typst: NodeCompiler,
	code: string,
	mode: "inline" | "display" | "raw",
): Promise<any> {
	const helperFunctions = `
#let colred(x) = text(fill: red, $#x$)
#let colblue(x) = text(fill: blue, $#x$)
#let colgreen(x) = text(fill: green, $#x$)
#let colyellow(x) = text(fill: yellow, $#x$)
    `;
	const packages = `

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
	const res: any = {
		svg,
	};
	if (mode === "inline") {
		const query = $typst.query(doc, {
			selector: "<label>",
		});
		res.baselinePosition = Number.parseFloat(query[0].value.slice(0, -2));
	}

	return res;
}
