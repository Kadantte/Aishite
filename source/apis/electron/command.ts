import { ipcRenderer } from "electron";

import { Window } from "@/apis/electron/bridge";

import settings from "@/modules/settings";

const certification = new Set<string>();

export enum Command {
	BLUR = "blur",
	FOCUS = "focus",
	CLOSE = "close",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	FULLSCREEN = "fullscreen",
	DEVELOPMENT = "development"
}

function call(command: Command, ...args: Array<unknown>) {
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
	value: {
		[Command.CLOSE](ticket: string) {
			if (certification.has(ticket)) {
				throw Error();
			} else {
				certification.add(ticket);
			}
			for (const vertify of settings.state.app.requires) {
				if (!certification.has(vertify)) {
					return bridge.trigger(Window.CLOSE);
				}
			}
			return call(Command.CLOSE);
		},
		[Command.BLUR]() {
			return call(Command.BLUR);
		},
		[Command.FOCUS]() {
			return call(Command.FOCUS);
		},
		[Command.MINIMIZE]() {
			return call(Command.MINIMIZE);
		},
		[Command.MAXIMIZE]() {
			return call(Command.MAXIMIZE);
		},
		[Command.UNMAXIMIZE]() {
			return call(Command.UNMAXIMIZE);
		},
		[Command.FULLSCREEN]() {
			return call(Command.FULLSCREEN);
		},
		[Command.DEVELOPMENT]() {
			return call(Command.DEVELOPMENT);
		}
	}
});
