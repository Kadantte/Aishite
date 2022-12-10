import { Props } from "app/common/props";
import { StyleSheet } from "app/common/framework";

interface ScrollProps extends Props.Casacade {
	// required
	readonly x: React.CSSProperties["overflowX"];
	readonly y: React.CSSProperties["overflowY"];
	readonly scrollbar?: string;
}

class Scroll extends StyleSheet<ScrollProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			overflowX: this.props.x,
			overflowY: this.props.y
		};
	}
	protected override() {
		return {
			"data-scrollbar": this.props.scrollbar
		};
	}
}

export default Scroll;
