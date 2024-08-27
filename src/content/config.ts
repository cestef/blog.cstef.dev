import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()),
		image: z.string().optional(),
		description: z.string(),
	}),
});

export const collections = {
	blog: blogCollection,
};
