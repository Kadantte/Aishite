import { StateHandler } from "handles/index";

class ContextMenu extends StateHandler<ContextMenuState> {
	public get state() {
		return super.state;
	}
	protected set state(state: ContextMenu["_state"]) {
		// assign
		super.state = new ContextMenuState(state);
	}
	protected create() {
		// TODO: none
	}
	public render(id: ContextMenu["_state"]["id"], x: ContextMenu["_state"]["x"], y: ContextMenu["_state"]["y"], items: ContextMenu["_state"]["items"]) {
		this.state = { id: id, x: x, y: y, items: items };
	}
	public refresh() {
		this.state = { ...this.state };
	}
}

class ContextMenuState {
	public readonly id: string;
	public readonly x: number;
	public readonly y: number;
	public readonly items: Array<"seperator" | { role: string; toggle: boolean; method: VoidFunction; }>;

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
