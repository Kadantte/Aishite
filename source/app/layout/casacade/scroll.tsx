import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow */
class ScrollProps extends Casacade {
	public readonly x: React.CSSProperties["overflowX"];
	public readonly y: React.CSSProperties["overflowY"];

	constructor(args: Args<ScrollProps>) {
		super(args);

		this.x = args.x;
		this.y = args.y;
	}
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
}

export default Scroll;
