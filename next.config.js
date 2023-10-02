const withNextra = require("nextra")({
	theme: "nextra-theme-blog",
	themeConfig: "./theme.config.tsx",
	latex: true,
	defaultShowCopyCode: false,
	readingTime: true,
});

module.exports = withNextra({
	publicRuntimeConfig: {
		UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
	},
});

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
