import Style from "app/common/styles";
import { Props } from "app/common/props";
import { Stateless } from "app/common/framework";

interface CenterProps extends Props.Clear, Props.Style {
	// required
	readonly x: boolean;
	readonly y: boolean;
}

class Center extends Stateless<CenterProps> {
	protected preCSS(): React.CSSProperties {
		return {
			...Style.size({ width: 100.0 + "%", height: 100.0 + "%" })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {
			display: "flex",
			alignItems: this.props.y ? "center" : undefined,
			justifyContent: this.props.x ? "center" : undefined
		};
	}
	protected build() {
		return (<section id={this.props.id ?? "center"}>{this.props.children}</section>);
	}
}

export default Center;
