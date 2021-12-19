// common
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

class DropdownProps extends Props<undefined> {
	constructor(args: Args<DropdownProps>) {
		super(args);
	}
}

class DropdownState {
	constructor(args: Args<DropdownState>) { }
}

class Dropdown extends Stateful<DropdownProps, DropdownState> {
	protected create() {
		throw new Error("Unimplemented.");
	}
	protected postCSS(): React.CSSProperties {
		throw new Error("Unimplemented.");
	}
	protected preCSS(): React.CSSProperties {
		throw new Error("Unimplemented.");
	}
	protected build() {
		throw new Error("Unimplemented.");
	}
}
