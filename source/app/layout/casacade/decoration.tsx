import Shadow from "@/app/common/shadow";
import Border from "@/app/common/border";
import Corner from "@/app/common/corner";
import Background from "@/app/common/background";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class DecorationProps extends Casacade {
	public readonly shadow?: ConstructorParameters<typeof Shadow>[0];
	public readonly border?: ConstructorParameters<typeof Border>[0];
	public readonly corner?: ConstructorParameters<typeof Corner>[0];
	public readonly background?: ConstructorParameters<typeof Background>[0];

	constructor(args: Args<DecorationProps>) {
		super(args);

		this.shadow = args.shadow;
		this.border = args.border;
		this.corner = args.corner;
		this.background = args.background;
	}
}

class Decoration extends StyleSheet<DecorationProps> {
	protected postCSS(): React.CSSProperties {
		return {
			// automate
			...(this.props.shadow ? new Shadow(this.props.shadow).toStyle() : {}),
			...(this.props.border ? new Border(this.props.border).toStyle() : {}),
			...(this.props.corner ? new Corner(this.props.corner).toStyle() : {}),
			...(this.props.background ? new Background(this.props.background).toStyle() : {})
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Decoration;
