import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

import Size from "@/app/common/style/size";

interface StackProps extends Casacade {
	readonly grow?: number;
}

class Stack extends StyleSheet<StackProps> {
	protected postCSS(): React.CSSProperties {
		return {
			position: "absolute"
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
}

export default Stack;
