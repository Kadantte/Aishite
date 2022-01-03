type RequestType = "GET" | "PUT" | "POST" | "DELETE" | "HEAD";

type RequestHeaders = Record<string, string>;

class RequestOptions {
	public readonly request: {
		url: string;
		type: XMLHttpRequestResponseType;
		method: RequestType;
	};
	public readonly partial: {
		retry?: number;
		headers?: RequestHeaders;
		redirects?: number;
	};
	public readonly private: {
		retry?: number;
		redirects?: number;
	};

	constructor(args: Args<RequestOptions>) {
		this.request = args.request;
		this.partial = args.partial;
		this.private = args.private;
	}
}

class RequestResponse {
	public readonly encode: string;
	public readonly status: {
		code: number;
		message: string;
	};
	public readonly headers: RequestHeaders;

	constructor(args: Args<RequestResponse>) {
		this.encode = args.encode;
		this.status = args.status;
		this.headers = args.headers;
	}
}

/** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest */
class Request {
	public async send(args: RequestOptions) {
		return new Promise<RequestResponse>((resolve, reject) => {
			const http = {
				xhr: new XMLHttpRequest(),
				headers: <Record<string, string>>{}
			};
			// ready
			http.xhr.open(args.request.method, args.request.url.replace(/\s/g, "%20"), true);
			// set data type
			http.xhr.responseType = args.request.type;

			for (const key of Object.keys(args.partial.headers ?? {})) {
				http.xhr.setRequestHeader(key, args.partial.headers![key]);
			}
			http.xhr.addEventListener("readystatechange", () => {
				if (http.xhr.readyState === http.xhr.HEADERS_RECEIVED) {
					/** @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders */
					for (const header of http.xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
						// 0: key
						// 1: value
						const [key, value] = header.split(/:\s/) as [string, string];

						http.headers[key] = value;
					}
					// redirects
					if (http.headers["location"] && (args.partial.redirects ?? 10) > (args.private.redirects ?? 0)) {
						return this.send(
							new RequestOptions({
								...args,
								request: { ...args.request, url: http.headers["location"] },
								private: { ...args.private, redirects: (args.private.redirects ?? 0) + 1 }
							})
						);
					}
				}
			});
			http.xhr.addEventListener("loadend", () => {
				switch (http.xhr.status) {
					case 404: {
						// retry
						if ((args.partial.retry ?? 0) > (args.private.retry ?? 0)) {
							// make a new request
							return this.send(
								new RequestOptions({
									...args,
									private: { ...args.private, retry: (args.private.retry ?? 0) + 1 }
								})
							);
						}
						// continue
					}
					default: {
						return resolve(new RequestResponse({
							encode: http.xhr.response,
							status: {
								code: http.xhr.status,
								message: http.xhr.statusText
							},
							headers: http.headers
						}));
					}
				}
			});
			http.xhr.addEventListener("abort", (event) => {
				return reject(event);
			});
			http.xhr.addEventListener("error", (event) => {
				return reject(event);
			});
			http.xhr.addEventListener("timeout", (event) => {
				return reject(event);
			});
			// fire
			http.xhr.send();
		});
	}
	public GET(url: string, args?: { type?: RequestOptions["request"]["type"], options?: RequestOptions["partial"] }) {
		return this.send(new RequestOptions({ request: { url: url, type: args?.type ?? "text", method: "GET" }, partial: { ...args?.options }, private: {} }));
	}
	public PUT(url: string, args?: { type?: RequestOptions["request"]["type"], options?: RequestOptions["partial"] }) {
		return this.send(new RequestOptions({ request: { url: url, type: args?.type ?? "text", method: "PUT" }, partial: { ...args?.options }, private: {} }));
	}
	public POST(url: string, args?: { type?: RequestOptions["request"]["type"], options?: RequestOptions["partial"] }) {
		return this.send(new RequestOptions({ request: { url: url, type: args?.type ?? "text", method: "POST" }, partial: { ...args?.options }, private: {} }));
	}
	public HEAD(url: string, args?: { type?: RequestOptions["request"]["type"], options?: RequestOptions["partial"] }) {
		return this.send(new RequestOptions({ request: { url: url, type: args?.type ?? "text", method: "HEAD" }, partial: { ...args?.options }, private: {} }));
	}
	public DELETE(url: string, args?: { type?: RequestOptions["request"]["type"], options?: RequestOptions["partial"] }) {
		return this.send(new RequestOptions({ request: { url: url, type: args?.type ?? "text", method: "DELETE" }, partial: { ...args?.options }, private: {} }));
	}
}

const singleton = new Request();

export default singleton;
