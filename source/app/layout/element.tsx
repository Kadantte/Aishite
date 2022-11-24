import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

interface ElementProps extends Props.Clear, Props.Style {
	// TODO: none
}

class Element extends Stateless<ElementProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={this.props.id ?? "element"}>{this.props.children}</section>
		);
	}
}

export default Element;
