import Style from "app/common/styles";
import { Props } from "app/common/props";
import { StyleSheet } from "app/common/framework";

interface StackProps extends Props.Casacade {
	// optional
	readonly grow?: number;
}

class Stack extends StyleSheet<StackProps> {
	protected preCSS(): React.CSSProperties {
		return {
			...Style.size({ width: 100.0 + "%", height: 100.0 + "%" })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {
			position: "absolute"
		};
	}
}

export default Stack;
