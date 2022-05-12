import Unit from "@/app/common/unit";
import { Clear, Casacade } from "@/app/common/props";
import { Stateless, StyleSheet } from "@/app/common/framework";

interface CellProps extends Casacade {
	readonly id: string;
	readonly overflow?: boolean;
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

interface LayoutProps extends Clear<Children> {
	readonly gap?: {
		inner?: Unit;
		outer?: Unit;
	};
	readonly flow?: React.CSSProperties["gridAutoFlow"];
	readonly count: number;
	readonly minimum: Unit;
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

interface RegionProps extends Clear<Children> {
	readonly gap?: {
		inner?: Unit;
		outer?: Unit;
	};
	readonly rows: Array<Unit>;
	readonly columns: Array<Unit>;
	readonly template: Array<Array<String>>;
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
