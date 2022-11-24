import { Props } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

interface InlineProps extends Props.Casacade {
	// required
	readonly flex: boolean;
}
class Inline extends StyleSheet<InlineProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			display: this.props.flex ? "inline-flex" : "inline-block"
		};
	}
}

export default Inline;
