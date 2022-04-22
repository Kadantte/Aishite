import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Horizontal, Alignment } from "@/app/common/flex";

class RowProps extends Props<Children> {
	public readonly wrap?: boolean;
	public readonly basis?: Unit;
	public readonly direction?: Horizontal;
	public readonly alignment?: Alignment;

	constructor(args: Args<RowProps>) {
		super(args);

		this.wrap = args.wrap;
		this.basis = args.basis;
		this.direction = args.direction;
		this.alignment = args.alignment;
	}
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
			...new Size({ width: Unit(100, "%"), height: Unit(100, "%") }).toStyle()
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Row;
