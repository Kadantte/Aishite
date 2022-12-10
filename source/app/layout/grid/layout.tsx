import unit from "app/common/unit";
import { Props } from "app/common/props";
import { Stateless } from "app/common/framework";

interface LayoutProps extends Props.Clear, Props.Style {
	// required
	readonly width: unit;
	readonly count: number;
	// optional
	readonly gap?: unit;
}

/** @see https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
class Layout extends Stateless<LayoutProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			display: "grid",
			gap: this.props.gap,
			gridTemplateColumns: ["repeat(auto-fit", "minmax(max(" + unit(this.props.width), "(100% - (" + unit(this.props.gap ?? 0) + "*" + (this.props.count - 1) + "))/" + this.props.count + ")", "1fr))"].join(comma)
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Layout;
