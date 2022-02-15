// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { FlipFlop } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
import { EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Text from "@/app/layout/text";
import Form from "@/app/layout/form";
import Stack from "@/app//layout/stack";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Offset from "@/app/layout/offset";
import Spacer from "@/app/layout/spacer";
import Scroll from "@/app/layout/scroll";
import Container from "@/app/layout/container";
import Decoration from "@/app/layout/decoration";
import { Cell, Grid } from "@/app/layout/grid";
// widgets
import Button from "@/app/widgets/button";

class DropdownProps extends FlipFlop<undefined> {
	public readonly index: number;
	public readonly items: Array<string>;
	public readonly onReset?: (callback: string) => void;
	public readonly onSelect?: (callback: string) => void;
	public readonly onTyping?: (callback: string) => void;

	constructor(args: Args<DropdownProps>) {
		super(args);

		this.index = args.index;
		this.items = args.items;
		this.onReset = args.onReset;
		this.onSelect = args.onSelect;
		this.onTyping = args.onTyping;
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
			<Container id={"dropdown"}>
				<Stack>
					{/* QUERY */}
					<Form toggle={this.props.toggle}></Form>
					{/* MENU */}
					<section>
						{this.props.items.map((item, index) => {
							return (
								<Button key={index}></Button>
							);
						})}
					</section>
				</Stack>
			</Container>
		);
	}
}

export default Dropdown;
