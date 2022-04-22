import { API_COMMAND, BridgeEvent } from "@/api"

declare global {
	/** @see electron/main.ts */
	interface Window {
		readonly API: {
			[API_COMMAND.CLOSE](validate: string): Promise<void>;
			[API_COMMAND.FOCUS](): Promise<void>;
			[API_COMMAND.BLUR](): Promise<void>;
			[API_COMMAND.MINIMIZE](): Promise<void>;
			[API_COMMAND.MAXIMIZE](): Promise<void>;
			[API_COMMAND.UNMAXIMIZE](): Promise<void>;
			[API_COMMAND.FULLSCREEN](): Promise<void>;
			[API_COMMAND.DEVELOPMENT](): Promise<void>;
		}
		readonly bridge: EventTarget & {
			handle(event: BridgeEvent, callback: Method): void;
			trigger(event: BridgeEvent, ...args: Array<any>): void;
		}
	}
	/** @see modules/prototypes.ts */
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
	function print(...args: Array<any>): void;
	function until(condition: () => boolean, duration?: number): Promise<void>;
	function inject(before: (...args: Array<any>) => any, after: (...args: Array<any>) => any): (...args: Array<any>) => any;
	function random(minimum: number, maximum: number): number;
	function calculate(expression: string): string;
}

export default {}
