import storage from "@/modules/storage";

import { MappedStateHandler } from "@/handles";

class Bookmark extends MappedStateHandler<number, boolean> {
	public get state() {
		return super.state;
	}
	public set state(state: Bookmark["_state"]) {
		// assign
		super.state = state;
		// update
		storage.change("bookmark", Array.from(super.state.keys()));
	}
	protected create() {
		// TODO: none
	}
	public add(id: number) {
		this.modify(id, true, (unsafe) => {
			// update
			storage.change("bookmark", Array.from(super.state.keys()));
		});
	}
	public remove(id: number) {
		this.modify(id, undefined, (unsafe) => {
			// update
			storage.change("bookmark", Array.from(super.state.keys()));
		});
	}
	public switch(id: number) {
		switch (this.state.has(id)) {
			case true: {
				this.remove(id);
				break;
			}
			case false: {
				this.add(id);
				break;
			}
		}
	}
}

const singleton = new Bookmark(
	(storage.state.get("bookmark")?.state as Array<number>).reduce((array, value) => (array.set(value, true), array), new Map())
);

export default singleton;
