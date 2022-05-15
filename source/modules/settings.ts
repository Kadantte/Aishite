import { StateHandler } from "@/handles";

import storage from "@/modules/storage";

import template from "@/assets/settings.json";

class Settings extends StateHandler<Configuration> {
	public get state() {
		return super.state;
	}
	public set state(state: Args<Configuration>) {
		super.state = new Configuration({ ...state });
		// update
		storage.change("settings", super.state);
	}
	protected create() {
		// important
		chromium.requires(this.state.app.requires);
	}
}

class Configuration {
	public readonly app: typeof template["app"];
	public readonly history: {
		index: number;
		pages: Array<{
			type: string;
			name: string;
			args: Record<string, any>;
		}>;
	};
	public readonly override: {
		fallback: Record<string, any>;
		browser: Record<string, any>;
		viewer: Record<string, any>;
	};

	constructor(args: Args<Configuration>) {
		this.app = args.app;
		this.history = args.history;
		this.override = args.override;
	}
}

const singleton = new Settings(
	new Configuration({
		app: (storage.state.get("settings")?.state as typeof template).app ?? template.app,
		history: (storage.state.get("settings")?.state as typeof template).history ?? template.history,
		override: (storage.state.get("settings")?.state as typeof template).override ?? template.override
	})
);

export default singleton;
