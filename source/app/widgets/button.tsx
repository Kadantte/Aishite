import { Stateless } from "@/app/common/framework";

import Center from "@/app/layout/center";
import Container from "@/app/layout/container";

class Button extends Stateless<Container["props"]> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Container {...this.props}>
				<Center x={true} y={true} children={this.props.children}/>
			</Container>
		);
	}
}

export default Button;
