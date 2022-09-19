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
	COMMA,
	//
	EQUAL,
	N_EQUAL,
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

enum Channel {
	PROPERTY,
	FUNCTION
}

class Token {
	constructor(
		public readonly type: Symbol,
		public readonly value: unknown = undefined
	) { }
	public is(type: Symbol) {
		return this.type === type;
	}
}

class Parser {
	private _index: number;
	private _table: Map<string, Set<number>>;
	private _tokens: Array<Token>;

	constructor(unprocessed: string) {
		// clean up
		unprocessed = unprocessed.trim();

		this._index = 0;
		this._table = new Map();
		this._tokens = new Array();

		let index = 0;

		function process(instance: Parser, symbol: Symbol) {
			// update
			instance._tokens.push(new Token(symbol));

			switch (symbol) {
				case Symbol.N_EQUAL: {
					index += 2;
					break;
				}
				default: {
					index += 1;
					break;
				}
			}
		}

		function exception(): never {
			throw Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
		}

		try {
			while (index < unprocessed.length) {
				switch (unprocessed.at(index)) {
					case "&": { process(this, Symbol.AND); continue; }
					case "+": { process(this, Symbol.PLUS); continue; }
					case "=": { process(this, Symbol.EQUAL); continue; }
					case "-": { process(this, Symbol.MINUS); continue; }
					case ",": { process(this, Symbol.COMMA); continue; }
					case "(": { process(this, Symbol.L_PAREN); continue; }
					case ")": { process(this, Symbol.R_PAREN); continue; }
					case "!": {
						if (unprocessed.at(index + 1) === "=") {
							process(this, Symbol.N_EQUAL);
							continue;
						}
						// nani?
						return exception();
					}
					case space: { index++; continue; }
				}
				// cache
				const chunk = unprocessed.substring(index);

				let match: Nullable<RegExpExecArray>;

				// number
				if ((match = /^[-?\d]+/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Symbol.N_LITERAL, Number(match[0])));
					index += match[0].length;
					continue;
				}
				// string
				if ((match = /^"([^"]*)"/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Symbol.S_LITERAL, String(match[1])));
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

			// debug
			for (const token of this._tokens) {
				print(token.value ? { type: Symbol[token.type], value: token.value } : { type: Symbol[token.type] });
			}
		} catch (error) {
			// debug
			print(error);
			// reset
			this._tokens = [];
		}
	}
	protected peek() {
		return this._tokens[this._index];
	}
	protected skip(value: number = 1) {
		// increase
		this._index += value;

		return this.peek();
	}
	public async parse() {
		// empty
		if (this._tokens.isEmpty()) return this.fallback();
		
		try {
			// cache
			const value = await this.E();

			return value.isEmpty() ? this.fallback() : value;
		} catch (error) {
			// debug
			print(`Could not process token at position ${this._index}`); print(error);

			return this.fallback();
		}
	}
	protected async E() {
		let value = new Set<number>();

		value = await this.T();

		while (true) {
			switch (this.peek().type) {
				case Symbol.AND:
				case Symbol.PLUS:
				case Symbol.MINUS: {
					break;
				}
				default: {
					return value;
				}
			}
			const token = this.peek();

			this.skip();

			const _value = await this.T();

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
			}
		}
	}
	protected async T() {
		let value = new Set<number>();

		switch (this.peek().type) {
			case Symbol.IDENTIFIER: {
				// compute
				value = await this.I();
				break;
			}
			case Symbol.L_PAREN: {
				// raise
				this.skip();
				// compute
				value = await this.E();
				break;
			}
		}
		// raise
		this.skip();

		return value;
	}
	protected async I(): Promise<Set<number>> {
		const token = this.peek(), handle = built_in(token.value as string);

		if (handle === null) {
			throw Error();
		}
		else if (handle instanceof HandleProperty) {
			switch (this.skip().type) {
				case Symbol.EQUAL: {
					// cache
					const key = token.value as string + "==" + this.skip().value;

					if (this._table.has(key)) return this._table.get(key)!;

					const value = await handle.call(this.peek());

					this._table.set(key, value);

					return value;
				}
				case Symbol.N_EQUAL: {
					// cache
					const key = token.value as string + "!=" + this.skip().value;

					if (this._table.has(key)) return this._table.get(key)!;

					const value = await this.fallback();

					for (const element of (await handle.call(this.peek())).values()) {
						value.delete(element);
					}
					this._table.set(key, value);

					return value;
				}
				default: {
					throw Error();
				}
			}
		}
		else if (handle instanceof HandleFunction) {
			// open
			if (!this.skip().is(Symbol.L_PAREN)) throw Error();

			const token: Array<Token> = [];

			while (token.length < handle.length) {
				// update
				token.add(this.skip());
				// check
				if (token.length < handle.length && !this.skip().is(Symbol.COMMA)) throw Error();
			}
			// close
			if (!this.skip().is(Symbol.R_PAREN)) throw Error();

			return handle.call(...token);
		}
		else {
			throw Error();
		}
	}
	protected async fallback(): Promise<Set<number>> {
		// cache
		if (!this._table.has("language==all")) this._table.set("language==all", new Set(await unknown_0(null, new Tag({ namespace: "index", value: "all" }))));

		return this._table.get("language==all")!;
	}
}

class HandleProperty {
	constructor(
		private readonly type: Symbol,
		private readonly handle: (token: Token) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(token: Token) {
		if (!token.is(this.type)) throw Error(`Could not match symbol, ${Symbol[token.type]} is not ${Symbol[this.type]}`);

		return new Set(await this.handle(token));
	}
}

class HandleFunction {
	constructor(
		private readonly type: Array<Symbol>,
		private readonly handle: (...token: Array<Token>) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(...token: Array<Token>) {
		for (let index = 0; index < token.length; index++) {
			if (!token[index].is(this.type[index])) throw Error(`Could not match symbol, ${Symbol[token[index].type]} is not ${Symbol[this.type[index]]}`);
		}
		return new Set(await this.handle(...token));
	}
	public get length() {
		return this.type.length;
	}
}

function built_in(namespace: string) {
	switch (namespace) {
		// property
		case "id": {
			return new HandleProperty(Symbol.N_LITERAL, async (token_0) => [token_0.value as number]);
		}
		case "male": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ namespace: "male:" + token_0.value as string, value: "all" })));
		}
		case "female": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ namespace: "female:" + token_0.value as string, value: "all" })));
		}
		case "type": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("type", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "group": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("group", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "series": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("series", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "artist": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("artist", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "popular": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("popular", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "character": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0("character", new Tag({ namespace: token_0.value as string, value: "all" })));
		}
		case "language": {
			return new HandleProperty(Symbol.S_LITERAL, async (token_0) => unknown_0(null, new Tag({ namespace: "index", value: token_0.value as string })));
		}
		// function
		case "idk": {
			return new HandleFunction([Symbol.N_LITERAL, Symbol.N_LITERAL], async (token_0, token_1) => {
				return [(token_0.value as number) + (token_1.value as number)];
			});
		}
		case "title": {
			return new HandleFunction([Symbol.S_LITERAL], async (token_0) => {
				try {
					return unknown_1(await suggest.unknown_5("galleries", suggest.unknown_1(token_0.value as string), await suggest.unknown_3("galleries", 0)));
				} catch {
					return [];
				}
			});
		}
		default: {
			return null;
		}
	}
}

async function unknown_0(directory: Nullable<string>, tag: Tag) {
	const response = await client.GET(`https://${["ltn.hitomi.la", "n", directory, `${tag.namespace.replace(/_/g, space)}-${tag.value.replace(/_/g, space)}`].filter((element) => element).join("/")}.nozomi`, "arraybuffer");

	switch (response.status.code) {
		case 200:
		case 206: {
			const binary = new DataView(response.body);

			return new Array(Math.floor(binary.byteLength / 4)).fill(null).map((_, index) => binary.getInt32(index * 4, Endian.BIG));
		}
	}
	return [];
}

async function unknown_1(digits: Pair<number, number>) {
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
	/** @alias get_galleryids_from_data */
	public unknown_1(...args: Parameters<typeof unknown_1>) { return unknown_1(...args); }
}

export const module = new JavaScriptModule();

const search = {
	query: (unprocessed: string) => {
		return (new Parser(unprocessed)).parse();
	}
};

export default search;
