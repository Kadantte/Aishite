// app
import "@/decorators";
import "@/prototypes";
// api
import { BridgeEvent } from "@/api";

Object.defineProperty(window, "bridge", {
	value: new class BridgeListener extends EventTarget {
		public handle(event: BridgeEvent, callback: Method) {
			super.addEventListener(event, (args) => (callback((args as Event & { detail: Array<any> }).detail)));
		}
		public trigger(event: BridgeEvent, ...args: Array<any>) {
			super.dispatchEvent(new CustomEvent(event, { detail: args }));
		}
	}
});

Object.defineProperty(window, "__dirname", {
	value: __dirname.split("app.asar").first
});
