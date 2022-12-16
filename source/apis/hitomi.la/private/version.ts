import client from "modules/node.js/request";

export enum Directory {
	TAG = "tag",
	GALLERIES = "galleries",
	LANGUAGES = "languages",
	NOZOMIURL = "nozomiurl"
}

const cache = new Map<string, string>();

for (const directory of Object.values(Directory)) {
	// fetch
	client.GET(`https://ltn.hitomi.la/${directory}index/version?_=${Date.now()}`, "text").then((response) => {
		// assign
		cache.set(directory, response.body);
	});
}

export async function revision(directory: string) {
	// pause
	await until(() => Array.from(cache.values()).every((element) => element));

	switch (directory) {
		case Directory.TAG:
		case Directory.GALLERIES:
		case Directory.LANGUAGES:
		case Directory.NOZOMIURL: {
			return cache.get(directory);
		}
		default: {
			throw new Error();
		}
	}
}
