import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity */
class ScrollProps extends Casacade {
	/** Range: `0~100`. */
	public readonly value: number;

	constructor(args: Args<ScrollProps>) {
		super(args);

		this.value = args.value;
	}
}

class Scroll extends StyleSheet<ScrollProps> {
	protected postCSS(): React.CSSProperties {
		return {
			opacity: this.props.value / 100
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Scroll;
