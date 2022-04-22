import { FlipFlop } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";

import Row from "@/app/layout/row";

import Spacer from "@/app/layout/casacade/spacer";

class PagingProps extends FlipFlop<undefined> {
	public readonly index: number;
	public readonly length: number;
	public readonly overflow: number;
	public readonly firstShortcut: boolean;
	public readonly lastShortcut: boolean;
	// events
	public readonly onPaging?: (index: number) => boolean;
	// builder
	public readonly builder?: (key: string, index: number | string, indexing: boolean, jump: Method) => Child;

	constructor(args: Args<PagingProps>) {
		super(args);

		this.index = args.index;
		this.length = args.length;
		this.overflow = args.overflow;
		this.firstShortcut = args.firstShortcut;
		this.lastShortcut = args.lastShortcut;
		this.onPaging = args.onPaging;
		this.builder = args.builder;
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
				if (this.props.toggle && !document.querySelector("input:focus")) {
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
				{(() => {
					if (this.props.firstShortcut) {
						return this.props.builder?.("F", "First", false, () => this.jump(0));
					}
					return
				})()}
				{Array(this.props.overflow.clamp(0, this.props.length)).fill(null).map((_, x) => {
					// cache
					const index = this.offset(x);
					// UWU?
					return this.props.builder?.(x.toString(), index, this.state.index === index, () => this.jump(this.offset(x)));
				}) as never}
				{(() => {
					if (this.props.lastShortcut) {
						return this.props.builder?.("L", "Last", false, () => this.jump(Infinity));
					}
				})()}
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
