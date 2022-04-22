import request from "@/modules/request";

import Tag from "@/models/tag";
import { Gallery, GalleryFile } from "@/models/gallery";

let gg_js: Nullable<string> = null;
let common_js: Nullable<string> = null;

const cache = new Map<number, _Gallery>();

request.GET("https://ltn.hitomi.la/gg.js", "text").then((response) => {
	gg_js = "var\u0020gg;" + response.body.split("\n").filter((section) => !/if\s\([\D\d]+\)\s{\sreturn\s[\d]+;\s}/.test(section)).join("\n");
});

request.GET("https://ltn.hitomi.la/common.js", "text").then((response) => {
	common_js = response.body.split("\nfunction\u0020").filter((section) => /^(subdomain_from_url|url_from_url|full_path_from_hash|real_full_path_from_hash|url_from_hash|url_from_url_from_hash|rewrite_tn_paths)/.test(section)).map((section) => `function\u0020${section}`).join("");
});

class _Gallery extends Gallery {
	public readonly characters: Array<string>;

	declare protected cache?: Array<_GalleryFile>;

	constructor(args: Args<_Gallery>) {
		super(args);

		this.characters = args.characters;
	}
	public getURL() {
		return `https://hitomi.la/galleries/${this.id}.html`;
	}
	public async getFiles(): Promise<Array<_GalleryFile>> {
		if (this.cache) return this.cache;

		const response = await request.GET(`https://ltn.hitomi.la/galleries/${this.id}.js`, "text");

		const metadata = JSON.parse(response.body.replace(/^var\sgalleryinfo\s=\s/, ""));

		const cache = Array<_GalleryFile>();

		await until(() => !!gg_js && !!common_js);

		for (let index = 0; index < metadata["files"].length; index++) {
			cache.add(new _GalleryFile({
				url: eval(gg_js! + common_js! + "url_from_url_from_hash(this.id, metadata[\"files\"][index], \"webp\", undefined, \"a\")"),
				name: metadata["files"][index]["name"],
				width: metadata["files"][index]["width"],
				height: metadata["files"][index]["height"]
			}));
		}
		// update
		this.cache = cache;

		return cache;
	}
}

class _GalleryFile extends GalleryFile {
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: Args<_GalleryFile>) {
		super(args);

		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

export async function GalleryInfo(id: number): Promise<_Gallery> {
	if (cache.has(id)) return cache.get(id)!;

	const response = await request.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, "text");

	await until(() => !!gg_js && !!common_js);

	let index = 0;

	const metadata = new Map<string, any>();

	const document = new DOMParser().parseFromString(eval(gg_js! + common_js! + "rewrite_tn_paths(response.body)"), "text/html");

	function parse(string: Nullable<string>, isQuery: boolean, toList: true): Array<string>;
	function parse(string: Nullable<string>, isQuery: boolean, toList: false): string;
	function parse(string: Nullable<string>, isQuery: boolean, toList: boolean) {
		// cache
		const sigma = isQuery && string ? (document.querySelector(string) as HTMLElement).innerText : string;

		if (!sigma) return toList ? ["N/A"] : "N/A";

		if (toList) {
			// cache
			const origin = sigma.split(/\s\s+/).filter((element) => !element.isEmpty());

			return origin.isEmpty() ? ["N/A"] : origin;
		}
		return sigma.replace(/\s\s+/g, "");
	}

	function tags(array: Nullable<Array<string>>): _Gallery["tags"] {
		if (!array) return [];

		const sigma = Array();

		for (const value of Object.values(array)) {
			sigma.add(value === "N/A" ? value : new Tag({ namespace: value.includes("♂") ? "male" : value.includes("♀") ? "female" : "tag", value: value.replace(/\s?[♂♀]$/, "").replace(/\s/g, "_") }));
		}
		return sigma;
	}

	for (const element of document.querySelectorAll("td")) {
		switch (index % 2) {
			case 0: {
				metadata.set(element.innerText.toLowerCase(), null);
				break;
			}
			default: {
				// @ts-ignore
				metadata.set(Array.from(metadata.keys()).last, parse(element.innerText, false, Array.from(metadata.keys()).last === "tags"));
				break;
			}
		}
		index++;
	}
	// update
	cache.set(id, new _Gallery({
		id: id,
		type: metadata.get("type"),
		title: parse(".lillie a", true, false),
		group: metadata.get("group"),
		series: metadata.get("series"),
		artists: parse(".artist-list", true, true),
		language: metadata.get("language"),
		thumbnail: Object.values(document.querySelectorAll("picture > img, picture > source")).map((element) => element.getAttribute("data-srcset")?.split("\u0020").filter((text) => /^\/\//.test(text)) ?? [element.getAttribute("data-src")]).flat().map((url) => `https:${url}`),
		characters: metadata.get("character"),
		tags: tags(metadata.get("tags")),
		date: parse(".date", true, false)
	}));
	
	return cache.get(id)!;
}
