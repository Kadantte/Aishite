import { Chromium } from "@/apis/electron/chromium";

declare global {
	// preload.ts
	const space: "\u0020";
	const comma: "\u002C";

	const chromium: Chromium;
	// prototypes.ts
	interface String {
		isEmpty(): boolean;
	}
	interface Number {
		clamp(minimum: number, maximum: number): number;
	}
	interface Set<T> {
		isEmpty(): boolean;
	}
	interface Array<T> {
		last?: T;
		first?: T;

		isEmpty(): boolean;
		
		skip(count: number): Array<T>;
		take(count: number): Array<T>;

		add(...args: Array<T>): Array<T>;
		remove(...args: Array<T>): Array<T>;
	}
	interface ArrayBuffer {
		skip(count: number): ArrayBuffer;
		take(count: number): ArrayBuffer;
	}
	interface DataView {
		getUint64(offset: number, endian: boolean): number;
	}
	function print(...args: Array<unknown>): void;
	function until(condition: () => boolean, duration?: number): Promise<void>;
	
	function inject(before: Function, after: Function): () => unknown;
}

export default {}
