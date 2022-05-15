import { ipcRenderer } from "electron";

import { Window } from "@/models/window";

const requires = new Set<string>();
const certification = new Set<string>();

enum Command {
	CLOSE = "close",
	REQUIRES = "requires",
	BLUR = "blur",
	FOCUS = "focus",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	FULLSCREEN = "fullscreen",
	DEVELOPMENT = "development"
}

export class Chromium extends EventTarget {
	public [Command.CLOSE](ticket: string) {
		//
		// 1. Entry point
		//
		// TitleBar.tsx -> close()
		// OS native interaction -> ipcRenderer -> close()
		//
		// 2. close() Function
		//
		// triggers [Window] event
		//
		// 3. Individual [Window] event listeners
		//
		// calls back close() with different ticket arguments
		//
		// 4. close() Function
		//
		// calls [Command] to truly close [BrowserWindow]
		//
		if (certification.has(ticket)) {
			throw Error();
		}
		certification.add(ticket);

		for (const vertify of requires) {
			if (!certification.has(vertify)) {
				return chromium.signal(Window.CLOSE);
			}
		}
		return call<void>(Command.CLOSE);
	}
	public [Command.REQUIRES](criteria: Array<string>) {
		for (const value of criteria) {
			requires.add(value);
		}
	}
	public [Command.BLUR]() {
		return call<void>(Command.BLUR);
	}
	public [Command.FOCUS]() {
		return call<void>(Command.FOCUS);
	}
	public [Command.MINIMIZE]() {
		return call<void>(Command.MINIMIZE);
	}
	public [Command.MAXIMIZE]() {
		return call<void>(Command.MAXIMIZE);
	}
	public [Command.UNMAXIMIZE]() {
		return call<void>(Command.UNMAXIMIZE);
	}
	public [Command.FULLSCREEN]() {
		return call<void>(Command.FULLSCREEN);
	}
	public [Command.DEVELOPMENT]() {
		return call<void>(Command.DEVELOPMENT);
	}
	public signal(event: Window, ...args: Array<unknown>) {
		super.dispatchEvent(new CustomEvent(event, { detail: args }));
	}
	public handle(event: Window, handle: (event: Event & { detail: unknown }) => void) {
		super.addEventListener(event, handle as EventListener);
	}
	public unhandle(event: Window, handle: (event: Event & { detail: unknown }) => void) {
		super.removeEventListener(event, handle as EventListener);
	}
}
ipcRenderer.on(Window.CLOSE, (event, ...args) => {
	chromium.close("renderer");
});
ipcRenderer.on(Window.BLUR, (event, ...args) => {
	chromium.signal(Window.BLUR, args);
});
ipcRenderer.on(Window.FOCUS, (event, ...args) => {
	chromium.signal(Window.BLUR, ...args);
});
ipcRenderer.on(Window.MINIMIZE, (event, ...args) => {
	chromium.signal(Window.MINIMIZE, ...args);
});
ipcRenderer.on(Window.MAXIMIZE, (event, ...args) => {
	chromium.signal(Window.MAXIMIZE, ...args);
});
ipcRenderer.on(Window.UNMAXIMIZE, (event, ...args) => {
	chromium.signal(Window.UNMAXIMIZE, ...args);
});
ipcRenderer.on(Window.ENTER_FULL_SCREEN, (event, ...args) => {
	chromium.signal(Window.ENTER_FULL_SCREEN, ...args);
});
ipcRenderer.on(Window.LEAVE_FULL_SCREEN, (event, ...args) => {
	chromium.signal(Window.LEAVE_FULL_SCREEN, ...args);
});

function call<T>(command: Command, ...args: Array<unknown>) {
	return ipcRenderer.invoke("chromium", command, ...args).then((response) => {
		print({
			command: command,
			response: response
		});
		return response as T;
	});
}

Object.defineProperty(window, "chromium", {
	value: new Chromium()
});
