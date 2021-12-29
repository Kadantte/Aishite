// common
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
import Stack from "../layout/stack";

class DropdownProps extends Props<undefined> {
	public readonly index: number;
	public readonly items: Array<string>;
	public readonly onClick?: (callback: string) => void;

	constructor(args: Args<DropdownProps>) {
		super(args);

		this.index = args.index;
		this.items = args.items;
	}
}

class DropdownState {
	public index: number;

	constructor(args: Args<DropdownState>) {
		this.index = args.index;
	}
}

class Dropdown extends Stateful<DropdownProps, DropdownState> {
	protected create() {
		return new DropdownState({ index: this.props.index });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Stack>
				
			</Stack>
		);
	}
}

export default Dropdown;
