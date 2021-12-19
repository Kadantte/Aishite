// common
import { FlipFlop } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Spacer from "@/app/layout/spacer";

class PagingProps extends FlipFlop<undefined> {
	public readonly index: number;
	public readonly length: number;
	public readonly overflow: number;
	public readonly shortcut: { first: boolean; last: boolean };
	public readonly onPaging?: (index: number) => boolean;
	public readonly onButton?: (key: string, index: "First" | "Last" | number, indexing: boolean, jump: () => void) => SingleChild;

	constructor(args: Args<PagingProps>) {
		super(args);

		this.index = args.index;
		this.length = args.length;
		this.overflow = args.overflow;
		this.shortcut = args.shortcut;
		this.onPaging = args.onPaging;
		this.onButton = args.onButton;
	}
}

class PagingState {
	public index: number;

	constructor(args: Args<PagingState>) {
		this.index = args.index;
	}
}

class Paging extends Stateful<PagingProps, PagingState> {
	protected create() {
		return new PagingState({ index: this.props.index });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected events() {
		return [
			new EventManager(window, "keydown", (event: React.KeyboardEvent) => {
				if (this.props.toggle) {
					switch (event.key) {
						case "ArrowLeft": {
							this.jump(this.state.index - 1);
							break;
						}
						case "ArrowRight": {
							this.jump(this.state.index + 1);
							break;
						}
					}
				}
			})
		];
	}
	protected build() {
		return (
			<Row id={"paging"}>
				<Spacer><section></section></Spacer>
				{this.props.shortcut.first ? this.props.onButton?.("F", "First", false, () => this.jump(0)) : undefined}
				{new Array(this.props.overflow.clamp(0, this.props.length)).fill(null).map((_, x) => {
					// cache
					const index = this.offset(x);
					// UWU?
					return (this.props.onButton?.(x.toString(), index, index === this.state.index, () => this.jump(this.offset(x))) ?? <section>{index}</section>);
				}) as never}
				{this.props.shortcut.last ? this.props.onButton?.("L", "Last", false, () => this.jump(Infinity)) : undefined}
				<Spacer><section></section></Spacer>
			</Row>
		);
	}
	public jump(index: number) {
		// clamp & cache
		index = index.clamp(0, this.props.length - 1);

		if (this.props.toggle && this.props.length && (this.props.onPaging?.(index) ?? true)) {
			this.setState({ ...this.state, index: index });
		}
	}
	public offset(value: number) {
		const a = (this.props.overflow / 2).truncate(); const b = (this.props.length > this.props.overflow); const c = (this.state.index > a && b) ? (this.state.index - a).absolute() : 0; const d = (this.props.overflow + c);

		return value + c + ((d > this.props.length && b) ? (this.props.length - d) : 0);
	}
}

export default Paging;
