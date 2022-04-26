import template from "@/assets/config.json";

import storage from "@/modules/storage";

import { StateHandler } from "@/manager";

class Settings extends StateHandler<Config> {
	public get state() {
		return super.state;
	}
	public set state(state: Args<Config>) {
		super.state = new Config({ ...state });
		// update
		storage.change("config", super.state);
	}
	protected create() {
		// update
		storage.change("config", super.state);
	}
}

class Config {
	public readonly version: typeof template["version"];
	public readonly general: typeof template["general"];
	public readonly download: typeof template["download"];
	public readonly navigator: {
		index: number;
		pages: Array<{
			type: string;
			name: string;
			args: unknown;
		}>;
	};

	constructor(args: Args<Config>) {
		this.version = args.version;
		this.general = args.general;
		this.download = args.download;
		this.navigator = args.navigator;
	}
}

const singleton = new Settings({
	state: new Config({
		version: (storage.state.get("config")?.state as typeof template).version ?? template.version,
		general: (storage.state.get("config")?.state as typeof template).general ?? template.general,
		download: (storage.state.get("config")?.state as typeof template).download ?? template.download,
		navigator: (storage.state.get("config")?.state as typeof template).navigator ?? template.navigator
	})
});

export default singleton;
