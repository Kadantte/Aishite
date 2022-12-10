import Style from "app/common/styles";
import { Props } from "app/common/props";
import { Stateless } from "app/common/framework";
import { Horizontal, Alignment } from "app/common/geometry";

interface RowProps extends Props.Clear, Props.Style {
	// optional
	readonly wrap?: boolean;
	readonly basis?: unit;
	readonly direction?: Horizontal;
	readonly alignment?: Alignment;
}

class Row extends Stateless<RowProps> {
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
			flexDirection: this.props.direction ?? Horizontal.LEFT_TO_RIGHT,
			justifyContent: this.props.alignment ?? Alignment.FLEX_START
		};
	}
	protected build() {
		return (<section id={this.props.id ?? "row"}>{this.props.children}</section>);
	}
}

export default Row;
