import { ipcRenderer } from "electron";

import ReactDOM from "react-dom/client";

import App from "@/app";

import settings from "@/modules/settings";

import { API_COMMAND, BridgeEvent } from "@/api";

const certification = new Set<string>();

function call(command: API_COMMAND, ...args: Array<any>) {
	return ipcRenderer.invoke("API", command, ...args).then((response) => {
		print({
			command: command,
			args: args,
			response: response	
		});
		return response;
	});
}

Object.defineProperty(window, "API", {
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
	// calls back close() with different validate arguments
	//
	// 4. close() Function
	//
	// calls [API_COMMAND] to truly close [BrowserWindow]
	//
	value: {
		[API_COMMAND.CLOSE](validate: string) {
			if (certification.has(validate)) {
				throw Error();
			} else {
				certification.add(validate);
			}
			for (const vertify of settings.state.general.dependency) {
				if (!certification.has(vertify)) {
					return window.bridge.trigger(BridgeEvent.CLOSE);
				}
			}
			return call(API_COMMAND.CLOSE);
		},
		[API_COMMAND.FOCUS]() {
			return call(API_COMMAND.FOCUS);
		},
		[API_COMMAND.BLUR]() {
			return call(API_COMMAND.BLUR);
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
	window.API.close("renderer");
});
ipcRenderer.on(BridgeEvent.FOCUS, (event, args) => {
	window.bridge.trigger(BridgeEvent.BLUR, args);
});
ipcRenderer.on(BridgeEvent.BLUR, (event, args) => {
	window.bridge.trigger(BridgeEvent.BLUR, args);
});
ipcRenderer.on(BridgeEvent.OPEN_URL, (event, args) => {
	window.bridge.trigger(BridgeEvent.OPEN_URL, args);
});
ipcRenderer.on(BridgeEvent.MINIMIZE, (event, args) => {
	window.bridge.trigger(BridgeEvent.MINIMIZE, args);
});
ipcRenderer.on(BridgeEvent.MAXIMIZE, (event, args) => {
	window.bridge.trigger(BridgeEvent.MAXIMIZE, args);
});
ipcRenderer.on(BridgeEvent.UNMAXIMIZE, (event, args) => {
	window.bridge.trigger(BridgeEvent.UNMAXIMIZE, args);
});
ipcRenderer.on(BridgeEvent.ENTER_FULL_SCREEN, (event, args) => {
	window.bridge.trigger(BridgeEvent.ENTER_FULL_SCREEN, args);
});
ipcRenderer.on(BridgeEvent.LEAVE_FULL_SCREEN, (event, args) => {
	window.bridge.trigger(BridgeEvent.LEAVE_FULL_SCREEN, args);
});

ReactDOM.createRoot(document.getElementById("app")!).render(<App></App>);
