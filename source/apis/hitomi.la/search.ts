import client from "modules/node.js/request";

import { Tag } from "models/tag";
import { Pair } from "models/pair";
import { Endian } from "models/endian";

import options from "handles/options";

import { suggestJS } from "apis/hitomi.la/suggest";

import { revision } from "apis/hitomi.la/private/version"

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
	B_LITERAL,
	//
	IDENTIFIER,
	//
	EOF
}

class Token {
	constructor(
		public readonly type: Symbol,
		public readonly value: unknown = undefined
	) { }
	public is(type: Symbol) {
		return this.type === type;
	}
	public toString() {
		return this.value ? { type: Symbol[this.type], value: this.value } : { type: Symbol[this.type] };
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

		try {
			while (index < unprocessed.length) {
				// cache
				const chunk = unprocessed.substring(index);

				let match: Nullable<RegExpExecArray>;

				// number
				if ((match = /^(-?[\d]+)/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Symbol.N_LITERAL, Number(match[1])));
					index += match[0].length;
					continue;
				}
				// string (single quotes)
				if ((match = /^'([^']*)'/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Symbol.S_LITERAL, String(match[1])));
					index += match[0].length;
					continue;
				}
				// string (double quotes)
				if ((match = /^"([^"]*)"/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Symbol.S_LITERAL, String(match[1])));
					index += match[0].length;
					continue;
				}
				// identifier
				if ((match = /^[\w]+/.exec(chunk)) !== null) {
					switch (match[0]) {
						case "true": {
							this._tokens.push(new Token(Symbol.B_LITERAL, true));
							break;
						}
						case "false": {
							this._tokens.push(new Token(Symbol.B_LITERAL, false));
							break;
						}
						default: {
							this._tokens.push(new Token(Symbol.IDENTIFIER, match[0]));
							break;
						}
					}
					index += match[0].length;
					continue;
				}
				// etc
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
						throw new Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
					}
					case space: { index++; continue; }
				}
				throw new Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
			}
			// close
			this._tokens.push(new Token(Symbol.EOF));
		}
		catch (error) {
			// debug
			print(error);
			// reset
			this._tokens = new Array();
		}
	}
	protected peek() {
		return this._tokens[this._index];
	}
	protected next() {
		// raise
		this._index++;

		const token = this.peek();

		print(token.toString());

		return token;
	}
	public async parse() {
		// empty
		if (this._tokens.isEmpty) return this.fallback();

		try {
			// cache
			const value = await this.E();

			if (value.isEmpty) return this.fallback();

			return value;
		}
		catch (error) {
			// debug
			print(`Could not process token at index ${this._index}`); print(error);

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

			this.next();

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
				this.next();
				// compute
				value = await this.E();
				break;
			}
		}
		// raise
		this.next();

		return value;
	}
	protected async I(): Promise<Set<number>> {
		const token = this.peek(), handle = built_in(token.value as string);

		if (handle === undefined) {
			throw new Error(`Could not find property or function named "${this.peek().value}"`);
		}
		else if (handle instanceof _Property) {
			switch (this.next().type) {
				case Symbol.EQUAL: {
					// cache
					const key = token.value as string + "==" + this.next().value;

					if (this._table.has(key)) return this._table.get(key)!;

					const value = await handle.call(this.peek());

					this._table.set(key, value);

					return value;
				}
				case Symbol.N_EQUAL: {
					// cache
					const key = token.value as string + "!=" + this.next().value;

					if (this._table.has(key)) return this._table.get(key)!;

					const value = await this.fallback();

					for (const element of (await handle.call(this.peek())).values()) {
						value.delete(element);
					}
					this._table.set(key, value);

					return value;
				}
				default: {
					throw new Error(`Could not process property comparison, ${Symbol[this.peek().type]} is invalid operator`);
				}
			}
		}
		else if (handle instanceof _Function) {
			// open
			if (!this.next().is(Symbol.L_PAREN)) throw new Error(`Could not process function call, expected ${Symbol[Symbol.L_PAREN]} but received ${Symbol[this.peek().type]}`);

			const tokens = new Array();

			while (true) {
				// update
				tokens.push(this.next());

				if (tokens.length === handle.length) break;

				if (!this.next().is(Symbol.COMMA)) throw new Error(`Could not process function call, expected ${Symbol[Symbol.COMMA]} but received ${Symbol[this.peek().type]}`);
			}
			// close
			if (!this.next().is(Symbol.R_PAREN)) throw new Error(`Could not process function call, expected ${Symbol[Symbol.R_PAREN]} but received ${Symbol[this.peek().type]}`);

			return handle.call(...tokens);
		}
		else {
			throw new Error(`Could not process identifier`);
		}
	}
	protected async fallback(): Promise<Set<number>> {
		// cache
		if (!this._table.has("language==all")) this._table.set("language==all", new Set(await unknown_0(null, new Tag({ key: "index", value: "all" }))));

		return this._table.get("language==all")!;
	}
}

class _Property {
	constructor(
		private readonly type: Symbol,
		private readonly handle: (token: Token) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(token: Token) {
		if (!token.is(this.type)) throw new Error(`Could not match symbol, expected ${Symbol[this.type]} but received ${Symbol[token.type]}`);

		return new Set(await this.handle(token));
	}
}

class _Function {
	constructor(
		private readonly type: Array<Symbol>,
		private readonly handle: (...tokens: Array<Token>) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(...tokens: Array<Token>) {
		for (let index = 0; index < tokens.length; index++) {
			if (!tokens[index].is(this.type[index])) throw new Error(`Could not match symbol, expected ${Symbol[this.type[index]]} but received ${Symbol[tokens[index].type]}`);
		}
		return new Set(await this.handle(...tokens));
	}
	public get length() {
		return this.type.length;
	}
}

function built_in(key: string) {
	switch (key) {
		// property
		case "id": {
			return new _Property(Symbol.N_LITERAL, async (token_0) => [token_0.value as number]);
		}
		case "male": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ key: "male:" + token_0.value as string, value: "all" })));
		}
		case "female": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ key: "female:" + token_0.value as string, value: "all" })));
		}
		case "type": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("type", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "group": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("group", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "series": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("series", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "artist": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("artist", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "popular": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("popular", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "character": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0("character", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "language": {
			return new _Property(Symbol.S_LITERAL, async (token_0) => unknown_0(null, new Tag({ key: "index", value: token_0.value as string })));
		}
		// function
		case "title": {
			return new _Function([Symbol.S_LITERAL], async (token_0) => {
				try {
					return unknown_1(await suggestJS.unknown_5("galleries", suggestJS.unknown_1(token_0.value as string), await suggestJS.unknown_3("galleries", 0)));
				}
				catch {
					return new Array();
				}
			});
		}
		case "random": {
			return new _Function([Symbol.N_LITERAL, Symbol.N_LITERAL], async (token_0, token_1) => {
				const minimum = token_0.value as number;
				const maximum = token_1.value as number;

				return [Math.floor(Math.random() * (maximum - minimum + 1)) + minimum];
			});
		}
		case "shortcut": {
			return new _Function([Symbol.S_LITERAL], async (token_0) => {
				// we can do simple replace calls for better performance too
				return Array.from(await search(options.state.apis.search.shortcut[token_0.value as string]));
			});
		}
		default: {
			return undefined;
		}
	}
}

async function unknown_0(directory: Nullable<string>, tag: Tag) {
	const response = await client.GET(`https://${["ltn.hitomi.la", "n", directory, `${tag.key.replace(/_/g, space)}-${tag.value.replace(/_/g, space)}`].filter((element) => element).join("/")}.nozomi`, "arraybuffer");

	switch (response.status.code) {
		case 200:
		case 206: {
			const binary = new DataView(response.body);

			return new Array(Math.floor(binary.byteLength / 4)).fill(true).map((_, index) => binary.getInt32(index * 4, Endian.BIG));
		}
	}
	return new Array();
}

async function unknown_1(digits: Pair<number, number>) {
	// check before request
	if (!(0 < digits.second && digits.second <= 10000000 * 10)) throw new Error();

	const response = await suggestJS.unknown_4(`https://ltn.hitomi.la/galleriesindex/galleries.${await revision("galleries")}.data`, digits.first, digits.first + digits.second - 1);

	const table = new DataView(response.buffer);
	const length = table.getInt32(0, Endian.BIG);

	if (!(0 < length && length <= 10000000)) throw new Error();
	if (response.byteLength !== length * 4 + 4) throw new Error();

	return new Array(length).fill(true).map((_, index) => table.getInt32((index + 1) * 4, Endian.BIG));
}

export type search = Await<ReturnType<typeof search>>;

export async function search(value: string) {
	// debug
	const timestamp = (new Date().getTime()).toString(36).toUpperCase();

	print(`%cSTART NEW PARSER ${timestamp}`, "color: black; background: aquamarine; font-weight: bold;");

	const response = await (new Parser(value)).parse();

	print(`%cTERMINATE PARSER ${timestamp}`, "color: black; background: darksalmon; font-weight: bold;");

	return response;
}

class JavaScriptModule {
	/** @alias get_galleryids_from_nozomi */
	public unknown_0(...args: Parameters<typeof unknown_0>) { return unknown_0(...args); }
	/** @alias get_galleryids_from_data */
	public unknown_1(...args: Parameters<typeof unknown_1>) { return unknown_1(...args); }
}

export const searchJS = new JavaScriptModule();
