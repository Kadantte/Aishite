import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

interface SpacerProps extends Casacade {
	readonly grow?: number;
}

class Spacer extends StyleSheet<SpacerProps> {
	protected postCSS(): React.CSSProperties {
		return {
			width: undefined,
			height: undefined,
			alignSelf: "stretch",
			// ratio
			flexGrow: this.props.grow ?? 1.0
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Spacer;
