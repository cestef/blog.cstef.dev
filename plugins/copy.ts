import { visit } from "unist-util-visit";
import { parseAttributes } from "./utils/attributes";

export type CopyProps = {
	defaultCopy?: boolean;
};

/**
 * if the `code` element node has a `copy` metastring.
 * This is used to show the copy button on hover.
 */
export default function rehypeCopy({ defaultCopy }: CopyProps = {}) {
	return (tree: any) => {
		visit(tree, (node: any, _index, parent) => {
			if (node.type === "element" && node.tagName === "code") {
				const meta = node.data?.meta ?? node.properties?.metastring;
				const attributes = parseAttributes(meta);
				// serverLogger.debug("rehypeCopy -> attributes", attributes);
				if (
					attributes.copy !== "false" &&
					(attributes.copy === "true" || defaultCopy)
				) {
					parent.properties = {
						...parent.properties,
						dataCopy: "true",
					};
				}
			}
		});
	};
}
