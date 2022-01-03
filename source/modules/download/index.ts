/** @see https://stackoverflow.com/questions/38715001/how-to-make-web-workers-with-typescript-and-webpack */
import _ from "file-loader?name=[name].js!./worker";
// states
import { MappedStateHandler } from "@/states";
// api
import { BridgeEvent } from "@/api";

enum WorkerStatus {
	QUEUED = "QUEUED",
	PAUSED = "PAUSED",
	WORKING = "WORKING",
	FINISHED = "FINISHED"
}

class DownloaderState {
	public state: WorkerStatus;
	public bytes_per_second: number;

	constructor(args: Args<DownloaderState>) {
		this.state = args.state;
		this.bytes_per_second = args.bytes_per_second;
	}
}

class Downloader extends MappedStateHandler<Record<number, DownloaderState>> {
	/** DO NOT MODIFY UNLESS CERTAIN. */
	public static readonly workers: Record<number, Worker> = {};

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
		const worker = new Worker(_);

		worker.addEventListener("message", (event) => {

		});
	}
	public pause(id: number) {

	}
	public remove(id: number) {

	}
}

// const worker = new Worker(_);

// worker.addEventListener("message", (event) => {
// 	//
// 	// type: STATUS / BPS
// 	// args: any
// 	//
// 	console.debug(event.data);
// });


// hitomi.la is changing file directory every so often
// thus saving file directory is not realistic

// {
// 	state: Status
// 	files: File Size
// 	folder: Folder Path
// }
// 
// worker.postMessage({
// 	type: "START",
// 	args: {
// 		files: [
// 			{
// 				url: "https://bb.hitomi.la/images/1640926959/2230/56beafe465ba4a6d1f157107846589ef43898e2939713ded6543bcc7ae560b68.jpg",
// 				path: "C:/Users/Sombian/Desktop/aishite.jpg"
// 			}
// 		],
// 		concurrent: 5
// 	}
// });
// 
// export default {};
