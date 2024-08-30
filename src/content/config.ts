import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
	type: "content",
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()),
		image: z.string().optional(),
		description: z.string(),
		date: z.date().transform((val) => new Date(val)),
		state: z.enum(["draft", "published"]).default("published"),
	}),
});

export const collections = {
	blog: blogCollection,
};
