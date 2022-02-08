// app
import "@/decorators";
import "@/prototypes";
// api
import { BridgeEvent } from "@/api";
// @ts-ignore
window["bridge"] = new class BridgeListener extends EventTarget {
	public handle(event: BridgeEvent, callback: Method) {
		super.addEventListener(event, (args) => (callback((args as Event & { detail: Array<any> }).detail)));
	}
	public trigger(event: BridgeEvent, ...args: Array<any>) {
		super.dispatchEvent(new CustomEvent(event, { detail: args }));
	}
}
