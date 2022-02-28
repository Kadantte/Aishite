// common
import { Stateless } from "@/app/common/framework";
// layout
import Center from "@/app/layout/center";
import Container from "@/app/layout/container";

/** Shorthand combination of `Container` and `Center`. */
class Button extends Stateless<Container["props"] & { children?: Child }> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Container id={"button"} {...this.props}>
				<Center x={true} y={true} children={this.props.children}/>
			</Container>
		);
	}
}

export default Button;
