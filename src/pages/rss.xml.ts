import { HIDE_SEED_IN_PROD } from "@/constants";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
	const blogEntries = await getCollection(
		"blog",
		(entry) =>
			!(
				import.meta.env.PROD &&
				HIDE_SEED_IN_PROD &&
				entry.data.growth === "seed"
			),
	);
	const posts = await Promise.all(
		blogEntries.map(async (entry) => {
			return {
				...entry.data,
				slug: entry.slug,
			};
		}),
	).then((posts) => posts.sort((a, b) => b.date.getTime() - a.date.getTime()));

	return rss({
		title: "cstef's Digital Garden",
		description:
			"A blog about software development, maths, or whatever else I feel like writing about.",
		items: posts.map((post) => ({
			link: `https://blog.cstef.dev/posts/${post.slug}`,
			pubDate: post.date,
			categories: post.tags,
			...post,
		})),
		site: "https://blog.cstef.dev",
		stylesheet: "/styles.xsl",
	});
};
