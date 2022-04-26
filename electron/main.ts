import { app, session, Menu, ipcMain, BrowserWindow } from "electron";

import node_fs from "fs";
import node_path from "path";

import { API_COMMAND, BridgeEvent } from "@/api";

let window: Nullable<BrowserWindow> = null;

Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: "togglefullscreen" }]));

const instance = app.requestSingleInstanceLock();

if (!instance) app.quit();

if (!app.isPackaged) {
	// hot-reload
	node_fs.watch(node_path.resolve(__dirname, "preload.js")).on("change", () => window?.reload());
	node_fs.watch(node_path.resolve(__dirname, "renderer.js")).on("change", () => window?.reload());
}

const FHD = !app.isPackaged;

app.on("ready", () => {
	// cannot require until app is ready
	const { screen } = require("electron");
	
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => callback({ requestHeaders: Object.assign({ Referer: "https://hitomi.la" }, details.requestHeaders) }));

	const resolution = {
		width(pixels: number = screen.getPrimaryDisplay().workArea.width) {
			const offset = 15 + 15;

			return Math.round((pixels - offset) / 5 * 1.5 + (offset));
		},
		height(pixels: number = screen.getPrimaryDisplay().workArea.height + (/* TASKBAR */ 45)) {
			const offset = 40 + 15 + 40 + 15 + 15 + 15 + 45;

			return Math.round((pixels - (/* TASKBAR */ 45) - offset) / 2 + (offset - 15));
		}
	};
	// create window
	window = new BrowserWindow({
		icon: "source/assets/aishite.ico",
		show: false,
		frame: false,
		...(FHD ? {
			width: resolution.width(1920),
			height: resolution.height(1080),
			minWidth: resolution.width(1920),
			maxWidth: 1920,
			minHeight: resolution.height(1080),
			maxHeight: 1080 - (/* TASKBAR */ 45)
		} : {
			width: resolution.width(),
			height: resolution.height(),
			minWidth: resolution.width(),
			maxWidth: undefined,
			minHeight: resolution.height(),
			maxHeight: undefined
		}),
		webPreferences: {
			// webpack or ASAR
			preload: node_path.resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false,
			// early adaptor
			experimentalFeatures: true,
			// allow webworker interacts with nodejs
			nodeIntegrationInWorker: true
		},
		backgroundColor: "#00000000"
	});
	window.on("ready-to-show", () => {
		window?.show();
	});
	window.on("unresponsive", () => {
		window?.reload();
	});
	window.on(BridgeEvent.CLOSE, (event) => {
		// prevent
		event.preventDefault();
		// send event anyways
		window?.webContents.send(BridgeEvent.CLOSE);
	});
	window.on(BridgeEvent.FOCUS, () => {
		window?.webContents.send(BridgeEvent.FOCUS);
	});
	window.on(BridgeEvent.BLUR, () => {
		window?.webContents.send(BridgeEvent.BLUR);
	});
	window.on(BridgeEvent.MINIMIZE, () => {
		window?.webContents.send(BridgeEvent.MINIMIZE);
	});
	window.on(BridgeEvent.MAXIMIZE, () => {
		window?.webContents.send(BridgeEvent.MAXIMIZE);
	});
	window.on(BridgeEvent.UNMAXIMIZE, () => {
		window?.webContents.send(BridgeEvent.UNMAXIMIZE);
	});
	window.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
		window?.webContents.send(BridgeEvent.ENTER_FULL_SCREEN);
	});
	window.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
		window?.webContents.send(BridgeEvent.LEAVE_FULL_SCREEN);
	});
	ipcMain.handle("protocol", (event, command: API_COMMAND) => {
		setTimeout(() => {
			switch (command) {
				case API_COMMAND.CLOSE: {
					return window?.destroy();
				}
				case API_COMMAND.FOCUS: {
					return window?.focus();
				}
				case API_COMMAND.BLUR: {
					return window?.blur();
				}
				case API_COMMAND.MINIMIZE: {
					return window?.minimize();
				}
				case API_COMMAND.MAXIMIZE: {
					return window?.maximize();
				}
				case API_COMMAND.UNMAXIMIZE: {
					return window?.unmaximize();
				}
				case API_COMMAND.FULLSCREEN: {
					return window?.setFullScreen(!window.isFullScreen());
				}
				case API_COMMAND.DEVELOPMENT: {
					return window?.webContents.toggleDevTools();
				}
			}
		}, /** @see https://github.com/electron/electron/issues/24759 */ 150);
	});
	// webpack or ASAR
	window.loadFile(node_path.resolve(__dirname, "index.html"));
});
