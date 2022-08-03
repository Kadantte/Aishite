import CSS from "@/app/common/style";
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

interface CenterProps extends Props<Children> {
	readonly x: boolean;
	readonly y: boolean;
}

class Center extends Stateless<CenterProps> {
	protected postCSS(): React.CSSProperties {
		return {
			display: "flex",
			alignItems: this.props.y ? "center" : undefined,
			justifyContent: this.props.x ? "center" : undefined
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...CSS.Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Center;
