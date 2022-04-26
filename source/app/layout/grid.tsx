import Unit from "@/app/common/unit";
import { Clear, Casacade } from "@/app/common/props";
import { Stateless, StyleSheet } from "@/app/common/framework";

class CellProps extends Casacade {
	public readonly overflow?: boolean;
	// override
	declare public readonly id: string;

	constructor(args: Args<CellProps>) {
		super(args);

		this.overflow = args.overflow;
	}
}

class Cell extends StyleSheet<CellProps> {
	protected postCSS(): React.CSSProperties {
		return {
			gridArea: this.props.id,
			overflow: this.props.overflow ? "visible" : undefined
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

class LayoutProps extends Clear<Children> {
	public readonly gap?: {
		inner?: Unit;
		outer?: Unit;
	};
	public readonly flow?: React.CSSProperties["gridAutoFlow"];
	public readonly count: number;
	public readonly minimum: Unit;

	constructor(args: Args<LayoutProps>) {
		super(args);

		this.gap = args.gap;
		this.flow = args.flow;
		this.count = args.count;
		this.minimum = args.minimum;
	}
}
/** @see https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
class Layout extends Stateless<LayoutProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "grid",
			gap: this.props.gap?.inner,
			margin: this.props.gap?.outer,
			gridAutoFlow: this.props?.flow,
			gridTemplateColumns: ["repeat(auto-fit", `minmax(max(${Unit(this.props.minimum)}`, `(100% - (${Unit(this.props.gap?.inner ?? 0)} * ${this.props.count - 1})) / ${this.props.count})`, "1fr))"].join(comma)
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

class RegionProps extends Clear<Children> {
	public readonly gap?: {
		inner?: Unit;
		outer?: Unit;
	};
	public readonly rows: Array<Unit>;
	public readonly columns: Array<Unit>;
	public readonly template: Array<Array<String>>;

	constructor(args: Args<RegionProps>) {
		super(args);

		this.gap = args.gap;
		this.rows = args.rows;
		this.columns = args.columns;
		this.template = args.template;
	}
}

class Region extends Stateless<RegionProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "grid",
			gap: this.props.gap?.inner,
			margin: this.props.gap?.outer,
			gridTemplateRows: this.props.rows.map((value) => Unit(value)).join(space),
			gridTemplateColumns: this.props.columns.map((value) => Unit(value)).join(space),
			gridTemplateAreas: this.props.template.map((sphere) => "\"" + sphere.join(space) + "\"").join(space)

		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

const Grid = {
	Cell: Cell,
	Layout: Layout,
	Region: Region
};

export default Grid;
