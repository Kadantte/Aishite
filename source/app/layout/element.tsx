import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

class ElementProps extends Props<Children> {
	constructor(args: Args<ElementProps>) {
		super(args);
	}
}

class Element extends Stateless<ElementProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return <section id={this.props.id}>{this.props.children}</section>;
	}
}

export default Element;
