import { defineCollection, reference, z } from "astro:content";

const BlogSchema = z.object({
	title: z.string(),
	tags: z.array(z.string()),
	image: z.string().optional(),
	description: z.string(),
	date: z.date().transform((val) => new Date(val)),
	state: z.enum(["seedling", "sapling", "tree"]).default("seedling"),
	related: z.array(reference("blog")).optional(),
});

const blogCollection = defineCollection({
	type: "content",
	schema: BlogSchema,
});

export type BlogEntry = z.infer<typeof BlogSchema>;

export const collections = {
	blog: blogCollection,
};
