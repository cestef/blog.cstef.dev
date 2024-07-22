import buildWithNextra from "nextra";

const withNextra = buildWithNextra({
	theme: "nextra-theme-blog",
	themeConfig: "./theme.config.tsx",
	latex: true,
	defaultShowCopyCode: false,
	readingTime: true,
});

export default withNextra({
	publicRuntimeConfig: {
		UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
	},
    output: "export",
    images: {
        unoptimized: true,
    },
});

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
