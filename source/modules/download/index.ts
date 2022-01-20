/** @see https://stackoverflow.com/questions/38715001/how-to-make-web-workers-with-typescript-and-webpack */
import _ from "file-loader?name=[name].js!./worker";
// modules
import storage from "@/modules/storage";
// modules/hitomi.la
import { GalleryBlock, GalleryScript } from "@/modules/hitomi.la/gallery";
// states
import { MappedStateHandler } from "@/states";
// api
import { BridgeEvent } from "@/api";

import settings from "@/modules/settings";

type Cache = {
	file: string;
	folder: string;
	caches: Array<number>;
	status: WorkerStatus;
}

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
	}
	protected create() {
		// WIP
	}
	public start(id: number) {
		return new Promise<WorkerStatus>((resolve, reject) => {
			// concurrent
			if (Object.keys(Downloader.workers).length >= settings.state.download.concurrent) {
				// queue
				this.queue(id);
				// resolve
				return resolve(this.state[id].status);
			}
			const worker = new Worker(_);
			// assign/worker
			Downloader.workers[id] = worker;
			// assign/storage
			storage.state[id].state = { file: settings.state.download.file, folder: settings.state.download.folder, caches: [], status: this.state[id].status };
			// notify
			this.modify(id, new DownloaderState({ status: WorkerStatus.READY, bytes_per_second: 0 }));
			// handler
			worker.addEventListener("message", (event) => {
				// UWU?
				const { type, args } = event.data;

				switch (type) {
					case "BPS": {
						// notify
						this.modify(id, new DownloaderState({ ...this.state[id], bytes_per_second: args.bytes_per_second }));
						// update
						storage.state[id].state = { ...storage.state[id].state, status: this.state[id].status } as Cache;
						break;
					}
					case "STATUS": {
						// notify
						this.modify(id, new DownloaderState({ ...this.state[id], status: args }));

						switch (args as WorkerStatus) {
							case WorkerStatus.ERROR:
							case WorkerStatus.FINISHED: {
								// drop
								delete Downloader.workers[id];
								// resolve
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
						files: script.files.map((file, index) => ({ url: file.url, path: this.pathfinder(settings.state.download.file, settings.state.download.folder, block, index, file.url.split(/\./).last ?? "unknown") })),
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
	protected pathfinder(file: string, folder: string, block: GalleryBlock, index: number, extension: string) {
		// cache
		let path = file + "/" + folder;
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
