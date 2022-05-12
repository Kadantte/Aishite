import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type Type = ("frame" | "elegant");

interface ScrollProps extends Casacade {
	readonly x: React.CSSProperties["overflowX"];
	readonly y: React.CSSProperties["overflowY"];
	readonly scrollbar?: Type;
}

class Scroll extends StyleSheet<ScrollProps> {
	protected postCSS(): React.CSSProperties {
		return {
			overflowX: this.props.x,
			overflowY: this.props.y
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected override() {
		return {
			"data-scrollable": this.props.scrollbar
		};
	}
}

export default Scroll;
