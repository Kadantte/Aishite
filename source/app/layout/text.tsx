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

interface TextProps {
	// inherit
	readonly id?: string;
	readonly style?: React.CSSProperties;
	readonly override?: React.CSSProperties;
	// position
	readonly all?: Unit;
	readonly top?: Unit;
	readonly left?: Unit;
	readonly right?: Unit;
	readonly bottom?: Unit;
	readonly margin?: Margin;
	readonly padding?: Padding;
	// custom
	readonly length?: Unit;
	readonly transition?: Transition;
	// override
	readonly children: Array<StringBuffer>;
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
		return {
			color: this.props.children.last?.color,
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			pointerEvents: "none"
		};
	}
	protected build() {
		// cache
		const transition = Transition({ ...this.props.transition, property: ["color"] });

		return (
			<section id={this.props.id}>
				{this.props.children.map((builder, index) => {
					// linebreak
					if (builder.text === "\n") return (<br key={index}/>);

					return (
						<section key={index} style={{ display: "initial", color: builder.color, fontSize: builder.size, fontStyle: builder.style, fontFamily: builder.family, fontWeight: builder.weight, ...transition }}>{builder.text}</section>
					);
				})}
			</section>
		);
	}
}

export default Text;
