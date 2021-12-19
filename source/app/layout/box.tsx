// common
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

class BoxProps extends Props<ArrayChild> {
	constructor(args: Args<BoxProps>) {
		super(args);
	}
}

class Box extends Stateless<BoxProps> {
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

export default Box;
