import { execSync } from "node:child_process";

export function remarkModifiedTime() {
	return (tree: any, file: any) => {
		const filepath = file.history[0];
		const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`);
		file.data.astro.frontmatter.lastModified = result.toString();
	};
}
