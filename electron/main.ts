import { app, shell, session, Menu, ipcMain, BrowserWindow } from "electron";

import node_fs from "fs";
import node_path from "path";

import { Window } from "@/models/chromium";

let window: Nullable<BrowserWindow> = null;

const instance = app.requestSingleInstanceLock();

if (!instance) {
	//
	// single instance
	//
	app.quit();
}

const shortcut: Parameters<typeof Menu.buildFromTemplate>[0] = [];

switch (app.isPackaged) {
	case true: {
		shortcut.push({ role: "togglefullscreen" });
		break;
	}
	case false: {
		shortcut.push({ role: "toggleDevTools" });
		shortcut.push({ role: "togglefullscreen" });
		//
		// hot-reload
		//
		node_fs.watch(node_path.resolve(__dirname, "preload.js")).on("change", () => window?.reload());
		node_fs.watch(node_path.resolve(__dirname, "renderer.js")).on("change", () => window?.reload());
		break;
	}
}

Menu.setApplicationMenu(Menu.buildFromTemplate(shortcut));

app.on("ready", () => {
	//
	// cannot require until app is ready
	//
	const { screen } = require("electron");

	class Resolution {
		public static width(pixels: number = screen.getPrimaryDisplay().workArea.width) {
			return Math.round((pixels - 30) * 0.3 + 30);
		}
		public static height(pixels: number = screen.getPrimaryDisplay().workArea.height + (/* TASKBAR */ 45)) {
			return Math.round((pixels - (/* TASKBAR */ 45) - 185) * 0.5 + 170);
		}
	};
	//
	// bypass cross-origin policy
	//
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => callback({
		requestHeaders: {
			// inherit
			...details.requestHeaders,
			// override
			referer: "https://hitomi.la"
		}
	}));
	//
	// window instance
	//
	window = new BrowserWindow({
		icon: "source/assets/icon.ico",
		show: false,
		frame: false,
		width: Resolution.width(),
		height: Resolution.height(),
		minWidth: Resolution.width(),
		minHeight: Resolution.height(),
		webPreferences: {
			// webpack or ASAR
			preload: node_path.resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false,
			// allow webworker interacts with nodejs
			nodeIntegrationInWorker: true
		},
		backgroundColor: "#00000000"
	});
	//
	// behaviours
	//
	window.on("close", (event) => {
		// prevent
		event.preventDefault();
	});
	window.on("unresponsive", () => {
		// reload
		window?.reload();
	});
	window.on("ready-to-show", () => {
		// display
		window?.show();
	});
	//
	// https://github.com/electron/electron/issues/24893#issuecomment-1109262719
	//
	window.hookWindowMessage(0x0116, () => {
		// prevent
		window?.setEnabled(false);
		window?.setEnabled(true);

		const [position, cursor] = [{ x: window?.getPosition()[0] ?? 0, y: window?.getPosition()[1] ?? 0 } as Electron.Point, screen.getCursorScreenPoint()];

		window?.webContents.send(Window.Event.CONTEXTMENU, { x: cursor.x - position.x, y: cursor.y - position.y });
	});
	//
	// chromium events
	//
	window.on(Window.Event.BLUR, () => window?.webContents.send(Window.Event.BLUR));
	window.on(Window.Event.FOCUS, () => window?.webContents.send(Window.Event.FOCUS));
	window.on(Window.Event.CLOSE, () => window?.webContents.send(Window.Event.CLOSE));
	window.on(Window.Event.MINIMIZE, () => window?.webContents.send(Window.Event.MINIMIZE));
	window.on(Window.Event.MAXIMIZE, () => window?.webContents.send(Window.Event.MAXIMIZE));
	window.on(Window.Event.UNMAXIMIZE, () => window?.webContents.send(Window.Event.UNMAXIMIZE));
	window.on(Window.Event.ENTER_FULL_SCREEN, () => window?.webContents.send(Window.Event.ENTER_FULL_SCREEN));
	window.on(Window.Event.LEAVE_FULL_SCREEN, () => window?.webContents.send(Window.Event.LEAVE_FULL_SCREEN));
	//
	// https://github.com/electron/electron/issues/24759
	//
	ipcMain.handle("chromium", async (event, command: string, ...args: Array<any>) => {
		switch (command as Window.Function | Window.Property) {
			//
			// Function
			//
			case Window.Function.BLUR: {
				setTimeout(() => window?.blur(), 150);
				break;
			}
			case Window.Function.FOCUS: {
				setTimeout(() => window?.focus(), 150);
				break;
			}
			case Window.Function.CLOSE: {
				window?.destroy();
				break;
			}
			case Window.Function.OPEN_URL: {
				shell.openExternal(args[0]);
				break;
			}
			case Window.Function.MINIMIZE: {
				setTimeout(() => window?.minimize(), 150);
				break;
			}
			case Window.Function.MAXIMIZE: {
				setTimeout(() => window?.maximize(), 150);
				break;
			}
			case Window.Function.UNMAXIMIZE: {
				setTimeout(() => window?.unmaximize(), 150);
				break;
			}
			case Window.Function.FULLSCREEN: {
				switch (window?.isFullScreen()) {
					case true: {
						window.setFullScreen(false);
						break;
					}
					case false: {
						window.setFullScreen(true);
						break;
					}
				}
				break;
			}
			case Window.Function.DEVELOPMENT: {
				window?.webContents.toggleDevTools();
				break;
			}
			//
			// Property
			//
			case Window.Property.VERSION: {
				return app.getVersion();
			}
			case Window.Property.IS_PACKAGED: {
				return app.isPackaged;
			}
		}
	});
	//
	// webpack or ASAR
	//
	window.loadFile(node_path.resolve(__dirname, "index.html"));
});
