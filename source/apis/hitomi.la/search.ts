import client from "@/modules/node.js/request";

import { Tag } from "@/models/tag";
import { Pair } from "@/models/pair";
import { Endian } from "@/models/endian";

import { module as suggest } from "@/apis/hitomi.la/suggest";

import { Directory, mirror } from "@/apis/hitomi.la/private/version";

enum Prefix {
	OR,
	ADD,
	REMOVE
}

class Syntax {
	private readonly pattern = Array<boolean>();
	private readonly brackets = Array<Prefix>();

	public integrity() {
		this.one();
		this.two();
		this.three();
	}
	public open(prefix: Prefix) {
		this.pattern.add(true);
		this.brackets.add(prefix);
	}
	public close(prefix: Prefix) {
		if (this.brackets.isEmpty()) throw Error();
		if (this.brackets.last !== prefix) throw Error();

		this.pattern.add(false);
		this.brackets.pop();
	}
	private one() {
		switch (this.pattern.length % 2) {
			case 0: {
				break;
			}
			default: {
				throw Error();
			}
		}
	}
	private two() {
		for (let index = 0; index < this.pattern.length; index++) {
			switch (index % 2) {
				case 0: {
					if (!this.pattern[index] && this.pattern[index + 1]) throw Error();
					break;
				}
			}
		}
	}
	private three() {
		if (this.pattern.filter((element) => element).length !== this.pattern.filter((element) => !element).length) throw Error();
	}
}

async function query(query: string, fallback: boolean = true): Promise<Set<number>> {
	// avoid bottleneck
	const cache = new Map<string, Nullable<Set<number>>>();
	const syntax = new Syntax();

	let memory: Nullable<string> = null;

	try {
		for (const char of (query + space).split("")) {
			switch (char) {
				case "(": {
					syntax.open(Prefix.OR);
					break;
				}
				case "{": {
					syntax.open(Prefix.ADD);
					break;
				}
				case "[": {
					syntax.open(Prefix.REMOVE);
					break;
				}
				case ")": {
					syntax.close(Prefix.OR);
					break;
				}
				case "}": {
					syntax.close(Prefix.ADD);
					break;
				}
				case "]": {
					syntax.close(Prefix.REMOVE);
					break;
				}
				case "&":
				case "+":
				case "-": {
					break;
				}
				case "\u0020": {
					// cache
					const string = memory ?? "";

					if (string.isEmpty()) break;

					if (!cache.has(string)) {
						// assign key
						cache.set(string, null);

						unknown_1(string).then((response) => {
							// assign value
							cache.set(string, new Set(response));
						});
					}
					memory = null;
					break;
				}
				default: {
					if (memory) {
						memory += char
					} else {
						memory = char;
					}
					break;
				}
			}
		}
		// validate
		syntax.integrity();
	} catch {
		return fallback ? new Set(await unknown_0(null, new Tag({ namespace: "index", value: "all" }))) : new Set();
	}
	// wait for cache
	await until(() => Array.from(cache.values()).every((element) => element));

	function recursive(prefix: Prefix, string: string): Set<number> {
		// tracker
		let open = 0;
		let close = 0;

		let buffer: Nullable<string> = null;

		let header: Nullable<Prefix> = null;
		let closure: Nullable<Prefix> = null;

		const collection = new Set<number>();

		function write(value: string) {
			if (buffer) {
				buffer += value;
			} else {
				buffer = value;
			}
		}

		function adjust(start: boolean, write: boolean) {
			const string = buffer?.replace(start ? /^[&+-]/ : /[&+-]$/, "") ?? "";

			if (write) {
				buffer = string;
			}
			return string;
		}

		function calculate(prefix: Prefix, _collection: Set<number>) {
			switch (prefix === Prefix.OR && collection.isEmpty() ? Prefix.ADD : prefix) {
				case Prefix.OR: {
					for (const element of collection.values()) {
						if (!_collection.has(element)) collection.delete(element);
					}
					break;
				}
				case Prefix.ADD: {
					for (const element of _collection.values()) {
						collection.add(element);
					}
					break;
				}
				case Prefix.REMOVE: {
					for (const element of _collection.values()) {
						collection.delete(element);
					}
					break;
				}
			}
		}

		for (const char of string.split("")) {
			switch (char) {
				case "(":
				case "{":
				case "[": {
					open++;
					// skip first bracket
					// (open > 1)
					if (closure == null) {
						// update
						closure = char === "(" ? Prefix.OR : char === "{" ? Prefix.ADD : Prefix.REMOVE;
						// adjust
						adjust(false, true);
						break;
					}
					write(char);
					break;
				}
				case ")":
				case "}":
				case "]": {
					close++;
					// skip final bracket
					if (open > close) {
						write(char);
						break;
					}
					// brackets close
					if (open == close) {
						// compute
						calculate(header ?? prefix, recursive(closure ?? Prefix.OR, buffer + space));
						// reset
						open = 0;
						close = 0;
						// buffer
						buffer = null;
					}
					break;
				}
				case "&":
				case "+":
				case "-": {
					if (open == 0 && close == 0) header ??= char === "&" ? Prefix.OR : char === "+" ? Prefix.ADD : Prefix.REMOVE;
					write(char);
					break;
				}
				case "\u0020": {
					const string = adjust(true, false);

					if (string.isEmpty()) break;

					if (open == 0 && close == 0) {
						// sometimes its false...
						if (cache.has(string)) {
							calculate(header ?? closure ?? prefix, cache.get(string)!);
						}
						// reset
						header = null;
						buffer = null;
						break;
					}
					write(char);
					break;
				}
				default: {
					write(char);
					break;
				}
			}
		}
		return collection;
	}
	// cache
	const collection = recursive(Prefix.OR, query + space);

	return fallback && collection.isEmpty() ? new Set(await unknown_0(null, new Tag({ namespace: "index", value: "all" }))) : collection;
}

async function unknown_0(directory: Nullable<string>, tag: Tag) {
	const response = await client.GET(`https://${["ltn.hitomi.la", "n", directory, `${tag.namespace}-${tag.value}`].filter((element) => element).join("/")}.nozomi`, "arraybuffer");

	switch (response.status.code) {
		case 200:
		case 206: {
			const binary = new DataView(response.body);

			return Array(Math.floor(binary.byteLength / 4)).fill(null).map((_, index) => binary.getInt32(index * 4, Endian.BIG));
		}
	}
	return [];
}

async function unknown_1(query: string) {
	if (query.includes(":")) {
		//
		// 0: key
		// 0: value
		//
		const fragment = query.replace(/_/g, "\u0020").split(":") as [string, string];

		switch (fragment[0]) {
			case "id": {
				return [Number(fragment[1])];
			}
			case "male":
			case "female": {
				return unknown_0("tag", new Tag({ namespace: fragment.join(":"), value: "all" }));
			}
			case "language": {
				return unknown_0(null, new Tag({ namespace: "index", value: fragment[1] }));
			}
			default: {
				return unknown_0(fragment[0], new Tag({ namespace: fragment[1], value: "all" }));
			}
		}
	}
	// fallback
	try {
		const bundle = await suggest.unknown_3("galleries", 0);
		const digits = await suggest.unknown_5("galleries", suggest.unknown_1(query.replace(/_/g, space)), bundle);
		return unknown_2(digits);
	} catch {
		return [];
	}
}

async function unknown_2(digits: Pair<number, number>) {
	// check before request
	if (digits.second <= 0 || digits.second > 100000000) throw Error();

	const response = await suggest.unknown_4(`https://ltn.hitomi.la/galleriesindex/galleries.${await mirror(Directory.GALLERIES)}.data`, digits.first, digits.first + digits.second - 1);

	const table = new DataView(response.buffer);
	const length = table.getInt32(0, Endian.BIG);

	if (length > 10000000 || 10000000 <= 0) throw Error();
	if (response.byteLength !== length * 4 + 4) throw Error();

	return Array(length).fill(null).map((_, index) => table.getInt32((index + 1) * 4, Endian.BIG));
}

class JavaScriptModule {
	/** @alias get_galleryids_from_nozomi */
	public unknown_0(...args: Parameters<typeof unknown_0>) { return unknown_0(...args); }
	/** @alias get_galleryids_from_query */
	public unknown_1(...args: Parameters<typeof unknown_1>) { return unknown_1(...args); }
	/** @alias get_galleryids_from_data */
	public unknown_2(...args: Parameters<typeof unknown_2>) { return unknown_2(...args); }
}

export const module = new JavaScriptModule();

const search = {
	query: query
};

export default search;
