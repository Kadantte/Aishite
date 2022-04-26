import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Vertical, Alignment } from "@/app/common/geometry";

import Size from "@/app/common/style/size";

class ColumnProps extends Props<Children> {
	public readonly wrap?: boolean;
	public readonly basis?: Unit;
	public readonly direction?: Vertical;
	public readonly alignment?: Alignment;

	constructor(args: Args<ColumnProps>) {
		super(args);

		this.wrap = args.wrap;
		this.basis = args.basis;
		this.direction = args.direction;
		this.alignment = args.alignment;
	}
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
			...Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Column;
