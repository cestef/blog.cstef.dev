import type { BlogEntry } from "./content/config.ts";

export const HIDE_SEEDLINGS_PROD = true;

export const THEME = "nord";

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
	seedling: "🌿",
	sapling: "🪴",
	tree: "🌳",
};

export const THEMES = [
	{
		name: "Catppuccin",
		id: "catppuccin",
	},
	{
		name: "Dracula",
		id: "dracula",
	},
	{
		name: "Gruvbox",
		id: "gruvbox",
	},
	{
		name: "Monokai",
		id: "monokai",
	},
	{
		name: "Nord",
		id: "nord",
	},
	{
		name: "Solarized",
		id: "solarized",
	},
	{
		name: "Github",
		id: "default",
	},
];
