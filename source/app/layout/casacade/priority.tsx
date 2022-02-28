// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class PriorityProps extends Casacade {
	public readonly level: number;

	constructor(args: Args<PriorityProps>) {
		super(args);

		this.level = args.level;
	}
}

class Priority extends StyleSheet<PriorityProps> {
	protected postCSS(): React.CSSProperties {
		return {
			zIndex: this.props.level
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Priority;
