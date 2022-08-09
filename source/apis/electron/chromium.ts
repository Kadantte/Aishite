import { ipcRenderer } from "electron";

import { Window } from "@/models/window";

const requires = new Set<string>();
const certification = new Set<string>();

enum Events {
	BLUR = "blur",
	FOCUS = "focus",
	CLOSE = "close",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	FULLSCREEN = "fullscreen",
}

enum Functions {
	OPEN_URL = "open_url",
	DEVELOPMENT = "development"
}

enum Properties {
	VERSION = "version",
	IS_PACKAGED = "is_packaged"
}

export class Chromium extends EventTarget {
	//
	// Events
	//
	public [Events.CLOSE](ticket: string) {
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
		return call<void>(Events.CLOSE);
	}
	public [Events.BLUR]() {
		return call<void>(Events.BLUR);
	}
	public [Events.FOCUS]() {
		return call<void>(Events.FOCUS);
	}
	public [Events.MINIMIZE]() {
		return call<void>(Events.MINIMIZE);
	}
	public [Events.MAXIMIZE]() {
		return call<void>(Events.MAXIMIZE);
	}
	public [Events.UNMAXIMIZE]() {
		return call<void>(Events.UNMAXIMIZE);
	}
	public [Events.FULLSCREEN]() {
		return call<void>(Events.FULLSCREEN);
	}
	//
	// Functions
	//
	public [Functions.OPEN_URL](url: string) {
		return call<void>(Functions.OPEN_URL, url);
	}
	public [Functions.DEVELOPMENT]() {
		return call<void>(Functions.DEVELOPMENT);
	}
	//
	// Properties
	//
	public [Properties.VERSION]() {
		return call<string>(Properties.VERSION);
	}
	public [Properties.IS_PACKAGED]() {
		return call<boolean>(Properties.IS_PACKAGED);
	}
	//
	// built-in
	//
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

async function call<T>(command: Events | Functions | Properties, ...args: Array<unknown>) {
	// cache
	const response = await ipcRenderer.invoke("chromium", command, ...args);

	print({ command: command, response: response });

	return response;
}

Object.defineProperty(window, "chromium", {
	value: new Chromium()
});
