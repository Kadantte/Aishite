import node_fs from "fs";
import node_path from "path";

import { MappedStateHandler } from "@/manager";

import { BridgeEvent } from "@/api";

class StorageState {
	public readonly path: string;
	public state: any;

	constructor(args: Args<StorageState>) {
		this.path = args.path;
		this.state = args.state;
	}
}

class Storage extends MappedStateHandler<string, StorageState> {
	public get state() {
		return super.state;
	}
	/**
	 * Getter and Setter must share the same accessibility.
	 * But since Getter is public, so do the setter must be,
	 * and to prevent bulk define, this method will always throw an error.
	 */
	public set state(state: Storage["_state"]) {
		throw new Error("Bulk define storage may cause unwanted side effects");
	}
	protected create() {
		for (const [key, value] of super.state.entries()) {
			this.modify(key, this.import(value.path, value.state), (unsafe) => this.export(key));
		}
		// every 5 mins
		setInterval(() => {
			for (const [key, value] of super.state.entries()) {
				this.export(key);
			}
		}, 1000 * 60 * 5);
		// before close
		window.bridge.handle(BridgeEvent.CLOSE, () => {
			for (const [key, value] of super.state.entries()) {
				this.export(key);
			}
			window.API.close("storage");
		});
	}
	public change(key: string, value: StorageState["state"]) {
		if (this.state.has(key)) {
			this.modify(key, new StorageState({ path: this.state.get(key)!.path, state: value }));
		} else {
			throw Error();
		}
	}
	public register(key: string, path: StorageState["path"], fallback: StorageState["state"]) {
		if (this.state.has(key)) {
			throw Error();
		} else {
			this.modify(key, this.import(path, fallback), (unsafe) => this.export(key));
		}
	}
	public unregister(key: string) {
		if (this.state.has(key)) {
			this.modify(key, null, () => {
				node_fs.unlinkSync(this.state.get(key)!.path);
			});
		} else {
			throw Error();
		}
	}
	private import(path: StorageState["path"], fallback: StorageState["state"] = {}) {
		try {
			return new StorageState({ path: path, state: JSON.parse(node_fs.readFileSync(path, "utf-8")) });
		} catch {
			return new StorageState({ path: path, state: fallback });
		}
	}
	private export(key: string) {
		if (this.state.has(key)) {
			node_fs.mkdirSync(node_path.dirname(this.state.get(key)!.path), { recursive: true });
			node_fs.writeFileSync(this.state.get(key)!.path, JSON.stringify(this.state.get(key)!.state));
		} else {
			throw Error();
		}
	}
}

const singleton = new Storage({
	state: new Map(Object.entries({
		"config": new StorageState({
			path: node_path.resolve(__dirname, "..", "config.json"),
			state: {}
		}),
		"bookmark": new StorageState({
			path: node_path.resolve(__dirname, "..", "bookmark.json"),
			state: []
		})
	}))
});

export default singleton;
