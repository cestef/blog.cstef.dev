import type { Nodes } from "mdast";

interface Options {
	/**
	 * Whether to use `alt` for `image`s (default: `true`).
	 */
	includeImageAlt?: boolean | null | undefined;
	/**
	 * Whether to use `value` of HTML (default: `true`).
	 */
	includeHtml?: boolean | null | undefined;
	includeCode?: boolean | null | undefined;
}

const emptyOptions: Options = {};

/**
 * Get the text content of a node or list of nodes.
 *
 * Prefers the node’s plain-text fields, otherwise serializes its children,
 * and if the given value is an array, serialize the nodes in it.
 *
 * @param value
 *   Thing to serialize, typically `Node`.
 * @param options
 *   Configuration (optional).
 * @returns
 *   Serialized `value`.
 */
export function mdToString(value?: unknown, options?: Options | null): string {
	const settings = options || emptyOptions;
	const includeImageAlt =
		typeof settings.includeImageAlt === "boolean"
			? settings.includeImageAlt
			: true;
	const includeHtml =
		typeof settings.includeHtml === "boolean" ? settings.includeHtml : true;
	const includeCode =
		typeof settings.includeCode === "boolean" ? settings.includeCode : true;
	return one(value, includeImageAlt, includeHtml, includeCode);
}

/**
 * One node or several nodes.
 *
 * @param value
 *   Thing to serialize.
 * @param includeImageAlt
 *   Include image `alt`s.
 * @param includeHtml
 *   Include HTML.
 * @returns
 *   Serialized node.
 */
function one(
	value: unknown,
	includeImageAlt: boolean,
	includeHtml: boolean,
	includeCode: boolean,
): string {
	if (node(value)) {
		if (!includeCode && (value.type as string) === "code") {
			return "";
		}
		if ("value" in value) {
			return value.type === "html" && !includeHtml ? "" : (value as any).value;
		}

		if (includeImageAlt && "alt" in value && value.alt) {
			return (value as any).alt;
		}

		if ("children" in value) {
			return all(
				(value as any).children,
				includeImageAlt,
				includeHtml,
				includeCode,
			);
		}
	}

	if (Array.isArray(value)) {
		return all(value, includeImageAlt, includeHtml, includeCode);
	}

	return "";
}

/**
 * Serialize a list of nodes.
 *
 * @param values
 *   Thing to serialize.
 * @param includeImageAlt
 *   Include image `alt`s.
 * @param includeHtml
 *   Include HTML.
 * @returns
 *   Serialized nodes.
 */
function all(
	values: unknown[],
	includeImageAlt: boolean,
	includeHtml: boolean,
	includeCode: boolean,
): string {
	const result: string[] = [];
	let index = -1;

	while (++index < values.length) {
		result[index] = one(
			values[index],
			includeImageAlt,
			includeHtml,
			includeCode,
		);
	}

	return result.join("");
}

/**
 * Check if `value` looks like a node.
 *
 * @param value
 *   Thing.
 * @returns
 *   Whether `value` is a node.
 */
function node(value: unknown): value is Nodes {
	return Boolean(value && typeof value === "object");
}
