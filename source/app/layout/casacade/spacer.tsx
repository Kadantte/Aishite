import { Props } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

interface SpacerProps extends Props.Casacade {
	// optional
	readonly grow?: number;
}

class Spacer extends StyleSheet<SpacerProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			width: undefined,
			height: undefined,
			flexGrow: this.props.grow ?? 1.0,
			alignSelf: "stretch"
		};
	}
}

export default Spacer;
