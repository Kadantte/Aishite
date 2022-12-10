import unit from "app/common/unit";
import { Props } from "app/common/props";
import { Stateless } from "app/common/framework";

interface RegionProps extends Props.Clear, Props.Style {
	// required
	readonly rows: Array<unit>;
	readonly columns: Array<unit>;
	readonly template: Array<Array<String>>;
	// optional
	readonly gap?: unit;
}

class Region extends Stateless<RegionProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			display: "grid",
			gap: this.props.gap,
			gridTemplateRows: this.props.rows.map((value) => unit(value)).join(space),
			gridTemplateAreas: this.props.template.map((sphere) => "\"" + sphere.join(space) + "\"").join(space),
			gridTemplateColumns: this.props.columns.map((value) => unit(value)).join(space)

		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Region;
