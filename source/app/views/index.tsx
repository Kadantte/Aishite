// common
import { Stateful } from "@/app/common/framework";
// states
import navigator from "@/states/navigator";

abstract class PageView<P, S> extends Stateful<P, S> {
	protected abstract create(): S;
	protected abstract postCSS(): React.CSSProperties;
	protected abstract preCSS(): React.CSSProperties;
	protected abstract build(): JSX.Element;
	/**
	 * Whether the component is visible
	 */
	protected visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.node()?.closest("section[style*=\"display: block\"]") !== null;
	}
}

export default PageView;
