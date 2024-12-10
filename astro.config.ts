import { defineConfig } from "astro/config";
import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import purgecss from "astro-purgecss";
import playformCompress from "@playform/compress";

import rehypeCallouts from "rehype-callouts";
import rehypePrettyCode, {
	type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { rehypeTwemoji } from "rehype-twemoji";
import remarkEmoji from "remark-emoji";
import remarkMath from "remark-math";
import {
	bundledLanguages,
	createCssVariablesTheme,
	getSingletonHighlighter,
} from "shiki";

import rehypeCopy from "./plugins/copy";
import { remarkModifiedTime } from "./plugins/modified";
import { rehypePikchr } from "./plugins/pikchr";
import { rehypeTypstRaw } from "./plugins/raw-typst";
import { remarkReadingTime } from "./plugins/reading-time";
import { remarkInclude } from "./plugins/include";
import rehypeTypst from "./plugins/typst";

import pikchrLang from "./syntaxes/pikchr.tmLanguage.json";

const shikiTheme = createCssVariablesTheme({
	name: "default",
	variablePrefix: "--shiki-",
	variableDefaults: {},
	fontStyle: true,
});

// https://astro.build/config
export default defineConfig({
	output: "static",
	site: "https://blog.cstef.dev",
	integrations: [
		tailwind(),
		sitemap(),
		mdx(),
		icon(),
		playformCompress(),
		purgecss(),
	],
	build: {
		inlineStylesheets: "never",
	},
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "viewport",
	},
	experimental: {
		clientPrerender: true,
	},
	markdown: {
		rehypePlugins: [
			rehypeRaw,
			rehypeCopy,
			rehypeSlug,
			rehypeCallouts,
			rehypePikchr,
			rehypeTypst,
			rehypeTypstRaw,
			[
				rehypePrettyCode,
				{
					getHighlighter: () =>
						getSingletonHighlighter({
							themes: [shikiTheme],
							langs: [...Object.values(bundledLanguages), pikchrLang] as any,
						}),
					// @ts-ignore
					theme: "default",
				} satisfies PrettyCodeOptions,
			],
			[
				rehypeTwemoji,
				{
					format: "svg",
					source: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest",
				},
			],
		],
		remarkPlugins: [
			remarkInclude,
			remarkMath,
			remarkEmoji,
			remarkReadingTime,
			remarkModifiedTime,
		],
		syntaxHighlight: false,
	},
});
