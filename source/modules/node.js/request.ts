import node_fs from "fs";
import node_tls from "tls";
import node_http from "http";
import node_https from "https";

import settings from "@/modules/settings";

enum Engine {
	XHR = "xhr",
	NODE_JS = "node_js"
}

enum RequestType {
	GET = "GET",
	PUT = "PUT",
	POST = "POST",
	HEAD = "HEAD",
	DELETE = "DELETE"
}

interface RequestStatus {
	readonly code: number;
	readonly message: string;
}

interface RequestHeaders {
	readonly [key: string]: Array<string> | string | undefined;
}

interface RequestOptions {
	readonly url: string;
	readonly type: XMLHttpRequestResponseType;
	readonly method: RequestType;
	readonly headers: RequestHeaders;
}

interface RequestResponse<T extends XMLHttpRequestResponseType> {
	readonly body: T extends "arraybuffer" ? ArrayBuffer : T extends "document" ? Document : T extends "json" ? Record<string, never> : T extends "text" ? string : unknown;
	readonly status: RequestStatus;
	readonly headers: RequestHeaders;
}

class Client {
	private readonly _agent: node_https.Agent;

	constructor() {
		this._agent = new node_https.Agent({});

		Object.defineProperty(this._agent, "createConnection", {
			value: (options: node_tls.ConnectionOptions, callback: () => void): node_tls.TLSSocket => {
				return node_tls.connect({ ...options, servername: undefined }, callback);
			}
		});
	}
	protected async send(engine: Engine, args: RequestOptions, file?: string) {
		return this[engine](args, file);
	}
	protected async [Engine.XHR](args: RequestOptions, file?: string) {
		return new Promise<RequestResponse<typeof args["type"]>>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const headers = new Map<string, string>();

			// ready
			xhr.open(args.method, args.url.replace(/\s/g, "%20"));
			// set data type
			xhr.responseType = args.type;

			for (const [key, value] of Object.entries(args.headers)) {
				switch (value) {
					case undefined: {
						break;
					}
					default: {
						xhr.setRequestHeader(key, value.toString());
						break;
					}
				}
			}
			// HANDLE
			xhr.addEventListener("readystatechange", (event) => {
				// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
				if (xhr.readyState === xhr.HEADERS_RECEIVED) {
					for (const header of xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
						//
						// 0: key
						// 1: value
						//
						const [key, value] = header.split(/:\s/) as [string, string];

						headers.set(key, value);
					}
					// redirects
					if (headers.has("location")) {
						return this.send(Engine.XHR, { ...args, url: headers.get("location")! }, file);
					}
				}
			});
			xhr.addEventListener("load", (event) => {
				return resolve({
					body: xhr.response,
					status: {
						code: xhr.status,
						message: xhr.statusText
					},
					headers: Object.fromEntries(headers)
				});
			});
			// ERROR
			xhr.addEventListener("abort", (event) => {
				return reject(event);
			});
			xhr.addEventListener("error", (event) => {
				return reject(event);
			});
			xhr.addEventListener("timeout", (event) => {
				return reject(event);
			});
			// FIRE
			xhr.send();
		});
	}
	protected async [Engine.NODE_JS](args: RequestOptions, file?: string) {
		return new Promise<RequestResponse<typeof args["type"]>>((resolve, reject) => {
			// cache
			const SSL = /^https/.test(args.url);

			const chunks = Array<Buffer>();
			const fragment = (args.url === decodeURI(args.url) ? encodeURI(args.url) : args.url).replace(/https?:\/\//, "").replace(/\s/g, "%20").split("/");

			const host = fragment[0];
			const path = fragment.map((element, index) => index > 0 ? element : "").join("/");

			const request = (SSL ? node_https : node_http).request({
				host: host,
				path: path,
				agent: this._agent,
				method: args.method,
				headers: args.headers,
				protocol: SSL ? "https:" : "http:"
			});
			// HANDLE
			request.on("response", (response) => {
				// redirects
				if (response.headers["location"]) {
					return this.send(Engine.NODE_JS, { ...args, url: response.headers["location"] }, file);
				}
				// write
				if (file) {
					response.pipe(node_fs.createWriteStream(file));
				}
				// HANDLE
				response.on("data", (chunk) => {
					chunks.add(Buffer.from(chunk));
				});
				response.on("end", () => {
					return resolve({
						body: (() => {
							const buffer = Buffer.concat(chunks);

							switch (args.type) {
								case "arraybuffer": {
									return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
								}
								case "json": {
									return buffer.toJSON();
								}
								case "text": {
									return buffer.toString();
								}
							}
						})(),
						status: {
							code: response.statusCode ?? 404,
							message: response.statusMessage ?? "N/A"
						},
						headers: response.headers
					});
				});
				// ERROR
				response.on("error", (event) => {
					return reject(event);
				});
			});
			// ERROR
			request.on("error", (event) => {
				return reject(event);
			});
			// FIRE
			request.end();
		});
	}
	public async GET(url: RequestOptions["url"], type: "text", headers?: RequestOptions["headers"]): Promise<RequestResponse<"text">>;
	public async GET(url: RequestOptions["url"], type: "blob", headers?: RequestOptions["headers"]): Promise<RequestResponse<"blob">>;
	public async GET(url: RequestOptions["url"], type: "json", headers?: RequestOptions["headers"]): Promise<RequestResponse<"json">>;
	public async GET(url: RequestOptions["url"], type: "document", headers?: RequestOptions["headers"]): Promise<RequestResponse<"document">>;
	public async GET(url: RequestOptions["url"], type: "arraybuffer", headers?: RequestOptions["headers"]): Promise<RequestResponse<"arraybuffer">>;

	public async GET(url: RequestOptions["url"], type: RequestOptions["type"], headers: RequestOptions["headers"] = {}) {
		return this.send(settings.state.app.request.engine as Engine, { url: url, type: type, method: RequestType.GET, headers: headers });
	}
	public async PUT(url: RequestOptions["url"], type: RequestOptions["type"], headers: RequestOptions["headers"] = {}) {
		return this.send(settings.state.app.request.engine as Engine, { url: url, type: type, method: RequestType.GET, headers: headers });
	}
	public async POST(url: RequestOptions["url"], type: RequestOptions["type"], headers: RequestOptions["headers"] = {}) {
		return this.send(settings.state.app.request.engine as Engine, { url: url, type: type, method: RequestType.GET, headers: headers });
	}
	public async HEAD(url: RequestOptions["url"], type: RequestOptions["type"], headers: RequestOptions["headers"] = {}) {
		return this.send(settings.state.app.request.engine as Engine, { url: url, type: type, method: RequestType.GET, headers: headers });
	}
	public async DELETE(url: RequestOptions["url"], type: RequestOptions["type"], headers: RequestOptions["headers"] = {}) {
		return this.send(settings.state.app.request.engine as Engine, { url: url, type: type, method: RequestType.GET, headers: headers });
	}
}

const singleton = new Client();

export default singleton;
