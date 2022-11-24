import client from "@/modules/node.js/request";

const sources = {
	default: "UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==",
	// animate: "UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=",
	// loseless: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
};
const support = {
	test: false,
	cache: true
};

let dependency: unknown;

export function canvas(source: string) {
	return unknown_0(source);
}
/**
 * @alias decode_webp.js
 * @see decode_webp
 */
async function unknown_0(source: string) {
	return new Promise<string>(async (resolve, reject) => {
		if (await unknown_1()) return resolve(source);
		const buffer = await unknown_2(source);
		const canvas = document.createElement("canvas");
		// @ts-ignore
		dependency.setCanvas(canvas);
		// @ts-ignore
		dependency.webpToSdl(buffer, buffer.length);
	
		return canvas.toDataURL();
	});
}
/**
 * @alias decode_webp.js
 * @see check_webp_support
 */
async function unknown_1() {
	if (support.test) {
		return support.cache;
	}
	function mystery_0(source: string) {
		return new Promise((resolve, reject) => {
			const image = document.createElement("img");

			image.addEventListener("load", () => resolve(true));
			image.addEventListener("error", () => resolve(false));

			image.src = "data:image/webp;base64," + source;
		});
	}
	// update
	support.cache = (await Promise.all(Object.keys(sources).map((key) => mystery_0(sources[key as keyof typeof sources])))).every((test) => test);

	if (!support.cache) {
		// @ts-ignore
		dependency = new (await import("https://ltn.hitomi.la/webp.js")).Webp();
		// @ts-ignore
		dependency.Module.doNotCaptureKeyboard = true;
	}
	// update
	support.test = true;

	return support.cache;
}
/**
 * @alias decode_webp.js
 * @see loadBinaryData
 */
async function unknown_2(url: string) {
	return new Uint8Array((await client.GET(url, "arraybuffer")).body);
}
