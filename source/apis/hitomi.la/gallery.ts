import client from "modules/node.js/request";

import { Tag } from "models/tag";
import { Gallery as G, GalleryFile as GF } from "models/gallery";

let gg_js: string;
let common_js: string;

client.GET("https://ltn.hitomi.la/gg.js", "text").then((response) => {
	// update
	gg_js = "var\u0020gg;" + response.body.split("\n").filter((section) => !/if\s\([\D\d]+\)\s{\sreturn\s[\d]+;\s}/.test(section)).join("\n");
});

client.GET("https://ltn.hitomi.la/common.js", "text").then((response) => {
	// update
	common_js = response.body.split("\nfunction\u0020").filter((section) => /^(subdomain_from_url|url_from_url|full_path_from_hash|real_full_path_from_hash|url_from_hash|url_from_url_from_hash|rewrite_tn_paths)/.test(section)).map((section) => "function" + space + section).join("");
});

class Gallery extends G {
	public readonly characters: Array<string>;

	constructor(args: Args<Gallery>) {
		super(args);

		this.characters = args.characters;
	}
	public URL() {
		return `https://hitomi.la/galleries/${this.id}.html`;
	}
	public async files(): Promise<Array<GalleryFile>> {
		// cache
		const response = await client.GET(`https://ltn.hitomi.la/galleries/${this.id}.js`, "text");

		const metadata = JSON.parse(response.body.replace(/^var\sgalleryinfo\s=\s/, ""));

		const cache = new Array<GalleryFile>();

		await until(() => gg_js !== undefined && common_js !== undefined);

		for (const file of metadata["files"]) {
			cache.push(new GalleryFile({ url: await execute(gg_js + common_js + "url_from_url_from_hash(id, file, \"webp\", undefined, \"a\");", { id: this.id, file: file }) as string, name: file["name"], width: file["width"], height: file["height"] }));
		}
		return cache;
	}
}

class GalleryFile extends GF {
	public readonly name: string;
	public readonly width: number;
	public readonly height: number;

	constructor(args: Args<GalleryFile>) {
		super(args);

		this.name = args.name;
		this.width = args.width;
		this.height = args.height;
	}
}

export async function gallery(id: number) {
	// cache
	const response = await client.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, "text");

	await until(() => gg_js !== undefined && common_js !== undefined);

	const element = new DOMParser().parseFromString((await execute(gg_js + common_js + "rewrite_tn_paths(response.body);", { response: response }) as string).replace(/\s\s+/g, "").replace(/\n/g, ""), "text/html");

	const metadata = new Map<string, unknown>(Object.entries({}));

	function property(namespace: string) {
		return element.querySelector(`*[href*="/${namespace}"]`)?.textContent;
	}

	metadata.set("type", property("type"));

	metadata.set("title", element.querySelector(".lillie a")?.textContent);

	metadata.set("group", property("group"));

	metadata.set("series", property("series"));

	metadata.set("artists", Array.from(element.getElementsByClassName("artist-list")).map((source) => source.textContent));

	metadata.set("language", property("index"));

	metadata.set("thumbnail", Array.from(element.getElementsByClassName("lazyload")).map((source) => "https:" + source.getAttribute("data-src")));

	metadata.set("characters", property("characters"));

	metadata.set("tags", Array.from(element.querySelectorAll("*[href*=\"/tag/\"]")).map((source) => {
		// cache
		const text = source.textContent!;

		return new Tag({ namespace: text.includes("♂") ? "male" : text.includes("♀") ? "female" : "tag", value: text.replace(/[♂♀]/, "").replace(/\s$/, "").replace(/\s/g, "_") });
	}));

	metadata.set("date", element.getElementsByClassName("date").item(0)?.textContent);

	return new Gallery({
		id: id,
		type: metadata.get("type") as Args<Gallery>["type"],
		title: metadata.get("title") as Args<Gallery>["title"],
		group: metadata.get("group") as Args<Gallery>["group"],
		parody: metadata.get("series") as Args<Gallery>["parody"],
		artists: metadata.get("artists") as Args<Gallery>["artists"],
		language: metadata.get("language") as Args<Gallery>["language"],
		thumbnail: metadata.get("thumbnail") as Args<Gallery>["thumbnail"],
		characters: metadata.get("characters") as Args<Gallery>["characters"],
		tags: metadata.get("tags") as Args<Gallery>["tags"],
		date: metadata.get("date") as Args<Gallery>["type"]
	});
}
