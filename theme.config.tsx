import { NextraBlogTheme } from "nextra-theme-blog";
import { Comments } from "./components/Comments";

const config: NextraBlogTheme = {
	footer: (
		<p className="mt-12 text-center text-gray-500 dark:text-gray-400">
			© {new Date().getFullYear()} - Built with <a href="https://nextra.site/">Nextra</a> ·{" "}
			<a href="https://github.com/cestef">GitHub</a>
		</p>
	),
	head: ({ title, meta }) => (
		<>
			{meta.description && <meta name="description" content={meta.description} />}
			{meta.tag && <meta name="keywords" content={meta.tag} />}
			{meta.author && <meta name="author" content={meta.author} />}
			{meta.image && <meta name="image" content={meta.image} />}
			{meta.url && <meta name="url" content={meta.url} />}
			{meta.title && <meta name="title" content={meta.title} />}
			{meta.image && <meta property="og:image" content={meta.image} />}
			{meta.title && <meta property="og:title" content={meta.title} />}
			{meta.description && <meta property="og:description" content={meta.description} />}
			{meta.url && <meta property="og:url" content={meta.url} />}
			{meta.author && <meta property="og:author" content={meta.author} />}
			{/* <link rel='icon' href='/favicon.ico' /> */}
		</>
	),
	dateFormatter: (date) => `${date.toDateString()}`,
	readMore: "Read →",
	darkMode: true,
	comments: <Comments />,
};

export default config;
