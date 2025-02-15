import { ipcRenderer } from "electron";

import { Window } from "models/chromium";

const requires = new Set<string>();
const certification = new Set<string>();

type EventHandler<T> = (event: Event & { detail: T } ) => void;

class Chromium extends EventTarget {
	//
	// Function
	//
	public [Window.Function.CLOSE](ticket: string) {
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
			throw new Error();
		}
		certification.add(ticket);

		for (const vertify of requires) {
			if (!certification.has(vertify)) {
				return chromium.signal(Window.Event.CLOSE);
			}
		}
		return call<void>(Window.Function.CLOSE);
	}
	public [Window.Function.BLUR]() {
		return call<void>(Window.Function.BLUR);
	}
	public [Window.Function.FOCUS]() {
		return call<void>(Window.Function.FOCUS);
	}
	public [Window.Function.OPEN_URL](url: string) {
		return call<void>(Window.Function.OPEN_URL, url);
	}
	public [Window.Function.MINIMIZE]() {
		return call<void>(Window.Function.MINIMIZE);
	}
	public [Window.Function.MAXIMIZE]() {
		return call<void>(Window.Function.MAXIMIZE);
	}
	public [Window.Function.UNMAXIMIZE]() {
		return call<void>(Window.Function.UNMAXIMIZE);
	}
	public [Window.Function.FULLSCREEN](value?: boolean) {
		return call<void>(Window.Function.FULLSCREEN, value);
	}
	public [Window.Function.DEVELOPMENT]() {
		return call<void>(Window.Function.DEVELOPMENT);
	}
	//
	// Property
	//
	public [Window.Property.VERSION]() {
		return call<string>(Window.Property.VERSION);
	}
	public [Window.Property.IS_PACKAGED]() {
		return call<boolean>(Window.Property.IS_PACKAGED);
	}
	//
	// built-in
	//
	public requires(criteria: Array<string>) {
		for (const value of criteria) {
			requires.add(value);
		}
	}
	public signal(event: Window.Event, ...args: Array<unknown>) {
		super.dispatchEvent(new CustomEvent(event, { detail: args }));
	}
	//
	// mapping
	//
	public handle(event: Window.Event.BLUR, handle: EventHandler<void>): void;
	public handle(event: Window.Event.FOCUS, handle: EventHandler<void>): void;
	public handle(event: Window.Event.CLOSE, handle: EventHandler<void>): void;
	public handle(event: Window.Event.MINIMIZE, handle: EventHandler<void>): void;
	public handle(event: Window.Event.MAXIMIZE, handle: EventHandler<void>): void;
	public handle(event: Window.Event.UNMAXIMIZE, handle: EventHandler<void>): void;
	public handle(event: Window.Event.CONTEXTMENU, handle: EventHandler<[{ x: number; y: number; }]>): void;
	public handle(event: Window.Event.ENTER_FULL_SCREEN, handle: EventHandler<void>): void;
	public handle(event: Window.Event.LEAVE_FULL_SCREEN, handle: EventHandler<void>): void;

	public handle(event: Window.Event, handle: EventHandler<never>) {
		super.addEventListener(event, handle as EventListener);
	}
	public unhandle(event: Window.Event, handle: EventHandler<never>) {
		super.removeEventListener(event, handle as EventListener);
	}
}

ipcRenderer.on("console", (event, ...args) => {
	print(...args);
});
ipcRenderer.on(Window.Event.BLUR, (event, ...args) => {
	chromium.signal(Window.Event.BLUR, ...args);
});
ipcRenderer.on(Window.Event.FOCUS, (event, ...args) => {
	chromium.signal(Window.Event.BLUR, ...args);
});
ipcRenderer.on(Window.Event.CLOSE, (event, ...args) => {
	chromium.close("renderer");
});
ipcRenderer.on(Window.Event.MINIMIZE, (event, ...args) => {
	chromium.signal(Window.Event.MINIMIZE, ...args);
});
ipcRenderer.on(Window.Event.MAXIMIZE, (event, ...args) => {
	chromium.signal(Window.Event.MAXIMIZE, ...args);
});
ipcRenderer.on(Window.Event.UNMAXIMIZE, (event, ...args) => {
	chromium.signal(Window.Event.UNMAXIMIZE, ...args);
});
ipcRenderer.on(Window.Event.CONTEXTMENU, (event, ...args) => {
	chromium.signal(Window.Event.CONTEXTMENU, ...args);
});
ipcRenderer.on(Window.Event.ENTER_FULL_SCREEN, (event, ...args) => {
	chromium.signal(Window.Event.ENTER_FULL_SCREEN, ...args);
});
ipcRenderer.on(Window.Event.LEAVE_FULL_SCREEN, (event, ...args) => {
	chromium.signal(Window.Event.LEAVE_FULL_SCREEN, ...args);
});

async function call<T>(command: Window.Function | Window.Property, ...args: Array<unknown>) {
	// cache
	const response = await ipcRenderer.invoke("chromium", command, ...args);
	
	print({ command: command, response: response });

	return response as T;
}

Object.defineProperty(window, "chromium", {
	value: new Chromium()
});

export default Chromium;
