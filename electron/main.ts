// electron
import { app, session, Menu, BrowserWindow, ipcMain } from "electron";
// node.js
import node_fs from "fs";
import node_path from "path";
// api
import { API_COMMAND, BridgeEvent } from "@/api";

let window: Nullable<BrowserWindow> = null;

const instance = app.requestSingleInstanceLock();

if (instance) {
	app.on("second-instance", (event, argv) => {
		window?.webContents.send(BridgeEvent.OPEN_URL, argv);
	});
} else {
	app.quit();
}

if (app.isPackaged) {
	// remove default shortcuts
	Menu.setApplicationMenu(null);
	// URL scheme
	app.setAsDefaultProtocolClient("hitomi.la");
} else {
	// auto-reload
	node_fs.watch(node_path.resolve(__dirname, "preload.js")).on("change", () => window?.reload());
	node_fs.watch(node_path.resolve(__dirname, "renderer.js")).on("change", () => window?.reload());

	if (process.platform === "win32") {
		// URL scheme
		app.setAsDefaultProtocolClient("hitomi.la", process.argv[0], [node_path.resolve(process.argv[1])]);
	}
}

app.on("ready", () => {
	// clear cache
	session.defaultSession.clearCache();
	// bypass origin policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => callback({ requestHeaders: Object.assign({ Referer: "https://hitomi.la" }, details.requestHeaders) }));
	// create window
	window = new BrowserWindow({
		icon: "source/assets/aishite.ico",
		show: false,
		frame: false,
		width: 550,
		height: 600,
		minWidth: 550,
		minHeight: 600,
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
	window.on("ready-to-show", () => {
		window?.show();
	});
	window.on("unresponsive", () => {
		window?.reload();
	});
	// webpack or ASAR
	window.loadFile(node_path.resolve(__dirname, "index.html"));
	// bridge
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
	ipcMain.handle("API", (event, command: API_COMMAND) => {
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
});
