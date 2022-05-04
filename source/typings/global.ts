import { Window } from "@/apis/electron/bridge";
import { Command } from "@/apis/electron/command";

declare global {
	// preload.ts
	const space: "\u0020";
	const comma: "\u002C";
	
	const bridge: EventTarget & {
		trigger(event: Window, ...args: Array<unknown>): void;

		handle(event: Window, handle: (event: Event & { detail: unknown }) => void): void;
		unhandle(event: Window, handle: (event: Event & { detail: unknown }) => void): void;
	}
	const protocol: {
		[Command.CLOSE](validate: string): Promise<void>;
		[Command.BLUR](): Promise<void>;
		[Command.FOCUS](): Promise<void>;
		[Command.MINIMIZE](): Promise<void>;
		[Command.MAXIMIZE](): Promise<void>;
		[Command.UNMAXIMIZE](): Promise<void>;
		[Command.FULLSCREEN](): Promise<void>;
		[Command.DEVELOPMENT](): Promise<void>;
	}
	const responsive: {
		width: number;
		height: number;
	}
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
	function random(minimum: number, maximum: number): number;
	function nullsafe(target: Record<string, unknown>): Record<string, unknown>;
}

export default {}
