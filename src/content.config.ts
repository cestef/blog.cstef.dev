import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const GrowthSchema = z.enum(["seed", "sprout", "sapling", "tree"]);

export const BlogSchema = z.object({
	title: z.string(),
	tags: z.array(z.string()),
	image: z.string().optional(),
	description: z.string(),
	date: z.date().transform((val) => new Date(val)),
	growth: GrowthSchema.default("seed"),
});

export const HomeSchema = z.object({});

const blogCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/blog" }),
	schema: BlogSchema,
});

const homeCollection = defineCollection({
	loader: glob({ pattern: "**/[^_]*.md", base: "./src/data/home" }),
	schema: HomeSchema,
});

export type BlogEntry = z.infer<typeof BlogSchema>;
export type HomeEntry = z.infer<typeof HomeSchema>;

export const collections = {
	blog: blogCollection,
	home: homeCollection,
};
