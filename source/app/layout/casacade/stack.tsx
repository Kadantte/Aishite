import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class StackProps extends Casacade {
	public readonly grow?: number;

	constructor(args: Args<StackProps>) {
		super(args);

		this.grow = args.grow;
	}
}

class Stack extends StyleSheet<StackProps> {
	protected postCSS(): React.CSSProperties {
		return {
			position: "absolute"
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...new Size({ width: Unit(100, "%"), height: Unit(100, "%") }).toStyle()
		};
	}
}

export default Stack;
