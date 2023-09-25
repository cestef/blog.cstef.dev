import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	important: true,
	content: [
		"./pages/**/*.{js,jsx,ts,tsx,md,mdx}",
		"./components/**/*.{js,jsx,ts,tsx,md,mdx}",
		"./theme.config.tsx",
	],
	theme: {
		extend: {},
	},
	plugins: [],
} satisfies Config;
