import { Props } from "app/common/props";
import { StyleSheet } from "app/common/framework";

interface CellProps extends Props.Casacade {
	// required
	readonly id: string;
	readonly clipping?: boolean;
}

class Cell extends StyleSheet<CellProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			gridArea: this.props.id,
			overflow: this.props.clipping ? "visible" : undefined
		};
	}
}

export default Cell;
