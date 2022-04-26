import Unit from "@/app/common/unit";
import { Stateless } from "@/app/common/framework";

import Size from "@/app/common/style/size";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";
import Position from "@/app/common/style/position";
import Transition from "@/app/common/style/transition";

interface StringBuffer {
	readonly text: string;
	readonly size?: Unit;
	readonly color?: React.CSSProperties["color"];
	readonly style?: React.CSSProperties["fontStyle"];
	readonly family?: React.CSSProperties["fontFamily"];
	readonly weight?: React.CSSProperties["fontWeight"];
}

class TextProps {
	// inherit
	public readonly id?: string;
	public readonly style?: React.CSSProperties;
	public readonly override?: React.CSSProperties;
	// position
	public readonly all?: Unit;
	public readonly top?: Unit;
	public readonly left?: Unit;
	public readonly right?: Unit;
	public readonly bottom?: Unit;
	public readonly margin?: Margin;
	public readonly padding?: Padding;
	@required
	public readonly children: Array<StringBuffer>;
	// custom
	public readonly length?: Unit;
	public readonly transition?: Transition;

	constructor(args: Args<TextProps>) {
		// inherit
		this.id = args.id;
		this.style = args.style;
		this.override = args.override;
		this.children = args.children;
		// position
		this.all = args.all;
		this.top = args.top;
		this.left = args.left;
		this.right = args.right;
		this.bottom = args.bottom;
		// custom
		this.length = args.length;
		this.transition = args.transition;
	}
}

class Text extends Stateless<TextProps> {
	protected postCSS(): React.CSSProperties {
		return {
			...Size({ type: "maximum", width: Unit(this.props.length ?? "auto", "ch") }),
			...Margin(this.props.margin ?? {}),
			...Padding(this.props.padding ?? {}),
			...Position({ all: this.props.all, top: this.props.top, left: this.props.left, right: this.props.right, bottom: this.props.bottom })
		};
	}
	protected preCSS(): React.CSSProperties {
		print(this.props.children)
		return {
			color: this.props.children.last?.color,
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis"
		};
	}
	protected build() {
		// cache
		const transition = Transition({ ...this.props.transition, property: ["color"] });

		return (
			<section id={this.props.id}>
				{this.props.children.map((builder, index) => {
					// linebreak
					if (builder.text === "\n") return (<br></br>);

					return (
						<section key={index} style={{ display: "initial", color: builder.color, fontSize: builder.size, fontStyle: builder.style, fontFamily: builder.family, fontWeight: builder.weight, ...transition }}>{builder.text}</section>
					);
				})}
			</section>
		);
	}
}

export default Text;
