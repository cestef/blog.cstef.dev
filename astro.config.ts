import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeCallouts from "rehype-callouts";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, {
	type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import { rehypeTwemoji } from "rehype-twemoji";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import { rehypePikchr } from "./plugins/pikchr";
import rehypeTypst from "./plugins/typst";
import {
	bundledLanguages,
	createCssVariablesTheme,
	getSingletonHighlighter,
} from "shiki";
import pikchrLang from "./syntaxes/pikchr.tmLanguage.json";
import icon from "astro-icon";
import { remarkReadingTime } from "./plugins/reading-time";
import rehypeCopy from "./plugins/copy";
import { remarkModifiedTime } from "./plugins/modified";
import { rehypeTypstRaw } from "./plugins/raw-typst";
import rehypeRaw from "rehype-raw";

import playformCompress from "@playform/compress";

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
	integrations: [tailwind(), sitemap(), mdx(), icon(), playformCompress()],
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
			remarkMath,
			remarkEmoji,
			remarkReadingTime,
			remarkModifiedTime,
		],
		syntaxHighlight: false,
	},
});
