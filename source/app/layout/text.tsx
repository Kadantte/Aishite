// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import Transition from "@/app/common/transition";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

type TextType = "italic" | "normal" | "oblique";
type TextWeight = "bold" | "normal" | "bolder" | "lighter";

class TextProps extends Props<TextChild> {
	public readonly size?: Unit;
	public readonly type?: TextType;
	public readonly color?: string;
	public readonly family?: string;
	public readonly weight?: TextWeight;
	public readonly transition?: ConstructorParameters<typeof Transition>[0];
	/** @required */
	declare public readonly children: TextChild;

	constructor(args: Args<TextProps>) {
		super(args);

		this.size = args.size;
		this.type = args.type;
		this.color = args.color;
		this.family = args.family;
		this.weight = args.weight;
		this.transition = args.transition;
	}
}

class Text extends Stateless<TextProps> {
	protected postCSS(): React.CSSProperties {
		return {
			color: this.props.color ?? Color.TEXT_000,
			fontSize: this.props.size,
			fontStyle: this.props.type,
			fontFamily: this.props.family,
			fontWeight: this.props.weight,
			...new Transition({ ...this.props.transition, property: ["color"] }).toStyle()
		};
	}
	// @ts-ignore
	protected preCSS(): React.CSSProperties {
		return {
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis"
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Text;
