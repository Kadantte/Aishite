import { API_COMMAND, BridgeEvent } from "@/api"

declare global {
	// preload.ts
	const space: "\u0020";
	const comma: "\u002C";
	
	const bridge: EventTarget & {
		trigger(event: BridgeEvent, ...args: Array<unknown>): void;
		
		handle(event: BridgeEvent, handle: (event: Event & { detail: unknown }) => void): void;
		unhandle(event: BridgeEvent, handle: (event: Event & { detail: unknown }) => void): void;
	}
	const protocol: {
		[API_COMMAND.CLOSE](validate: string): Promise<void>;
		[API_COMMAND.BLUR](): Promise<void>;
		[API_COMMAND.FOCUS](): Promise<void>;
		[API_COMMAND.MINIMIZE](): Promise<void>;
		[API_COMMAND.MAXIMIZE](): Promise<void>;
		[API_COMMAND.UNMAXIMIZE](): Promise<void>;
		[API_COMMAND.FULLSCREEN](): Promise<void>;
		[API_COMMAND.DEVELOPMENT](): Promise<void>;
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
		truncate(): number;
		absolute(): number;
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
