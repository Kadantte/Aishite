import { sha256 } from "js-sha256";

import request from "@/modules/request";

import Tag from "@/models/tag";
import Pair from "@/models/pair";
import { Endian } from "@/models/endian";

import { Directory, mirror } from "@/apis/hitomi.la/private/version";

let timestamp = 0;

class Binary {
	public offset: number;
	public readonly buffer: DataView;

	constructor(args: Args<Binary>) {
		this.offset = args.offset;
		this.buffer = args.buffer;
	}
}

class Bundle {
	public readonly nodes: Array<number>;
	public readonly buffer: Array<Uint8Array>;
	public readonly digits: Array<Pair<number, number>>;

	constructor(args: Args<Bundle>) {
		this.nodes = args.nodes;
		this.buffer = args.buffer;
		this.digits = args.digits;
	}
}

export function SuggestTags(query: string) {
	return unknown_0(query.replace(/_/g, "\u0020"));
}

export function SuggestExpire() {
	timestamp++;
}

async function unknown_0(query: string) {
	timestamp++;

	const UUID = timestamp;
	//
	// 0: namespace
	// 1: value
	//
	const fragment = query.includes(":") ? query.split(":") : ["global", query];

	try {
		const bundle = await unknown_3(fragment[0], 0);
		if (timestamp !== UUID) throw Error();
		const digits = await unknown_5(fragment[0], unknown_1(fragment[1]), bundle);
		if (timestamp !== UUID) throw Error();
		const sigma = await unknown_6(fragment[0], digits);
		if (timestamp !== UUID) throw Error();
		return sigma;
	} catch {
		return [];
	}
}

function unknown_1(value: string) {
	return new Uint8Array(sha256.array(value).take(4));
}

function unknown_2(buffer: Uint8Array) {
	const binary = new Binary({ offset: 0, buffer: new DataView(buffer.buffer) });
	const bundle = new Bundle({ nodes: [], buffer: [], digits: [] });

	const _0 = binary.buffer.getInt32(binary.offset, Endian.BIG);
	binary.offset += 4;

	for (let index = 0; index < _0; index++) {
		// cache
		const offset = binary.buffer.getInt32(binary.offset, Endian.BIG);

		if (offset === 0 || offset > 32) throw new Error();

		binary.offset += 4;
		bundle.buffer.add(buffer.slice(binary.offset, binary.offset + offset));
		binary.offset += offset;
	}
	const _1 = binary.buffer.getInt32(binary.offset, Endian.BIG);
	binary.offset += 4;

	for (let index = 0; index < _1; index++) {
		bundle.digits.add(new Pair(binary.buffer.getUint64(binary.offset, Endian.BIG), binary.buffer.getInt32(binary.offset + 8, Endian.BIG)));
		binary.offset += 8 + 4;
	}

	for (let index = 0; index < 17; index++) {
		bundle.nodes.add(binary.buffer.getUint64(binary.offset, Endian.BIG));
		binary.offset += 8;
	}
	return bundle;
}

async function unknown_3(directory: string, value: number) {
	const location = directory === "global" ? Directory.TAG : directory as Directory;

	return unknown_2(await unknown_4(`https://ltn.hitomi.la/${location}index/${directory}.${await mirror(location)}.index`, value, value + 463));
}

async function unknown_4(url: string, offset: number, length: number) {
	return new Uint8Array((await request.GET(url, "arraybuffer", { headers: { "range": `bytes=${offset}-${length}` } })).body);
}

async function unknown_5(type: string, buffer: Uint8Array, bundle: Bundle): Promise<Pair<number, number>> {
	// check before local functions
	if (bundle.buffer.isEmpty()) throw Error();

	function mystery_0(first: Uint8Array, second: Uint8Array) {
		for (let index = 0; index < Math.min(first.length, second.length); index++) {
			if (first[index] < second[index]) {
				return new Pair(true, false);
			} else if (first[index] > second[index]) {
				return new Pair(false, false);
			}
		}
		return new Pair(true, true);
	}

	function mystery_1(buffer: Uint8Array, bundle: Bundle) {
		let fragment = new Pair(true, false);

		for (let index = 0; index < bundle.buffer.length; index++) {
			// update
			fragment = mystery_0(buffer, bundle.buffer[index]);

			if (fragment.first) return new Pair(fragment.second, index);
		}
		if (!bundle.buffer.isEmpty()) return new Pair(fragment.second, bundle.buffer.length);

		return new Pair(true, 0);
	}

	function mystery_2(bundle: Bundle) {
		for (let index = 0; index< bundle.nodes.length; index++) {
			if (bundle.nodes[index] > 0) return false;
		}
		return true;
	}
	// cache
	const mystery = mystery_1(buffer, bundle);

	if (mystery.first) return bundle.digits[mystery.second];
	if (mystery_2(bundle)) throw Error();
	if (bundle.nodes[mystery.second] === 0) throw Error();

	return unknown_5(type, buffer, await unknown_3(type, bundle.nodes[mystery.second]));
}

async function unknown_6(type: string, digits: Pair<number, number>) {
	if (digits.second <= 0 || digits.second > 10000) throw Error();

	const response = await unknown_4(`https://ltn.hitomi.la/tagindex/${type}.${await mirror(Directory.TAG)}.data`, digits.first, digits.first + digits.second - 1);

	const binary = new Binary({ offset: 0, buffer: new DataView(response.buffer) });

	const sigma = Array<Pair<Tag, number>>();

	const _0 = binary.buffer.getInt32(binary.offset, Endian.BIG);
	binary.offset += 4;

	if (_0 <= 0 || _0 > 100) throw Error();

	function utf16(value: number) {
		return value === 32 ? 95 : value;
	}

	for (let index = 0; index < _0; index++) {
		// cache
		let namespace = "", value = "";

		const _1 = binary.buffer.getInt32(binary.offset, Endian.BIG);
		binary.offset += 4;

		for (let _index = 0; _index < _1; _index++) {
			namespace += String.fromCharCode(binary.buffer.getUint8(binary.offset));
			binary.offset += 1;
		}

		const _2 = binary.buffer.getInt32(binary.offset, Endian.BIG);
		binary.offset += 4;

		for (let _index = 0; _index < _2; _index++) {
			value += String.fromCharCode(utf16(binary.buffer.getUint8(binary.offset)));
			binary.offset += 1;
		}

		sigma.add(new Pair(new Tag({ namespace: namespace, value: value }), binary.buffer.getUint32(binary.offset, Endian.BIG)));
		binary.offset += 4;
	}
	return sigma;
}

export const suggestJS = {
	get_suggestions_for_query: unknown_0,
	hash_term: unknown_1,
	decode_node: unknown_2,
	get_node_at_adress: unknown_3,
	get_url_at_range: unknown_4,
	B_search: unknown_5,
	get_suggestions_from_data: unknown_6
};
