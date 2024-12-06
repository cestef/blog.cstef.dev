import { pack, unpack } from "msgpackr";
import { xxh64 } from "@node-rs/xxhash";
import fs from "node:fs";
export const getCache = () => {
	if (!fs.existsSync(".cache")) {
		fs.mkdirSync(".cache");
	}
	return {
		get: async (key: string) => {
			return fs.promises.readFile(`.cache/${key}`).catch((e) => {
				if (e.code === "ENOENT") {
					return null;
				}
				throw e;
			});
		},
		set: async (key: string, value: any) => {
			return fs.promises.writeFile(`.cache/${key}`, value).catch((e) => {
				if (e.code === "ENOENT") {
					return null;
				}
				throw e;
			});
		},
	};
};

export const getRenderCache = async (
	type: "typst" | "typst-raw",
	value: any,
	preComputedHash?: string,
) => {
	const cache = getCache();
	if (!cache) {
		return null;
	}
	const hash = preComputedHash ?? hashValue(value);
	const res = await cache.get(`${type}:${hash}`);
	if (res) {
		return unpack(res);
	}
	return null;
};

export const setRenderCache = (
	type: "typst" | "typst-raw",
	value: any,
	result: any,
) => {
	const cache = getCache();
	if (!cache) {
		return null;
	}
	const hash = hashValue(value);
	return cache.set(`${type}:${hash}`, pack(result));
};

export const hashValue = (value: any) =>
	xxh64(new Uint8Array(pack(value))).toString(16);
