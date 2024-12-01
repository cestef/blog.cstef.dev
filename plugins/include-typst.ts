import path from "node:path";
import fs from "node:fs";
import { visit } from "unist-util-visit";
import { toVFile } from "to-vfile";
import type { VFile } from "vfile";
import type { Processor } from "unified";
import type { Node, Parent } from "hast";

// Define types for clarity
interface IncludeOptions {
	cwd?: string;
}

const parseInclude = /^@typst (.*)(\n|$)/;
const CODE_BLOCK_LANGUAGE = "typst";
const EXTENSIONS = ["typ", "typst"];

/**
 * Load an external file with multiple potential file extensions and locations
 * @param cwd Current working directory
 * @param vfile Current virtual file
 * @param filename Filename to include
 * @returns Loaded VFile
 */
function loadFile(cwd: string, vfile: VFile, filename: string): VFile {
	// Add CWD, VFile dir, and VFile CWD
	const dirs = [cwd]
		.concat(
			vfile.history.length > 0
				? path.dirname(vfile.history[vfile.history.length - 1])
				: "",
		)
		.concat(vfile.cwd)
		.filter(Boolean);

	// Create array of possible file paths
	const files = dirs.flatMap((dir) => [
		path.resolve(dir, filename),
		...EXTENSIONS.map((ext) => path.resolve(dir, `${filename}.${ext}`)),
	]);

	const ret = files
		.map((name) => {
			try {
				// return readSync(name);
				const file = toVFile(name);
				let res = fs.readFileSync(path.resolve(file.cwd, file.path), "utf-8");
				res = `\`\`\`${CODE_BLOCK_LANGUAGE}\n${res}\n\`\`\``;
				file.value = res;
				return file;
			} catch (e) {
				return false;
			}
		})
		.filter(Boolean) as VFile[];

	if (ret.length < 1) {
		throw new Error(`Unable to include ${filename}`);
	}

	return ret[0];
}

/**
 * Transform the AST to include external files
 * @param tree Abstract Syntax Tree
 * @param file Current virtual file
 * @param cwd Current working directory
 * @param processor Unified processor
 */
function transformer(
	tree: Node,
	file: VFile,
	cwd: string,
	processor: Processor,
): void {
	visit(tree, ["text"], (node, i, parent) => {
		// Type guard to ensure node is a text node with a parent
		if (!("value" in node) || !parent || typeof i !== "number") return;

		const nodeValue = node.value as string;

		// Check if the node matches include pattern
		if (!parseInclude.test(nodeValue)) {
			return;
		}

		const [, filename] = nodeValue.match(parseInclude) || [];

		if (!filename) return;

		const vfile = loadFile(cwd, file, filename);
		const root = processor.parse(vfile);

		// Recurse into the included file
		transformer(root, vfile, cwd, processor);

		// Replace the include node with the file's content
		if ("children" in root) {
			(parent as Parent).children.splice(i, 1, ...(root as Parent).children);
		}
	});
}

/**
 * Remark plugin for including external files
 * @param options Plugin options
 * @returns Transformer function
 */
export function remarkInclude(this: unknown, options: IncludeOptions = {}) {
	const cwd = options.cwd || process.cwd();
	const processor = this as Processor;

	return (tree: Node, file: VFile) => {
		transformer(tree, file, cwd, processor);
	};
}
