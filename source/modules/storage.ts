import { MappedStateHandler } from "@/handles";

import filesystem from "@/modules/node.js/filesystem";

import { Window } from "@/models/window";

class StorageState {
	public readonly path: string;
	public state: unknown;

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
			this.import(value.path, value.state).then((content) => {
				this.modify(key, content, (unsafe) => {
					this.export(key);
				});
			})
		}
		// every 5 mins
		setInterval(() => {
			for (const [key, value] of super.state.entries()) {
				this.export(key);
			}
		}, 1000 * 60 * 5);
		// before close
		chromium.handle(Window.CLOSE, () => {
			for (const [key, value] of super.state.entries()) {
				this.export(key);
			}
			chromium.close("storage");
		});
	}
	public change(key: string, value: StorageState["state"]) {
		if (!this.state.has(key)) throw Error();

		this.modify(key, new StorageState({ path: this.state.get(key)!.path, state: value }));
	}
	public async register(key: string, path: StorageState["path"], fallback: StorageState["state"]) {
		if (!this.state.has(key)) throw Error();

		const content = await this.import(path, fallback);

		this.modify(key, content);

		await this.export(key);
	}
	public async unregister(key: string) {
		if (!this.state.has(key)) throw Error();

		this.modify(key, null);

		await filesystem.delete(this.state.get(key)!.path);
	}
	protected async import(path: StorageState["path"], fallback: StorageState["state"] = {}) {
		try {
			return new StorageState({ path: path, state: JSON.parse(await filesystem.read(path)) });
		} catch {
			return new StorageState({ path: path, state: fallback });
		}
	}
	protected async export(key: string) {
		if (!this.state.has(key)) throw Error();

		filesystem.write(this.state.get(key)!.path, JSON.stringify(this.state.get(key)!.state));
	}
}

const singleton = new Storage(
	new Map(Object.entries({
		"settings": new StorageState({
			path: filesystem.combine(__dirname, "..", "settings.json"),
			state: {}
		}),
		"bookmark": new StorageState({
			path: filesystem.combine(__dirname, "..", "bookmark.json"),
			state: []
		})
	}))
);

export default singleton;
