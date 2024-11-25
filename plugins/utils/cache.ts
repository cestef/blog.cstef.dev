import KeyV from "keyv";
import { pack, unpack } from "msgpackr";
import { xxh64 } from "@node-rs/xxhash";

export const keyv: {
	current: KeyV | null;
} = { current: null };

export const getCache = () => {
	if (process.env.NODE_ENV !== "development") {
		return null;
	}
	if (!keyv.current) {
		keyv.current = new KeyV();
	}
	return keyv.current;
};

export const getRenderCache = async (
	type: "typst" | "typst-raw",
	value: any,
) => {
	const cache = getCache();
	if (!cache) {
		return null;
	}
	const hash = xxh64(new Uint8Array(pack(value))).toString(16);
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
	const hash = xxh64(new Uint8Array(pack(value))).toString(16);
	return cache.set(`${type}:${hash}`, pack(result));
};
