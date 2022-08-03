import { FlipFlop } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import { Pair } from "@/models/pair";

import Row from "@/app/layout/row";

import { Alignment } from "@/app/common/geometry";

interface PagingProps extends FlipFlop<undefined> {
	readonly index: number;
	readonly length: number;
	readonly overflow: number;
	readonly shortcut?: Pair<boolean, boolean>;
	// builder
	readonly builder: (key: string, index: number, indexing: boolean, handle: (index: number) => void) => Child;
	// events
	readonly onPaging?: (index: number) => boolean;
}

interface PagingState {
	index: number;
}

class Paging extends Stateful<PagingProps, PagingState> {
	protected create() {
		// permanent
		this.jump = this.jump.bind(this);
		this.handle = this.handle.bind(this);

		return ({ index: this.props.index });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected events(): LifeCycle<PagingProps, PagingState> {
		return {
			DID_MOUNT: () => {
				window.addEventListener("keydown", this.handle);
			},
			WILL_UNMOUNT: () => {
				window.removeEventListener("keydown", this.handle);
			}
		};
	}
	protected build() {
		return (
			<Row id={"paging"} alignment={Alignment.CENTER}>
				{this.props.shortcut?.first ? this.props.builder("First", 0, false, this.jump) : undefined}
				<>
					{new Array(this.props.overflow.clamp(0, this.props.length)).fill(null).map((_, index) => {
						// cache
						const _index = this.offset(index);

						return this.props.builder?.((index + 1).toString(), _index, this.state.index === _index, this.jump);
					})}
				</>
				{this.props.shortcut?.first ? this.props.builder("Last", Infinity, false, this.jump) : undefined}
			</Row>
		);
	}
	protected jump(index: number) {
		// clamp & cache
		index = index.clamp(0, this.props.length - 1);

		if (!(this.props.toggle && this.props.length && (this.props.onPaging?.(index) ?? true))) return;

		this.setState((state) => ({ index: index }));
	}
	protected offset(value: number) {
		const a = Math.floor(this.props.overflow / 2); const b = (this.props.length > this.props.overflow); const c = (this.state.index > a && b) ? Math.abs(this.state.index - a) : 0; const d = (this.props.overflow + c);
	
		return value + c + ((d > this.props.length && b) ? (this.props.length - d) : 0);
	}
	protected handle(event: KeyboardEvent) {
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
	}
}

export default Paging;
