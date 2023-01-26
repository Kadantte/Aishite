import client from "modules/node.js/request";

import { Tag } from "models/tag";
import { Gallery as _Gallery } from "models/gallery";
import { GalleryFile as _GalleryFile } from "models/gallery";

let ggJS: string;
let commonJS: string;

client.GET("https://ltn.hitomi.la/gg.js", "text").then((response) => {
	ggJS = "var\u0020gg;" + response.body.split("\n").filter((section) => !/if\s\([\D\d]+\)\s{\sreturn\s[\d]+;\s}/.test(section)).join("\n");
});

client.GET("https://ltn.hitomi.la/common.js", "text").then((response) => {
	commonJS = response.body.split("\nfunction\u0020").filter((section) => /^(subdomain_from_url|url_from_url|full_path_from_hash|real_full_path_from_hash|url_from_hash|url_from_url_from_hash|rewrite_tn_paths)/.test(section)).map((section) => "function" + space + section).join("");
});

class Gallery extends _Gallery {
	public readonly characters: Array<string>;

	constructor(args: Args<Gallery>) {
		super(args);

		this.characters = args.characters;
	}
	public URL() {
		return `https://hitomi.la/galleries/${this.id}.html`;
	}
	public async files(): Promise<Array<GalleryFile>> {
		const response = await client.GET(`https://ltn.hitomi.la/galleries/${this.id}.js`, "text");

		const metadata = JSON.parse(response.body.replace(/^var\sgalleryinfo\s=\s/, ""));

		const cache = new Array<GalleryFile>();

		await until(() => ggJS !== undefined && commonJS !== undefined);

		for (const file of metadata["files"]) {
			cache.push(new GalleryFile({ url: await execute(ggJS + commonJS + "url_from_url_from_hash(id, file, file[\"hasavif\"] ? \"avif\" : \"webp\", undefined, \"a\");", { id: this.id, file: file }) as string, name: file["name"], width: file["width"], height: file["height"] }));
		}
		return cache;
	}
}

class GalleryFile extends _GalleryFile {
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

export type gallery = Await<ReturnType<typeof gallery>>;

export async function gallery(id: number) {
	const response = await client.GET(`https://ltn.hitomi.la/galleryblock/${id}.html`, "text");

	await until(() => ggJS !== undefined && commonJS !== undefined);

	const [element, metadata] = [new DOMParser().parseFromString((await execute(ggJS + commonJS + "rewrite_tn_paths(response.body);", { response: response }) as string).replace(/\s\s+/g, "").replace(/\n/g, ""), "text/html"), {} as Record<keyof Gallery, unknown>];

	function get(key: string) {
		return element.querySelector(`*[href*="/${key}"]`)?.textContent;
	}

	metadata.id = id;
	metadata.type = get("type");
	metadata.title = element.querySelector(".lillie a")?.textContent ?? "N/A";
	metadata.group = get("group");
	metadata.parody = get("series");
	metadata.artists = Array.from(element.getElementsByClassName("artist-list")).map((source) => source.textContent);
	metadata.language = get("index");
	metadata.thumbnail = Array.from(element.getElementsByClassName("lazyload")).map((source) => "https:" + source.getAttribute("data-src"));
	metadata.characters = get("characters");
	metadata.tags = Array.from(element.querySelectorAll("*[href*=\"/tag/\"]")).map((source) => {
		// can this be null..?
		if (!source.textContent) throw new Error();

		return new Tag({ key: source.textContent.includes("♂") ? "male" : source.textContent.includes("♀") ? "female" : "tag", value: source.textContent.replace("♂", "").replace("♀", "").replace(/\s$/, "").replace(/\s/g, "_") });
	});
	metadata.date = element.getElementsByClassName("date").item(0)?.textContent ?? "N/A";

	return new Gallery(metadata as Gallery);
}
