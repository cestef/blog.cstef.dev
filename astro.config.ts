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
// @ts-ignore
import rehypeFigure from "@microflash/rehype-figure";

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), sitemap(), mdx(), icon()],
	markdown: {
		rehypePlugins: [
			rehypeSlug,
			rehypeCallouts,
			rehypePikchr,
			rehypeTypst,
			[
				rehypePrettyCode,
				{
					getHighlighter: () =>
						getSingletonHighlighter({
							themes: [
								createCssVariablesTheme({
									name: "default",
									variablePrefix: "--shiki-",
									variableDefaults: {},
									fontStyle: true,
								}),
							],
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
			rehypeFigure,
		],
		remarkPlugins: [remarkMath, remarkEmoji, remarkReadingTime],
		syntaxHighlight: false,
	},
});
