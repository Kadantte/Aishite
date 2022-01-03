// prototypes
import "@/prototypes";
// api
import { BridgeEvent } from "@/api";
// @ts-ignore
window["bridge"] = new class BridgeListener extends EventTarget {
	public handle(event: BridgeEvent, callback: (...args: Array<any>) => void) {
		super.addEventListener(event, callback);
	}
	public trigger(event: BridgeEvent, ...args: Array<any>) {
		super.dispatchEvent(new CustomEvent(event, { detail: args }));
	}
}
