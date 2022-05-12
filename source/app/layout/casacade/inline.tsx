import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

interface InlineProps extends Casacade {
	readonly flex: boolean;
}
class Inline extends StyleSheet<InlineProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: this.props.flex ? "inline-flex" : "inline-block"
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Inline;
