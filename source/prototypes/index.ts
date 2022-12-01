import { _print } from "@/prototypes/functions/print";
import { _until } from "@/prototypes/functions/until";
import { _inject } from "@/prototypes/functions/inject";
import { _execute } from "@/prototypes/functions/execute";

import "@/prototypes/interfaces/string";
import "@/prototypes/interfaces/number";

import "@/prototypes/interfaces/set";
import "@/prototypes/interfaces/array";
import "@/prototypes/interfaces/buffer";
import "@/prototypes/interfaces/arraybuffer";

import "@/prototypes/interfaces/dataview";

_print; _until; _inject; _execute;

declare global {
	function print(...args: Parameters<typeof _print>): ReturnType<typeof _print>;
	function until(...args: Parameters<typeof _until>): ReturnType<typeof _until>;
	function inject(...args: Parameters<typeof _inject>): ReturnType<typeof _inject>;
	function execute(...args: Parameters<typeof _execute>): ReturnType<typeof _execute>;
}
