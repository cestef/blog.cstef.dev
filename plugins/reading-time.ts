import getReadingTime from "reading-time";
import { toString as mdToString } from "mdast-util-to-string";

export function remarkReadingTime() {
	return (tree: any, { data }: any) => {
		const textOnPage = mdToString(tree);
		const readingTime = getReadingTime(textOnPage);
		// readingTime.text will give us minutes read as a friendly string,
		// i.e. "3 min read"
		data.astro.frontmatter.minutesRead = readingTime.text;
	};
}
