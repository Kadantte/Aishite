import client from "modules/node.js/request";

export enum Directory {
	TAG = "tag",
	GALLERIES = "galleries",
	LANGUAGES = "languages",
	NOZOMIURL = "nozomiurl"
}

let init = false;

const cache = new Map<string, string>();

for (const directory of Object.values(Directory)) {
	client.GET(`https://ltn.hitomi.la/${directory}index/version?_=${Date.now()}`, "text").then((response) => {
		// assign
		cache.set(directory, response.body);

		if (Array.from(cache.values()).every((element) => element)) {
			// update
			init = true;
		}
	});
}

export async function mirror(directory: Directory) {
	// pause
	await until(() => init);

	switch (directory) {
		case Directory.TAG:
		case Directory.GALLERIES:
		case Directory.LANGUAGES:
		case Directory.NOZOMIURL: {
			return cache.get(directory);
		}
		default: {
			throw Error();
		}
	}
}
