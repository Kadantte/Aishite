import { MappedStateHandler } from "handles/index";

import filesystem from "modules/node.js/filesystem";

import { Window } from "models/chromium";

class Storage extends MappedStateHandler<string, StorageState> {
	public get state() {
		return super.state;
	}
	protected set state(state: Storage["_state"]) {
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
		chromium.handle(Window.Event.CLOSE, () => {
			for (const [key, value] of super.state.entries()) {
				this.export(key);
			}
			chromium.close("storage");
		});
	}
	public change(key: string, value: StorageState["state"]) {
		if (!this.state.has(key)) throw new Error();

		this.modify(key, new StorageState({ path: this.state.get(key)!.path, state: value }));
	}
	public register(key: string, path: StorageState["path"], fallback: StorageState["state"]) {
		if (!this.state.has(key)) throw new Error();

		this.modify(key, this.import(path, fallback), (unsafe) => this.export(key));
	}
	public unregister(key: string) {
		if (!this.state.has(key)) throw new Error();

		this.modify(key, undefined, (unsafe) => filesystem.delete(this.state.get(key)!.path));
	}
	protected import(path: StorageState["path"], fallback: StorageState["state"] = {}) {
		try {
			return new StorageState({ path: path, state: JSON.parse(filesystem.read(path)) });
		}
		catch {
			return new StorageState({ path: path, state: fallback });
		}
	}
	protected export(key: string) {
		if (!this.state.has(key)) throw new Error();

		filesystem.write(this.state.get(key)!.path, JSON.stringify(this.state.get(key)!.state));
	}
}

class StorageState {
	public readonly path: string;
	public state: unknown;

	constructor(args: Args<StorageState>) {
		this.path = args.path;
		this.state = args.state;
	}
}

const singleton = new Storage(
	new Map(Object.entries({
		"settings": new StorageState({
			path: filesystem.combine(__dirname, "..", "settings.json"),
			state: {}
		})
	}))
);

export default singleton;
