import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Row from "@/app/layout/row";

import { Alignment } from "@/app/common/geometry";

interface PagingProps extends Props.Clear<undefined>, Props.Style, Props.Toggle {
	// required
	readonly size: number;
	readonly index: number;
	readonly length: number;
	readonly builder: (key: string, index: number, indexing: boolean, handle: typeof Paging.prototype["handle"]) => JSX.Element | undefined;
	// events
	readonly onPaging?: (index: number) => boolean;
}

interface PagingState {
	index: number;
}

class Paging extends Stateful<PagingProps, PagingState> {
	protected create() {
		return {
			index: this.props.index
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				window.addEventListener("keydown", this.onKeyDown);
			},
			WILL_UNMOUNT: () => {
				window.removeEventListener("keydown", this.onKeyDown);
			}
		};
	}
	protected build() {
		return (
			<Row {...this.props} id={this.props.id ?? "paging"} alignment={Alignment.CENTER}>
				<>
					{this.props.builder("First", 0, false, this.handle)}
					{new Array(this.props.size.clamp(0, this.props.length)).fill(null).map((_, index) => {
						// cache
						const page = this.offset(index);

						return this.props.builder?.((index + 1).toString(), page, this.state.index === page, this.handle);
					})}
					{this.props.builder("Last", Infinity, false, this.handle)}
				</>
			</Row>
		);
	}
	protected offset(value: number) {
		const breakpoint = Math.floor(this.props.size / 2);
		const underflow = (this.props.length > this.props.size);
		const viewport = (this.state.index > breakpoint && underflow) ? Math.abs(this.state.index - breakpoint) : 0;
		const overflow = (this.props.size + viewport);

		return value + viewport + ((overflow > this.props.length && underflow) ? (this.props.length - overflow) : 0);
	}
	@autobind()
	protected handle(index: number) {
		// clamp & cache
		index = index.clamp(0, this.props.length - 1);

		if (!(this.props.enable && this.props.length && (this.props.onPaging?.(index) ?? true))) return;

		this.setState((state) => ({ index: index }));
	}
	@autobind()
	protected onKeyDown(event: KeyboardEvent) {
		if (this.props.enable && !document.querySelector("input:focus")) {
			switch (event.key) {
				case "ArrowLeft": {
					this.handle(this.state.index - 1);
					break;
				}
				case "ArrowRight": {
					this.handle(this.state.index + 1);
					break;
				}
			}
		}
	}
}

export default Paging;
