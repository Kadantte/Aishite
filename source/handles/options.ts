import { StateHandler } from "handles/index";

import storage from "modules/storage";

import template from "assets/settings.json";

class Options extends StateHandler<OptionsState> {
	public get state() {
		return super.state;
	}
	protected set state(state: Args<OptionsState>) {
		// assign
		super.state = new OptionsState(state);
		// update
		storage.change("settings", super.state);
	}
	protected create() {
		// important
		chromium.requires(this.state.app.requires);
	}
	public modify(key: "app", value: Options["_state"]["app"]): void;
	public modify(key: "apis", value: Options["_state"]["apis"]): void;
	public modify(key: "history", value: Options["_state"]["history"]): void;

	public modify(key: keyof Options["_state"], value: Options["_state"][keyof Options["_state"]]) {
		this.state = { ...this.state, [key]: value };
	}
}

class OptionsState {
	public readonly app: {
		request: {
			engine: string;	
		};
		requires: Array<string>;
	};
	public readonly apis: {
		search: {
			shortcut: {
				[key: string]: string;
			};
		};
	};
	public readonly history: {
		index: number;
		pages: Array<{
			type: string;
			name: string;
			args: Record<string, unknown>;
		}>;
	};
	public readonly override: {
		fallback: Record<string, unknown>;
		browser: Record<string, unknown>;
		viewer: Record<string, unknown>;
	};

	constructor(args: Args<OptionsState>) {
		this.app = args.app;
		this.apis = args.apis;
		this.history = args.history;
		this.override = args.override;
	}
}

const singleton = new Options(
	new OptionsState({
		app: (storage.state.get("settings")?.state as typeof template).app ?? template.app,
		apis: (storage.state.get("settings")?.state as typeof template).apis ?? template.apis,
		history: (storage.state.get("settings")?.state as typeof template).history ?? template.history,
		override: (storage.state.get("settings")?.state as typeof template).override ?? template.override
	})
);

export default singleton;
