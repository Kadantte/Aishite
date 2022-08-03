import CSS from "@/app/common/style";
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Vertical, Alignment } from "@/app/common/geometry";

interface ColumnProps extends Props<Children> {
	readonly wrap?: boolean;
	readonly basis?: Unit;
	readonly direction?: Vertical;
	readonly alignment?: Alignment;
}

class Column extends Stateless<ColumnProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "flex",
			flexWrap: this.props.wrap ? "wrap" : "nowrap",
			flexBasis: this.props.basis,
			flexDirection: this.props.direction ?? Vertical.TOP_TO_BOTTOM,
			justifyContent: this.props.alignment ?? Alignment.FLEX_START
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...CSS.Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Column;
