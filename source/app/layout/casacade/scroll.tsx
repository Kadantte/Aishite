import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type Type = ("frame" | "elegant");

class ScrollProps extends Casacade {
	public readonly x: React.CSSProperties["overflowX"];
	public readonly y: React.CSSProperties["overflowY"];
	public readonly scrollbar?: Type;

	constructor(args: Args<ScrollProps>) {
		super(args);

		this.x = args.x;
		this.y = args.y;
		this.scrollbar = args.scrollbar;
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
	protected override() {
		return {
			"data-scrollable": this.props.scrollbar
		};
	}
}

export default Scroll;
