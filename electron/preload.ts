import { ipcRenderer } from "electron";

import "@/prototypes";
import "@/decorators";

import { API_COMMAND, BridgeEvent } from "@/api";

const certification = new Set<string>();

// Override

Object.defineProperty(window, "space", {
	value: "\u0020"
});

Object.defineProperty(window, "comma", {
	value: "\u002C"
});

Object.defineProperty(window, "__dirname", {
	value: __dirname.split("app.asar").first
});

// Bridge

Object.defineProperty(window, "bridge", {
	value: new class BridgeListener extends EventTarget {
		public trigger(event: BridgeEvent, ...args: Array<unknown>) {
			super.dispatchEvent(new CustomEvent(event, { detail: args }));
		}
		public handle(event: BridgeEvent, handle: (event: Event & { detail: unknown }) => void) {
			super.addEventListener(event, handle as EventListener);
		}
		public unhandle(event: BridgeEvent, handle: (event: Event & { detail: unknown }) => void) {
			super.removeEventListener(event, handle as EventListener);
		}
	}
});

// Protocol

const config = require("@/../config.json");

function call(command: API_COMMAND, ...args: Array<unknown>) {
	return ipcRenderer.invoke("protocol", command, ...args).then((response) => {
		print({
			command: command,
			args: args,
			response: response
		});
		return response;
	});
}

Object.defineProperty(window, "protocol", {
	//
	// 1. Entry point
	//
	// TitleBar.tsx -> close()
	// OS native interaction -> ipcRenderer -> close()
	//
	// 2. close() Function
	//
	// triggers [BridgeEvent]
	//
	// 3. Individual [BridgeEvent] listeners
	//
	// calls back close() with different ticket arguments
	//
	// 4. close() Function
	//
	// calls [API_COMMAND] to truly close [BrowserWindow]
	//
	value: {
		[API_COMMAND.CLOSE](ticket: string) {
			if (certification.has(ticket)) {
				throw Error();
			} else {
				certification.add(ticket);
			}
			for (const vertify of config?.["general"]?.["dependency"] ?? ["storage"]) {
				if (!certification.has(vertify)) {
					return bridge.trigger(BridgeEvent.CLOSE);
				}
			}
			return call(API_COMMAND.CLOSE);
		},
		[API_COMMAND.BLUR]() {
			return call(API_COMMAND.BLUR);
		},
		[API_COMMAND.FOCUS]() {
			return call(API_COMMAND.FOCUS);
		},
		[API_COMMAND.MINIMIZE]() {
			return call(API_COMMAND.MINIMIZE);
		},
		[API_COMMAND.MAXIMIZE]() {
			return call(API_COMMAND.MAXIMIZE);
		},
		[API_COMMAND.UNMAXIMIZE]() {
			return call(API_COMMAND.UNMAXIMIZE);
		},
		[API_COMMAND.FULLSCREEN]() {
			return call(API_COMMAND.FULLSCREEN);
		},
		[API_COMMAND.DEVELOPMENT]() {
			return call(API_COMMAND.DEVELOPMENT);
		}
	}
});
ipcRenderer.on(BridgeEvent.CLOSE, (event, args) => {
	protocol.close("renderer")
});
ipcRenderer.on(BridgeEvent.BLUR, (event, args) => bridge.trigger(BridgeEvent.BLUR, args));
ipcRenderer.on(BridgeEvent.FOCUS, (event, args) => bridge.trigger(BridgeEvent.BLUR, args));
ipcRenderer.on(BridgeEvent.OPEN_URL, (event, args) => bridge.trigger(BridgeEvent.OPEN_URL, args));
ipcRenderer.on(BridgeEvent.MINIMIZE, (event, args) => bridge.trigger(BridgeEvent.MINIMIZE, args));
ipcRenderer.on(BridgeEvent.MAXIMIZE, (event, args) => bridge.trigger(BridgeEvent.MAXIMIZE, args));
ipcRenderer.on(BridgeEvent.UNMAXIMIZE, (event, args) => bridge.trigger(BridgeEvent.UNMAXIMIZE, args));
ipcRenderer.on(BridgeEvent.ENTER_FULL_SCREEN, (event, args) => bridge.trigger(BridgeEvent.ENTER_FULL_SCREEN, args));
ipcRenderer.on(BridgeEvent.LEAVE_FULL_SCREEN, (event, args) => bridge.trigger(BridgeEvent.LEAVE_FULL_SCREEN, args));

// Responsive

Object.defineProperty(window, "responsive", {
	value: process.env.NODE_ENV === "development" ? {
		width: Math.round((1920 - 30) * 0.3 + 30),
		height: Math.round((1080 - 230) * 0.5 + 170)
	} : {
		width: Math.round((screen.width - 30) * 0.3 + 30),
		height: Math.round((screen.height - 230) * 0.5 + 170)
	}
});
