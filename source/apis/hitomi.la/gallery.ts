// modules
import request from "@/modules/request";

export enum Category {
	ID = "id",
	TYPE = "type",
	CHARACTER = "character",
	LANGUAGE = "language",
	POPULAR = "popular",
	SERIES = "series",
	ARTIST = "artist",
	GROUP = "group",
	TAG = "tag",
	MALE = "male",
	FEMALE = "female"
}

export class GalleryTag {
	public readonly type: Category;
	public readonly value: string;

	constructor(args: Args<GalleryTag>) {
		this.type = args.type;
		this.value = args.value;
	}
	public toURL() {
		switch (this.type) {
			case Category.LANGUAGE: {
				return `https://ltn.hitomi.la/index-${this.value}.nozomi`;
			}
			case Category.MALE:
			case Category.FEMALE: {
				return `https://ltn.hitomi.la/tag/${this.type}:${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
			default: {
				return `https://ltn.hitomi.la/${this.type}/${this.value.replace(/_/g, "%20")}-all.nozomi`;
			}
		}
	}
	public toString() {
		return `${this.type}:${this.value}`;
	}
}

export class GalleryFile {
	public readonly url: string;
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: Args<GalleryFile>) {
		this.url = args.url;
		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

export type GalleryBlock = {
	readonly id: number;
	readonly type: string;
	readonly title: string;
	readonly language: string;
	readonly thumbnail: Array<String>;
	readonly character?: Array<string>;
	readonly artist?: Array<string>;
	readonly series?: string;
	readonly group?: string;
	readonly tags?: Array<GalleryTag>;
	readonly date: string;
}

export type GalleryScript = {
	readonly id: string;
	readonly type: string;
	readonly title: string;
	readonly language: string;
	readonly files: Array<GalleryFile>;
	readonly tags?: Array<GalleryTag>;
	readonly date: string;
}

let common_js: Nullable<string> = null;

request.GET("https://ltn.hitomi.la/common.js", "text").then((response_0) => {
	// your mom is GG
	request.GET("https://ltn.hitomi.la/gg.js", "text").then((response_1) => {
		// prevent potential exploits
		if (/(eval|require)/g.test(response_0.body + response_1.body)) {
			throw new Error("Remote code execution attempt detected");
		}
		common_js = "var\u0020gg;\n" + response_0.body.split(/\nfunction\s/g).filter((section) => new RegExp(`^(${["subdomain_from_url", "url_from_url", "full_path_from_hash", "real_full_path_from_hash", "url_from_hash", "url_from_url_from_hash", "rewrite_tn_paths"].join("|")})`).test(section)).map((section) => "function\u0020" + section).join("\n") + response_1.body.split("\n").filter((section) => !/if\s\([\D\d]+\)\s{\sreturn\s[\d]+;\s}/.test(section)).join("\n");

		console.debug(common_js);
	});
});

export async function GalleryBlock(id: number): Promise<GalleryBlock> {
	const response = await request.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, "text");

	switch (response.status.code) {
		case 404: {
			throw new Error("ERROR 404");
		}
	}
	const block: Record<string, Array<string>> = {};

	await until(() => common_js !== null);

	const document: Document = new DOMParser().parseFromString(eval(common_js + "rewrite_tn_paths(response.body)"), "text/html");

	let index = 0;

	for (const element of document.querySelectorAll("td")) {
		if (index % 2 === 0) {
			block[element.innerText.toLowerCase()] = [];
		} else {
			block[Object.keys(block).last!]!.add(...element.innerText.split(/\s\s+/).filter((fragment) => fragment.length));
		}
		index++;
	}

	for (const extractor of Object.values([{ "name": "title", "query": "h1" }, { "name": "artist", "query": ".artist-list" }, { "name": "date", "query": ".date" }])) {
		block[extractor.name] = Object.values(document.querySelectorAll(extractor.query)).map((element) => (element as HTMLElement).innerText ?? "N/A");
	}

	return {
		id: id,
		type: block["type"][0],
		title: block["title"][0],
		group: block["group"]?.[0],
		series: block["series"]?.[0],
		language: block["language"][0],
		thumbnail: Object.values(document.querySelectorAll("picture > img, picture > source")).map((element) => element.getAttribute("data-srcset")?.split(/\s/).filter((text) => /^\/\//.test(text)) ?? [element.getAttribute("data-src")]).flat().map((text) => `https:${text}`),
		character: block["character"],
		artist: block["artist"],
		tags: block["tags"].map((tag) => new GalleryTag({type: /♂$/.test(tag) ? Category.MALE : /♀$/.test(tag) ? Category.FEMALE : Category.TAG, value: tag.replace(/\s?[♂♀]$/, "").replace(/\s/g, "_")})),
		date: block["date"][0]
	};
}
/**
 * @alias reader.js
 * @see make_image_element
 */
export async function GalleryScript(id: number): Promise<GalleryScript> {
	const response = await request.GET(`https://ltn.hitomi.la/galleries/${id}.js`, "text");

	switch (response.status.code) {
		case 404: {
			throw new Error("ERROR 404");
		}
	}
	const script = JSON.parse(response.body.replace(/^var\sgalleryinfo\s=\s/, ""));

	await until(() => common_js !== null);

	return {
		id: script["id"],
		type: script["type"],
		title: script["title"],
		language: script["language"],
		files: (script["files"] as Array<any> ?? []).map((file) => new GalleryFile({url: eval(common_js + "url_from_url_from_hash(id, file, \"webp\", undefined, \"a\")"),name: file["name"],width: file["width"],height: file["height"]})),
		tags: (script["tags"] as Array<any> ?? []).map((tag) => new GalleryTag({type: tag["male"] ? tag["female"] ? Category.TAG : Category.MALE : Category.FEMALE, value: tag["tag"] })),
		date: script["date"]
	};
}
