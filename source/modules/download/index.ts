/** @see https://stackoverflow.com/questions/38715001/how-to-make-web-workers-with-typescript-and-webpack */
import _ from "file-loader?name=[name].js!./worker";
// modules
import { GalleryBlock, GalleryScript } from "@/modules/hitomi.la/gallery";
// states
import { MappedStateHandler } from "@/states";
// api
import { BridgeEvent } from "@/api";

import settings from "@/modules/settings";

enum WorkerStatus {
	READY = "READY",
	ERROR = "ERROR",
	QUEUED = "QUEUED",
	PAUSED = "PAUSED",
	WORKING = "WORKING",
	FINISHED = "FINISHED"
}

class DownloaderState {
	public status: WorkerStatus;
	public bytes_per_second: number;

	constructor(args: Args<DownloaderState>) {
		this.status = args.status;
		this.bytes_per_second = args.bytes_per_second;
	}
}

export class Downloader extends MappedStateHandler<Record<number, DownloaderState>> {
	/** DO NOT MODIFY UNLESS CERTAIN. */
	protected static readonly workers: Record<number, Worker> = {};

	public get state() {
		return super.state;
	}
	public set state(state: Downloader["_state"]) {
		super.state = state;
		// WIP

	}
	protected create() {
		// WIP
	}
	public start(id: number) {
		return new Promise<WorkerStatus>((resolve, reject) => {
			// concurrent limit
			if (Object.keys(Downloader.workers).length >= settings.state.download.concurrent) {
				// queue
				this.queue(id);
				// resolve
				return resolve(this.state[id].status);
			}
			const worker = new Worker(_);
			// assign
			Downloader.workers[id] = worker;
			// state
			this.modify(id, new DownloaderState({ status: WorkerStatus.READY, bytes_per_second: 0 }));
			// handler
			worker.addEventListener("message", (event) => {
				// UWU?
				const { type, args } = event.data;

				switch (type) {
					case "BPS": {
						// notify
						this.modify(id, new DownloaderState({ ...this.state[id], bytes_per_second: args.bytes_per_second }));
						break;
					}
					case "STATUS": {
						// notify
						this.modify(id, new DownloaderState({ ...this.state[id], status: args }));

						switch (args as WorkerStatus) {
							case WorkerStatus.ERROR: {
								// WIP
								break;
							}
							case WorkerStatus.WORKING: {
								// WIP
								break;
							}
							case WorkerStatus.FINISHED: {
								return resolve(this.state[id].status);
							}
						}
						break;
					}
				}
			});
			// fetch block
			GalleryBlock(id).then((block) => {
				// fetch script
				GalleryScript(id).then((script) => {
					// communicate
					this.comment(id, "START", {
						files: script.files.map((file, index) => ({ url: file.url, path: this.guidance(block, index, file.url.split(/\./).last ?? "unknown") })),
						concurrent: settings.state.download.concurrent
					});
				});
			});
		});
	}
	public queue(id: number) {
		return new Promise<void>((resolve, reject) => {
			// state
			this.modify(id, new DownloaderState({ ...this.state[id], status: WorkerStatus.QUEUED }));
			// resolve
			return resolve();
		});
	}
	public pause(id: number) {
		return new Promise<void>((resolve, reject) => {
			// state
			this.modify(id, new DownloaderState({ ...this.state[id], status: WorkerStatus.PAUSED }));
			// communicate
			this.comment(id, "STOP", null);
			// clear
			delete Downloader.workers[id];
			// resolve
			return resolve();
		});
	}
	public remove(id: number) {
		return new Promise<void>((resolve, reject) => {
			// state
			this.modify(id, null);
			// communicate
			this.comment(id, "REMOVE", null);
			// clear
			delete Downloader.workers[id];
			// resolve
			return resolve();
		});
	}
	protected comment(id: number, type: string, args: any) {
		// communicate
		Downloader.workers[id].postMessage({ type: type, args: args });
	}
	protected guidance(block: GalleryBlock, index: number, extension: string) {
		// cache
		let path = settings.state.download.folder + "/" + settings.state.download.file;
		// @ts-ignore
		block["index"] = index;
		// @ts-ignore
		block["extension"] = extension;

		for (const key of Object.keys(block)) {
			switch (key) {
				// skip following
				case "thumbnail":
				case "artist":
				case "tags": {
					break;
				}
				default: {
					if (block[key as keyof GalleryBlock]) path = path.replace(new RegExp(`\((${key})\)`), block[key as keyof GalleryBlock]!.toString());
					break;
				}
			}
		}
		return path;
	}
}

const singleton = new Downloader({
	state: {}
});

export default singleton;
