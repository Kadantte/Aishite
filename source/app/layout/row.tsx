import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Horizontal, Alignment } from "@/app/common/geometry";

import Size from "@/app/common/style/size";

interface RowProps extends Props<Children> {
	readonly wrap?: boolean;
	readonly basis?: Unit;
	readonly direction?: Horizontal;
	readonly alignment?: Alignment;
}

class Row extends Stateless<RowProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "flex",
			flexWrap: this.props.wrap ? "wrap" : "nowrap",
			flexBasis: this.props.basis,
			flexDirection: this.props.direction ?? Horizontal.LEFT_TO_RIGHT,
			justifyContent: this.props.alignment ?? Alignment.FLEX_START
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Row;
