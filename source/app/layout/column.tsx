import Style from "@/app/common/styles";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Vertical, Alignment } from "@/app/common/geometry";

interface ColumnProps extends Props.Clear, Props.Style {
	// optional
	readonly wrap?: boolean;
	readonly basis?: unit;
	readonly direction?: Vertical;
	readonly alignment?: Alignment;
}

class Column extends Stateless<ColumnProps> {
	protected preCSS(): React.CSSProperties {
		return {
			...Style.size({ width: 100.0 + "%", height: 100.0 + "%" })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {
			display: "flex",
			flexWrap: this.props.wrap ? "wrap" : "nowrap",
			flexBasis: this.props.basis,
			flexDirection: this.props.direction ?? Vertical.TOP_TO_BOTTOM,
			justifyContent: this.props.alignment ?? Alignment.FLEX_START
		};
	}
	protected build() {
		return (<section id={this.props.id ?? "column"}>{this.props.children}</section>);
	}
}

export default Column;
