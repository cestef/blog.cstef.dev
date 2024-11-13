import { HIDE_SEEDLINGS_PROD } from "@/constants";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

export const GET: APIRoute = async ({ params, request }) => {
	const blogEntries = await getCollection(
		"blog",
		(entry) =>
			!(
				import.meta.env.PROD &&
				HIDE_SEEDLINGS_PROD &&
				entry.data.growth === "seedling"
			),
	);
	const container = await AstroContainer.create();
	const posts = await Promise.all(
		blogEntries.map(async (entry) => {
			return {
				...entry.data,
				compiledContent: await container.renderToString(
					(await entry.render()).Content,
				),
				slug: entry.slug,
			};
		}),
	).then((posts) => posts.sort((a, b) => b.date.getTime() - a.date.getTime()));
	const encodeHtml = (str: string) =>
		str.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]+/gu, "");
	return rss({
		title: "cstef's Digital Garden",
		description:
			"A blog about software development, maths, or whatever else I feel like writing about.",
		items: posts.map((post) => ({
			link: `https://blog.cstef.dev/post/${post.slug}`,
			pubDate: post.date,
			categories: post.tags,
			content: encodeHtml(post.compiledContent),
			...post,
		})),
		site: "https://blog.cstef.dev",
		stylesheet: "/styles.xsl",
	});
};
