import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class InlineProps extends Casacade {
	public readonly flex: boolean;

	constructor(args: Args<InlineProps>) {
		super(args);

		this.flex = args.flex;
	}
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
