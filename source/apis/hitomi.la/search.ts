import client from "modules/node.js/request";

import { Tag } from "models/tag";
import { Pair } from "models/pair";
import { Endian } from "models/endian";

import options from "handles/options";

import { suggestJS } from "apis/hitomi.la/suggest";

import { revision } from "apis/hitomi.la/private/version";

enum Generic {
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
		public readonly type: Generic,
		public readonly value: unknown = undefined
	) { }
	public is(type: Generic) {
		return this.type === type;
	}
	public toString() {
		return this.value ? { type: Generic[this.type], value: this.value } : { type: Generic[this.type] };
	}
}

class Parser {
	private _index: number;
	private _table: Record<string, Set<number>>;
	private _tokens: Array<Token>;

	constructor(unprocessed: string) {
		// clean up
		unprocessed = unprocessed.trim();

		this._index = 0;
		this._table = {};
		this._tokens = [];

		let index = 0;

		function process(instance: Parser, symbol: Generic) {
			instance._tokens.push(new Token(symbol));

			switch (symbol) {
				case Generic.N_EQUAL: {
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
					this._tokens.push(new Token(Generic.N_LITERAL, Number(match[1])));
					index += match[0].length;
					continue;
				}
				// string (single quotes)
				if ((match = /^'([^']*)'/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Generic.S_LITERAL, String(match[1])));
					index += match[0].length;
					continue;
				}
				// string (double quotes)
				if ((match = /^"([^"]*)"/.exec(chunk)) !== null) {
					this._tokens.push(new Token(Generic.S_LITERAL, String(match[1])));
					index += match[0].length;
					continue;
				}
				// identifier
				if ((match = /^[\w]+/.exec(chunk)) !== null) {
					switch (match[0]) {
						case "true": {
							this._tokens.push(new Token(Generic.B_LITERAL, true));
							break;
						}
						case "false": {
							this._tokens.push(new Token(Generic.B_LITERAL, false));
							break;
						}
						default: {
							this._tokens.push(new Token(Generic.IDENTIFIER, match[0]));
							break;
						}
					}
					index += match[0].length;
					continue;
				}
				// etc
				switch (unprocessed.at(index)) {
					case "&": { process(this, Generic.AND); continue; }
					case "+": { process(this, Generic.PLUS); continue; }
					case "=": { process(this, Generic.EQUAL); continue; }
					case "-": { process(this, Generic.MINUS); continue; }
					case ",": { process(this, Generic.COMMA); continue; }
					case "(": { process(this, Generic.L_PAREN); continue; }
					case ")": { process(this, Generic.R_PAREN); continue; }
					case "!": {
						if (unprocessed.at(index + 1) === "=") {
							process(this, Generic.N_EQUAL);
							continue;
						}
						throw new Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
					}
					case space: { index++; continue; }
				}
				throw new Error(`Could not parse ${unprocessed.at(index)} at position ${index}`);
			}
			this._tokens.push(new Token(Generic.EOF));
		}
		catch (error) {
			// debug
			print(error);
			// reset
			this._tokens = [];
		}
	}
	protected peek() {
		return this._tokens[this._index];
	}
	protected next() {
		this._index++;

		const token = this.peek();

		print(token.toString());

		return token;
	}
	public async parse() {
		// empty
		if (this._tokens.isEmpty) return this.fallback();

		try {
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

		// eslint-disable-next-line no-constant-condition
		while (true) {
			switch (this.peek().type) {
				case Generic.AND:
				case Generic.PLUS:
				case Generic.MINUS: {
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
				case Generic.AND: {
					for (const element of value.values()) {
						if (!_value.has(element)) value.delete(element);
					}
					break;
				}
				case Generic.PLUS: {
					for (const element of _value.values()) {
						value.add(element);
					}
					break;
				}
				case Generic.MINUS: {
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
			case Generic.IDENTIFIER: {
				value = await this.I();
				break;
			}
			case Generic.L_PAREN: {
				this.next();
				value = await this.E();
				break;
			}
		}
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
				case Generic.EQUAL: {
					const key = token.value as string + "==" + this.next().value;

					if (this._table[key]) return this._table[key];

					const value = await handle.call(this.peek());

					this._table[key] = value;

					return value;
				}
				case Generic.N_EQUAL: {
					const key = token.value as string + "!=" + this.next().value;

					if (this._table[key]) return this._table[key];

					const value = await this.fallback();

					for (const element of (await handle.call(this.peek())).values()) {
						value.delete(element);
					}
					this._table[key] = value;

					return value;
				}
				default: {
					throw new Error(`Could not process property comparison, ${Generic[this.peek().type]} is invalid operator`);
				}
			}
		}
		else if (handle instanceof _Function) {
			// open
			if (!this.next().is(Generic.L_PAREN)) throw new Error(`Could not process function call, expected ${Generic[Generic.L_PAREN]} but received ${Generic[this.peek().type]}`);

			const tokens = [];

			// eslint-disable-next-line no-constant-condition
			while (true) {
				// update
				tokens.push(this.next());

				if (tokens.length === handle.length) break;

				if (!this.next().is(Generic.COMMA)) throw new Error(`Could not process function call, expected ${Generic[Generic.COMMA]} but received ${Generic[this.peek().type]}`);
			}
			// close
			if (!this.next().is(Generic.R_PAREN)) throw new Error(`Could not process function call, expected ${Generic[Generic.R_PAREN]} but received ${Generic[this.peek().type]}`);

			return handle.call(...tokens);
		}
		else {
			throw new Error(`Could not process identifier ${Generic[token.type]}`);
		}
	}
	protected async fallback(): Promise<Set<number>> {
		const language_all = this._table["language==all"] ?? new Set(await unknown_0(null, new Tag({ key: "index", value: "all" })));

		if (!this._table["language==all"]) this._table["language==all"] = language_all;

		return language_all;
	}
}

class _Property {
	constructor(
		private readonly type: Generic,
		private readonly handle: (token: Token) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(token: Token) {
		if (!token.is(this.type)) throw new Error(`Could not match symbol, expected ${Generic[this.type]} but received ${Generic[token.type]}`);

		return new Set(await this.handle(token));
	}
}

class _Function {
	constructor(
		private readonly type: Array<Generic>,
		private readonly handle: (...tokens: Array<Token>) => Promise<Array<number>>
	) {
		// TODO: none
	}
	public async call(...tokens: Array<Token>) {
		for (let index = 0; index < tokens.length; index++) {
			if (!tokens[index].is(this.type[index])) throw new Error(`Could not match symbol, expected ${Generic[this.type[index]]} but received ${Generic[tokens[index].type]}`);
		}
		return new Set(await this.handle(...tokens));
	}
	public get length() {
		return this.type.length;
	}
}

function built_in(key: string) {
	switch (key) {
		//
		// property
		//
		case "id": {
			return new _Property(Generic.N_LITERAL, async (token_0) => [token_0.value as number]);
		}
		case "male": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ key: "male:" + token_0.value as string, value: "all" })));
		}
		case "female": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("tag", new Tag({ key: "female:" + token_0.value as string, value: "all" })));
		}
		case "type": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("type", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "group": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("group", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "series": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("series", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "artist": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("artist", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "popular": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("popular", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "character": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0("character", new Tag({ key: token_0.value as string, value: "all" })));
		}
		case "language": {
			return new _Property(Generic.S_LITERAL, async (token_0) => unknown_0(null, new Tag({ key: "index", value: token_0.value as string })));
		}
		//
		// function
		//
		case "title": {
			return new _Function([Generic.S_LITERAL], async (token_0) => {
				try {
					return unknown_1(await suggestJS.unknown_5("galleries", suggestJS.unknown_1(token_0.value as string), await suggestJS.unknown_3("galleries", 0)));
				}
				catch {
					return [];
				}
			});
		}
		case "random": {
			return new _Function([Generic.N_LITERAL, Generic.N_LITERAL], async (token_0, token_1) => {
				const minimum = token_0.value as number;
				const maximum = token_1.value as number;

				return [Math.floor(Math.random() * (maximum - minimum + 1)) + minimum];
			});
		}
		case "shortcut": {
			return new _Function([Generic.S_LITERAL], async (token_0) => {
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
	return [];
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
