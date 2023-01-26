import { app, net, shell, session, Menu, ipcMain, BrowserWindow } from "electron";

import node_fs from "fs";
import node_path from "path";

import { Window } from "models/chromium";

let window: BrowserWindow;

const [instance, shortcut] = [app.requestSingleInstanceLock(), [{ role: "toggleDevTools" }, { role: "togglefullscreen" }] as Parameters<typeof Menu.buildFromTemplate>[0]];

if (!instance) {
	app.quit();
}

if (!app.isPackaged) {
	node_fs.watch(node_path.resolve(__dirname, "preload.js")).on("change", () => window.reload());
	node_fs.watch(node_path.resolve(__dirname, "renderer.js")).on("change", () => window.reload());
}

Menu.setApplicationMenu(Menu.buildFromTemplate(shortcut));

app.on("ready", () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { screen } = require("electron");

	class Resolution {
		public static width(pixels: number = screen.getPrimaryDisplay().workArea.width) {
			return Math.round(pixels * 0.3);
		}
		public static height(pixels: number = screen.getPrimaryDisplay().workArea.height) {
			return Math.round((pixels - 180.0 - (/* GALLERY GAP */ 20.0)) * 0.5 + 180.0);
		}
	}

	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => callback({
		requestHeaders: { ...details.requestHeaders, referer: "https://hitomi.la" }
	}));

	window = new BrowserWindow({
		icon: "source/assets/icon.ico",
		show: false,
		frame: false,
		width: Resolution.width(),
		height: Resolution.height(),
		minWidth: Resolution.width(),
		minHeight: Resolution.height(),
		webPreferences: {
			preload: node_path.resolve(__dirname, "preload.js"),
			nodeIntegration: true,
			contextIsolation: false,
			nodeIntegrationInWorker: true
		},
		backgroundColor: "black"
	});

	function print(...args: Array<unknown>) {
		window.webContents.send("console", ...args);
	}

	//
	// behaviours
	//
	window.on("close", (event) => {
		event.preventDefault();
	});
	window.on("unresponsive", () => {
		window.reload();
	});
	window.on("ready-to-show", () => {
		window.show();
	});
	///
	// https://github.com/electron/electron/issues/24893#issuecomment-1109262719
	//
	window.hookWindowMessage(0x0116, () => {
		window.setEnabled(false);
		window.setEnabled(true);

		const [position, cursor] = [{ x: window.getPosition()[0] ?? 0, y: window.getPosition()[1] ?? 0 } as Electron.Point, screen.getCursorScreenPoint()];

		window.webContents.send(Window.Event.CONTEXTMENU, { x: cursor.x - position.x, y: cursor.y - position.y });
	});
	//
	// events
	//
	window.on(Window.Event.BLUR, () => window.webContents.send(Window.Event.BLUR));
	window.on(Window.Event.FOCUS, () => window.webContents.send(Window.Event.FOCUS));
	window.on(Window.Event.CLOSE, () => window.webContents.send(Window.Event.CLOSE));
	window.on(Window.Event.MINIMIZE, () => window.webContents.send(Window.Event.MINIMIZE));
	window.on(Window.Event.MAXIMIZE, () => window.webContents.send(Window.Event.MAXIMIZE));
	window.on(Window.Event.UNMAXIMIZE, () => window.webContents.send(Window.Event.UNMAXIMIZE));
	window.on(Window.Event.ENTER_FULL_SCREEN, () => window.webContents.send(Window.Event.ENTER_FULL_SCREEN));
	window.on(Window.Event.LEAVE_FULL_SCREEN, () => window.webContents.send(Window.Event.LEAVE_FULL_SCREEN));
	//
	// https://github.com/electron/electron/issues/24759
	//
	ipcMain.handle("chromium", async (event, command: string, ...args: Array<unknown>) => {
		switch (command as Window.Function | Window.Property) {
			//
			// function
			//
			case Window.Function.BLUR: {
				setTimeout(() => window.blur(), 150);
				break;
			}
			case Window.Function.FOCUS: {
				setTimeout(() => window.focus(), 150);
				break;
			}
			case Window.Function.CLOSE: {
				window.destroy();
				break;
			}
			case Window.Function.OPEN_URL: {
				shell.openExternal(args[0] as string);
				break;
			}
			case Window.Function.MINIMIZE: {
				setTimeout(() => window.minimize(), 150);
				break;
			}
			case Window.Function.MAXIMIZE: {
				setTimeout(() => window.maximize(), 150);
				break;
			}
			case Window.Function.UNMAXIMIZE: {
				setTimeout(() => window.unmaximize(), 150);
				break;
			}
			case Window.Function.FULLSCREEN: {
				switch (window.isFullScreen()) {
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
				window.webContents.toggleDevTools();
				break;
			}
			//
			// property
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
	// check for an update
	//
	if (app.isPackaged) {
		const [chunks, request] = [new Array<Buffer>(), net.request({ method: "GET", protocol: "https:", hostname: "api.github.com", path: "repos/Any-Material/Daisuki/releases?per_page=100" })];

		request.setHeader("content-type", "application/json");

		request.on("response", (response) => {
			response.on("data", (chunk) => {
				chunks.push(chunk);
			});
			response.on("end", () => {
				const json = JSON.parse(Buffer.concat(chunks).toString());

				function parse(value: string) {
					return Number(value.match(/-?\d+/g)?.join(""));
				}
				if (parse(json[0]["tag_name"]) > parse(app.getVersion())) {
					// yes!
					shell.openExternal(json[0]["html_url"]).then(() => window.destroy());
				}
			});
		});
		request.end();
	}
	//
	// webpack or ASAR
	//
	window.loadFile(node_path.resolve(__dirname, "index.html")).then(() => print("main.ts"));
});
