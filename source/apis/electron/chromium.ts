import { ipcRenderer } from "electron";

import { Window } from "@/models/window";

const requires = new Set<string>();
const certification = new Set<string>();

enum App {
	BLUR = "blur",
	FOCUS = "focus",
	CLOSE = "close",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	FULLSCREEN = "fullscreen",
}

enum Interface {
	OPEN_URL = "open_url",
	DEVELOPMENT = "development"
}

export class Chromium extends EventTarget {
	// app
	public [App.CLOSE](ticket: string) {
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
		return call<void>(App.CLOSE);
	}
	public [App.BLUR]() {
		return call<void>(App.BLUR);
	}
	public [App.FOCUS]() {
		return call<void>(App.FOCUS);
	}
	public [App.MINIMIZE]() {
		return call<void>(App.MINIMIZE);
	}
	public [App.MAXIMIZE]() {
		return call<void>(App.MAXIMIZE);
	}
	public [App.UNMAXIMIZE]() {
		return call<void>(App.UNMAXIMIZE);
	}
	public [App.FULLSCREEN]() {
		return call<void>(App.FULLSCREEN);
	}
	// interface
	public [Interface.OPEN_URL](url: string) {
		return call<void>(Interface.OPEN_URL, url);
	}
	public [Interface.DEVELOPMENT]() {
		return call<void>(Interface.DEVELOPMENT);
	}
	// built-in
	public requires(criteria: Array<string>) {
		for (const value of criteria) {
			requires.add(value);
		}
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

async function call<T>(command: App | Interface, ...args: Array<unknown>) {
	return await ipcRenderer.invoke("chromium", command, ...args).then((response) => {
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
