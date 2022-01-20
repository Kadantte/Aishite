// nodejs
const node_fs = require("fs");

function comment(type, args) {
	// communicate
	postMessage({ type: type, args: args });

	if (type === "STATUS") {
		switch (args) {
			case "ERROR":
			case "FINISHED": {
				return close();
			}
		}
	}
}

class WorkerFile {
	// Array<WorkerFile>
	static files = [];
	static finished = false;
	static bytes_per_second = 0;

	constructor({ url, path, size }) {
		this.url = url;
		this.xhr = null;
		this.path = path;
		this.size = size;
		this.bytes = node_fs.existsSync(path) ? node_fs.statSync(path).size : 0;

		WorkerFile.files.push(this);
	}
	start() {
		return new Promise((resolve, reject) => {
			// tracker
			let index = 0, offset = this.bytes;
			// constant
			const stream = new node_fs.WriteStream(this.path);
			// instance
			this.xhr = new XMLHttpRequest();
			// accept
			this.xhr.responseType = "arraybuffer";
			// ready
			this.xhr.open("GET", this.url);
			// offset
			this.xhr.setRequestHeader("range", `bytes=${this.bytes}-`);
			// chunk
			this.xhr.addEventListener("progress", (event) => {
				// can be null
				if (this.xhr.response) {
					// write
					stream.write(new Uint8Array(index ? this.xhr.response.slice(index) : this.xhr.response));
					// update BPS
					WorkerFile.bytes_per_second += this.xhr.response.byteLength - index;
					// update index
					index = this.xhr.response.byteLength;
					// update bytes
					this.bytes = offset + event.loaded;
				}
			});
			// complete
			this.xhr.addEventListener("loadend", (event) => {
				// check for DEAD-END
				stream.close(() => {
					switch (this.xhr.status) {
						case 404: {
							if (!offset) node_fs.unlinkSync(this.path);
							comment("STATUS", "ERROR");
							break;
						}
						default: {
							resolve();
							break;
						}
					}
				});
			});
			// size
			this.xhr.addEventListener("loadstart", (event) => {
				if (!this.size) this.size = event.total;
			});
			this.xhr.send();
			// communicate
			comment("STATUS", "WORKING");
		});
	}
	// pause() {
	// 	if (!this.xhr) {
	// 		throw new Error("You cannot pause aborted request");
	// 	}
	// 	this.xhr.abort();
	// 	// communicate
	// 	comment("STATUS", "PAUSED");
	// }
	// resume() {
	// 	if (this.xhr) {
	// 		throw new Error("You cannot resume ongoing request");
	// 	}
	// 	this.start();
	// 	// communicate
	// 	comment("STATUS", "WORKING");
	// }
}

let spawn = 0;
let progress = null;
let concurrent = 0;

function cycle(thread) {
	spawn++;
	thread.start().then(() => {
		spawn--;
		WorkerFile.finished++;
		// finished
		if (WorkerFile.files.length === WorkerFile.finished) {
			return comment("STATUS", "FINISHED");
		}
		// indexing
		for (const worker of WorkerFile.files) {
			if ((worker.size ? worker.size !== worker.bytes : true) && concurrent > spawn) {
				return cycle(worker);
			}
		}
	});
}

function trace_on() {
	if (progress) throw new Error("Interval is defined");
	// every 1 second
	progress = setInterval(() => {
		comment("BPS", {
			files: WorkerFile.files.map((file) => ({ url: file["url"], path: file["path"], size: file["size"], bytes: file["bytes"] })),
			bytes_per_second: WorkerFile.bytes_per_second
		});
		// reset
		WorkerFile.bytes_per_second = 0;
	},
	/* 1s = 1000ms */ 1000);
}

function trace_off() {
	if (!progress) throw new Error("Interval is undefined");
	clearInterval(progress);
	progress = null;
}

self.addEventListener("message", (event) => {
	//
	// type: START / PAUSE / RESUME
	// args: { files: Array<{ url: string; path: string; size: number; }>; concurrent: number;  }
	//
	const { type, args } = event.data;

	switch (type) {
		case "START": {
			// update
			concurrent = args["concurrent"];
			// indexing
			for (const file of args["files"]) {
				// spawn
				const thread = new WorkerFile({ url: file["url"], path: file["path"], size: file["size"] ?? 0 });

				if (thread.size ? thread.size !== thread.bytes : true) {
					if (concurrent > spawn) {
						// recursive
						cycle(thread);
					}
				} else {
					WorkerFile.finished++;
				}
			}
			trace_on();
			break;
		}
		case "STOP": {
			WorkerFile.files.map((file) => file.xhr.abort());
			trace_off();
			close();
			break;
		}
		// case "PAUSE": {
		// 	WorkerFile.files.map((file) => file.pause());
		// 	trace_off();
		// 	break;
		// }
		// case "RESUME": {
		// 	WorkerFile.files.map((file) => file.resume());
		// 	trace_on();
		// 	break;
		// }
		case "REMOVE": {
			WorkerFile.files.map((file) => node_fs.unlinkSync(file.path));
			trace_off();
			close();
			break;
		}
	}
});
