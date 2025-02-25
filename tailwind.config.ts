import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const hexToRgb = (h: string) => {
	let hex = h;
	hex = hex.replace("#", "");
	hex = hex.length === 3 ? hex.replace(/./g, "$&$&") : hex;
	const r = Number.parseInt(hex.substring(0, 2), 16);
	const g = Number.parseInt(hex.substring(2, 4), 16);
	const b = Number.parseInt(hex.substring(4, 6), 16);
	return `${r} ${g} ${b}`;
};

export default {
	darkMode: "class",
	content: [
		"./templates/**/*.html",
		"./templates/*.html",
		"./styles/**/*.css",
		"./styles/*.css",
	],
	theme: {
		extend: {
			typography: () => ({
				gruvbox: {
					css: {
						// Light theme
						"--tw-prose-body": "#3c3836",
						"--tw-prose-headings": "#282828",
						"--tw-prose-lead": "#504945",
						"--tw-prose-links": "#076678",
						"--tw-prose-bold": "#282828",
						"--tw-prose-counters": "#7c6f64",
						"--tw-prose-bullets": "#bdae93",
						"--tw-prose-hr": "#d5c4a1",
						"--tw-prose-quotes": "#282828",
						"--tw-prose-quote-borders": "#d5c4a1",
						"--tw-prose-captions": "#7c6f64",
						"--tw-prose-kbd": "#282828",
						"--tw-prose-kbd-shadows": "40 40 40",
						"--tw-prose-code": "#9d0006",
						"--tw-prose-pre-code": "#fbf1c7",
						"--tw-prose-pre-bg": "#3c3836",
						"--tw-prose-th-borders": "#bdae93",
						"--tw-prose-td-borders": "#d5c4a1",

						// Dark theme
						"--tw-prose-invert-body": "#ebdbb2",
						"--tw-prose-invert-headings": "#fbf1c7",
						"--tw-prose-invert-lead": "#d5c4a1",
						"--tw-prose-invert-links": "#83a598",
						"--tw-prose-invert-bold": "#fbf1c7",
						"--tw-prose-invert-counters": "#bdae93",
						"--tw-prose-invert-bullets": "#665c54",
						"--tw-prose-invert-hr": "#504945",
						"--tw-prose-invert-quotes": "#fbf1c7",
						"--tw-prose-invert-quote-borders": "#504945",
						"--tw-prose-invert-captions": "#bdae93",
						"--tw-prose-invert-kbd": "#fbf1c7",
						"--tw-prose-invert-kbd-shadows": "251, 241, 199",
						"--tw-prose-invert-code": "#fb4934",
						"--tw-prose-invert-pre-code": "#ebdbb2",
						"--tw-prose-invert-pre-bg": "rgb(40 40 40 / 50%)",
						"--tw-prose-invert-th-borders": "#665c54",
						"--tw-prose-invert-td-borders": "#504945",
					},
				},
			}),
		},
	},
	plugins: [typography],
} satisfies Config;
