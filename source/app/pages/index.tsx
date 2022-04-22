import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import navigator from "@/manager/navigator";

abstract class Page<P extends Props<any>, S> extends Stateful<P, S> {
	protected abstract create(): S;
	protected abstract postCSS(): React.CSSProperties;
	protected abstract preCSS(): React.CSSProperties;
	protected abstract build(): JSX.Element;
	/**
	 * Return `this.node()` wrapper.
	 */
	protected wrapper() {
		return this.node()?.closest("section[style*=\"display: block\"]");
	}
	/**
	 * Whether the component is visible
	 */
	protected visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.wrapper() !== null;
	}
}

export default Page;
