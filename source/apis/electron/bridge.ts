import { ipcRenderer } from "electron";

export enum Window {
	BLUR = "blur",
	FOCUS = "focus",
	CLOSE = "close",
	OPEN_URL = "open-url",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	ENTER_FULL_SCREEN = "enter-full-screen",
	LEAVE_FULL_SCREEN = "leave-full-screen"
}

Object.defineProperty(window, "bridge", {
	value: new class BridgeListener extends EventTarget {
		public trigger(event: Window, ...args: Array<unknown>) {
			super.dispatchEvent(new CustomEvent(event, { detail: args }));
		}
		public handle(event: Window, handle: (event: Event & { detail: unknown }) => void) {
			super.addEventListener(event, handle as EventListener);
		}
		public unhandle(event: Window, handle: (event: Event & { detail: unknown }) => void) {
			super.removeEventListener(event, handle as EventListener);
		}
	}
});

ipcRenderer.on(Window.CLOSE, (event, args) => {
	protocol.close("renderer")
});
ipcRenderer.on(Window.BLUR, (event, args) => {
	bridge.trigger(Window.BLUR, args);
});
ipcRenderer.on(Window.FOCUS, (event, args) => {
	bridge.trigger(Window.BLUR, args);
});
ipcRenderer.on(Window.OPEN_URL, (event, args) => {
	bridge.trigger(Window.OPEN_URL, args);
});
ipcRenderer.on(Window.MINIMIZE, (event, args) => {
	bridge.trigger(Window.MINIMIZE, args);
});
ipcRenderer.on(Window.MAXIMIZE, (event, args) => {
	bridge.trigger(Window.MAXIMIZE, args);
});
ipcRenderer.on(Window.UNMAXIMIZE, (event, args) => {
	bridge.trigger(Window.UNMAXIMIZE, args);
});
ipcRenderer.on(Window.ENTER_FULL_SCREEN, (event, args) => {
	bridge.trigger(Window.ENTER_FULL_SCREEN, args);
});
ipcRenderer.on(Window.LEAVE_FULL_SCREEN, (event, args) => {
	bridge.trigger(Window.LEAVE_FULL_SCREEN, args);
});
