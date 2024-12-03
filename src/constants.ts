import type { BlogEntry } from "./content/config.ts";

export const HIDE_SEED_IN_PROD = true;
export const THEME: Theme = "nord";

export type Theme =
	| "catppuccin"
	| "dracula"
	| "gruvbox"
	| "monokai"
	| "nord"
	| "solarized"
	| "default";

export const HERO: IHero = {
	title: "blog.cstef.dev",
	description: [
		"Welcome to my garden! 🌿",
		"Sometimes, I like to share my thoughts, notes, ideas or projects on this blog. Maybe you'll find something useful here !",
	],
};

export const STATUS_LINE: IStatusLine = {
	user: "cstef",
};

export type IHero = {
	title: string;
	description: string | string[];
};

export type IStatusLine = {
	user: string | false;
	path?: boolean;
	scroll?: boolean;
};

export const STATE_EMOJI: { [key in BlogEntry["growth"]]: string } = {
	seed: "🌱",
	sprout: "🌿",
	sapling: "🪴",
	tree: "🌳",
};
