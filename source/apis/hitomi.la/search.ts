import client from "@/modules/node.js/request";

import { Tag } from "@/models/tag";
import { Pair } from "@/models/pair";
import { Endian } from "@/models/endian";

import { module as suggest } from "@/apis/hitomi.la/suggest";

import { Directory, mirror } from "@/apis/hitomi.la/private/version";

enum Symbol {
	//
	AND,
	PLUS,
	MINUS,
	UNIQUE,
	//
	L_PAREN,
	R_PAREN,
	//
	N_LITERAL,
	S_LITERAL,
	//
	IDENTIFIER,
	//
	EOF
}

class Token {
	constructor(
		public readonly type: Symbol,
		public readonly value?: unknown
	) { }

	public toString() {
		// skip
		if (this.value) return { type: Symbol[this.type], value: this.value };

		return { type: Symbol[this.type] };
	}
}

class Parser {
	private _index: number;
	private _table: Map<string, Nullable<Set<number>>>;
	private _tokens: Array<Token>;

	constructor(unprocessed: string) {
		// clean up
		unprocessed = unprocessed.trim();

		this._index = 0;
		this._table = new Map();
		this._tokens = new Array();

		let index = 0;

		const process = (symbol: Symbol) => {
			// update
			this._tokens.push(new Token(symbol));

			switch (symbol) {
				default: {
					index += 1;
					break;
				}
			}
		}
		const exception = () => {
			throw Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
		}

		while (index < unprocessed.length) {
			switch (unprocessed.at(index)) {
				case "&": { process(Symbol.AND); continue; }
				case "+": { process(Symbol.PLUS); continue; }
				case "-": { process(Symbol.MINUS); continue; }
				case "?": { process(Symbol.UNIQUE); continue; }
				case "(": { process(Symbol.L_PAREN); continue; }
				case ")": { process(Symbol.R_PAREN); continue; }
				case space: { index++; continue; }
			}
			// cache
			const chunk = unprocessed.substring(index);

			let match: Nullable<RegExpExecArray>;

			// number
			if ((match = /^[\d]+/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.N_LITERAL, Number(match[0])));
				index += match[0].length;
				continue;
			}
			// string
			if ((match = /^"([^"]*)"/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.S_LITERAL, match[1]));
				index += match[0].length;
				continue;
			}
			// identifier
			if ((match = /^[\w]+/.exec(chunk)) !== null) {
				this._tokens.push(new Token(Symbol.IDENTIFIER, match[0]));
				index += match[0].length;
				continue;
			}
			// nani?
			return exception();
		}
		// close
		this._tokens.push(new Token(Symbol.EOF));

		for (const token of this._tokens) {
			print(token.toString());
		}
	}
	protected peek() {
		return this._tokens[this._index];
	}
	protected skip(value: number = 1) {
		// increase
		this._index += value;
	}
	protected grace(index = this._index) {
		return new Pair(this._tokens[index], this._tokens[index + (/* L_PAREN */ 1) + (/* LITERAL */ 1)]);
	}
	public async parse() {
		// empty
		if (this._tokens.isEmpty()) return this.fallback();

		let index = 0;
		// mapping
		while (index < this._tokens.length) {
			switch (this._tokens[index].type) {
				case Symbol.IDENTIFIER: {
					// cache
					const fragment = this.grace(index);
					// key
					const namespace = fragment.first.value + ":" + fragment.second.value;

					if (!this._table.has(namespace)) {
						// assign key
						this._table.set(namespace, null);

						unknown_1(fragment.first.value as string, fragment.second.value as string).then((response) => {
							// assign value
							this._table.set(namespace, new Set(response));
						});
					}
					index += 1 + 1 + 1 + 1;
					break;
				}
				default: {
					index += 1;
					break;
				}
			}
		}
		// wait for cache
		await until(() => Array.from(this._table.values()).every((element) => element));

		try {
			return this.E();
		} catch {
			return this.fallback();
		}
	}
	protected E() {
		let value = new Set<number>();

		value = this.T();

		while (true) {
			switch (this.peek().type) {
				case Symbol.AND:
				case Symbol.PLUS:
				case Symbol.MINUS:
				case Symbol.UNIQUE: {
					break;
				}
				default: {
					return value;
				}
			}
			const token = this.peek();

			this.skip();

			const _value = this.T();

			switch (token.type) {
				case Symbol.AND: {
					for (const element of value.values()) {
						if (!_value.has(element)) value.delete(element);
					}
					break;
				}
				case Symbol.PLUS: {
					for (const element of _value.values()) {
						value.add(element);
					}
					break;
				}
				case Symbol.MINUS: {
					for (const element of _value.values()) {
						value.delete(element);
					}
					break;
				}
				case Symbol.UNIQUE: {
					for (const element of value.values()) {
						if (_value.has(element)) value.delete(element);
					}
					break;
				}
			}
		}
	}
	protected T() {
		let value = new Set<number>();

		switch (this.peek().type) {
			case Symbol.IDENTIFIER: {
				// compute
				value = this.F();
				break;
			}
			case Symbol.L_PAREN: {
				// raise
				this.skip();
				// compute
				value = this.E();
				break;
			}
		}
		// raise
		this.skip();

		return value;
	}
	protected F() {
		// cache
		const fragment = this.grace();
		// raise
		this.skip(3); // L_PAREN, LITERAL, R_PAREN

		return this._table.get(fragment.first.value + ":" + fragment.second.value)!;
	}
	protected async fallback() {
		return new Set(await unknown_0(null, new Tag({ namespace: "index", value: "all" })));
	}
}

async function unknown_0(directory: Nullable<string>, tag: Tag) {
	const response = await client.GET(`https://${["ltn.hitomi.la", "n", directory, `${tag.namespace}-${tag.value}`].filter((element) => element).join("/")}.nozomi`, "arraybuffer");

	switch (response.status.code) {
		case 200:
		case 206: {
			const binary = new DataView(response.body);

			return new Array(Math.floor(binary.byteLength / 4)).fill(null).map((_, index) => binary.getInt32(index * 4, Endian.BIG));
		}
	}
	return [];
}

async function unknown_1(namespace: string, value: string | number) {
	// clean up
	value = value.toString().replace(/_/g, space);

	switch (namespace) {
		case "id": {
			return [Number(value)];
		}
		case "male":
		case "female": {
			return unknown_0("tag", new Tag({ namespace: namespace + ":" + value, value: "all" }));
		}
		case "title": {
			try {
				const bundle = await suggest.unknown_3("galleries", 0);
				const digits = await suggest.unknown_5("galleries", suggest.unknown_1(value), bundle);
				return unknown_2(digits);
			} catch {
				return [];
			}
		}
		case "language": {
			return unknown_0(null, new Tag({ namespace: "index", value: value }));
		}
		default: {
			return unknown_0(namespace, new Tag({ namespace: value, value: "all" }));
		}
	}
}

async function unknown_2(digits: Pair<number, number>) {
	// check before request
	if (!(0 < digits.second && digits.second <= 10000000 * 10)) throw Error();

	const response = await suggest.unknown_4(`https://ltn.hitomi.la/galleriesindex/galleries.${await mirror(Directory.GALLERIES)}.data`, digits.first, digits.first + digits.second - 1);

	const table = new DataView(response.buffer);
	const length = table.getInt32(0, Endian.BIG);

	if (!(0 < length && length <= 10000000)) throw Error();
	if (response.byteLength !== length * 4 + 4) throw Error();

	return new Array(length).fill(null).map((_, index) => table.getInt32((index + 1) * 4, Endian.BIG));
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
	query: (unprocessed: string) => {
		return (new Parser(unprocessed)).parse();
	}
};

export default search;
