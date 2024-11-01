import getReadingTime from "reading-time";
import { mdToString } from "./utils/to-string";

export function remarkReadingTime() {
	return (tree: any, { data }: any) => {
		const textOnPage = mdToString(tree, { includeCode: false });
		const readingTime = getReadingTime(textOnPage);
		// readingTime.text will give us minutes read as a friendly string,
		// i.e. "3 min read"
		data.astro.frontmatter.minutesRead = readingTime.text;
	};
}
