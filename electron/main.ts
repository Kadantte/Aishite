import { app, shell, session, Menu, ipcMain, BrowserWindow } from "electron";

import node_fs from "fs";
import node_path from "path";

import { Window } from "@/models/window";

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
	window.on("ready-to-show", () => {
		// show app
		window?.show();
	});
	window.on("unresponsive", () => {
		// reload app
		window?.reload();
	});
	window.on(Window.CLOSE, (event) => {
		// prevent
		event.preventDefault();
		// send event anyways
		window?.webContents.send(Window.CLOSE);
	});
	//
	// chromium events
	//
	window.on(Window.BLUR, () => window?.webContents.send(Window.BLUR));
	window.on(Window.FOCUS, () => window?.webContents.send(Window.FOCUS));
	window.on(Window.MINIMIZE, () => window?.webContents.send(Window.MINIMIZE));
	window.on(Window.MAXIMIZE, () => window?.webContents.send(Window.MAXIMIZE));
	window.on(Window.UNMAXIMIZE, () => window?.webContents.send(Window.UNMAXIMIZE));
	window.on(Window.ENTER_FULL_SCREEN, () => window?.webContents.send(Window.ENTER_FULL_SCREEN));
	window.on(Window.LEAVE_FULL_SCREEN, () => window?.webContents.send(Window.LEAVE_FULL_SCREEN));
	//
	// https://github.com/electron/electron/issues/24759
	//
	ipcMain.handle("chromium", async (event, command: string, ...args: Array<any>) => {
		switch (command) {
			//
			// Events
			//
			case Events.CLOSE: {
				window?.destroy();
				break;
			}
			case Events.BLUR: {
				setTimeout(() => window?.blur(), 150);
				break;
			}
			case Events.FOCUS: {
				setTimeout(() => window?.focus(), 150);
				break;
			}
			case Events.MINIMIZE: {
				setTimeout(() => window?.minimize(), 150);
				break;
			}
			case Events.MAXIMIZE: {
				setTimeout(() => window?.maximize(), 150);
				break;
			}
			case Events.UNMAXIMIZE: {
				setTimeout(() => window?.unmaximize(), 150);
				break;
			}
			case Events.FULLSCREEN: {
				window?.setFullScreen(!window.isFullScreen());
				break;
			}
			//
			// Functions
			//
			case Functions.OPEN_URL: {
				shell.openExternal(args[0]);
				break;
			}
			case Functions.DEVELOPMENT: {
				window?.webContents.toggleDevTools();
				break;
			}
			//
			// Properties
			//
			case Properties.VERSION: {
				return app.getVersion();
			}
			case Properties.IS_PACKAGED: {
				return app.isPackaged;
			}
		}
	});
	//
	// webpack or ASAR
	//
	window.loadFile(node_path.resolve(__dirname, "index.html"));
});
