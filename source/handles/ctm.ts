import { StateHandler } from "handles/index";

class ContextMenu extends StateHandler<ContextMenuState> {
	public get state() {
		return super.state;
	}
	public set state(state: ContextMenu["_state"]) {
		super.state = new ContextMenuState(state);
	}
	protected create() {
		// TODO: none
	}
}

class ContextMenuState {
	public readonly id: string;
	public readonly x: number;
	public readonly y: number;
	public readonly items: Array<"seperator" | {
		role: string;
		toggle: boolean;
		method: VoidFunction;
	}>;

	constructor(args: Args<ContextMenuState>) {
		this.id = args.id;
		this.x = args.x;
		this.y = args.y;
		this.items = args.items;
	}
}

const singleton = new ContextMenu(
	new ContextMenuState({ id: "???", x: 0, y: 0, items: new Array() })
);

export default singleton;
