import { hexToRgb } from "./utils";

export default {
	solarized: {
		css: {
			// Light theme
			"--tw-prose-body": "#657b83",
			"--tw-prose-headings": "#073642",
			"--tw-prose-lead": "#586e75",
			"--tw-prose-links": "#268bd2",
			"--tw-prose-bold": "#073642",
			"--tw-prose-counters": "#93a1a1",
			"--tw-prose-bullets": "#eee8d5",
			"--tw-prose-hr": "#eee8d5",
			"--tw-prose-quotes": "#073642",
			"--tw-prose-quote-borders": "#eee8d5",
			"--tw-prose-captions": "#93a1a1",
			"--tw-prose-kbd": "#073642",
			"--tw-prose-kbd-shadows": hexToRgb("#073642"),
			"--tw-prose-code": "#dc322f",
			"--tw-prose-pre-code": "#fdf6e3",
			"--tw-prose-pre-bg": "#002b36",
			"--tw-prose-th-borders": "#eee8d5",
			"--tw-prose-td-borders": "#eee8d5",

			// Dark theme
			"--tw-prose-invert-body": "#839496",
			"--tw-prose-invert-headings": "#fdf6e3",
			"--tw-prose-invert-lead": "#93a1a1",
			"--tw-prose-invert-links": "#268bd2",
			"--tw-prose-invert-bold": "#fdf6e3",
			"--tw-prose-invert-counters": "#586e75",
			"--tw-prose-invert-bullets": "#073642",
			"--tw-prose-invert-hr": "#073642",
			"--tw-prose-invert-quotes": "#fdf6e3",
			"--tw-prose-invert-quote-borders": "#073642",
			"--tw-prose-invert-captions": "#586e75",
			"--tw-prose-invert-kbd": "#fdf6e3",
			"--tw-prose-invert-kbd-shadows": hexToRgb("#fdf6e3"),
			"--tw-prose-invert-code": "#cb4b16",
			"--tw-prose-invert-pre-code": "#839496",
			"--tw-prose-invert-pre-bg": "rgb(0 43 54 / 50%)",
			"--tw-prose-invert-th-borders": "#073642",
			"--tw-prose-invert-td-borders": "#073642",
		},
	},
};
