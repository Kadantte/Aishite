// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class SpacerProps extends Casacade {
	public readonly grow?: number;

	constructor(args: Args<SpacerProps>) {
		super(args);

		this.grow = args.grow;
	}
}

class Spacer extends StyleSheet<SpacerProps> {
	protected postCSS(): React.CSSProperties {
		return {
			width: undefined,
			height: undefined,
			flexGrow: this.props.grow ?? 1.0,
			alignSelf: "stretch"
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Spacer;
