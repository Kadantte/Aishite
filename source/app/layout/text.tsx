import Style from "app/common/styles";
import unit from "app/common/unit";
import { Props } from "app/common/props";
import { CSSPlus } from "app/common/props";
import { Stateless } from "app/common/framework";

interface StringBuffer {
	// required
	readonly value: string;
	// optional
	readonly size?: unit;
	readonly color?: React.CSSProperties["color"];
	readonly style?: React.CSSProperties["fontStyle"];
	readonly family?: React.CSSProperties["fontFamily"];
	readonly weight?: React.CSSProperties["fontWeight"];
}

interface TextProps extends Props.Clear<Array<StringBuffer>>, Omit<Props.Style, CSSPlus.DECORATION> {
	// optional
	readonly length?: unit;
	readonly transition?: Style["transition"];
}

class Text extends Stateless<TextProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			// manually
			color: this.props.children?.last?.color,
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis",
			pointerEvents: "none",
			// automatic
			...Style.size({ type: true, width: unit(this.props.length ?? "auto", "ch") }),
		};
	}
	protected build() {
		// cache
		const transition = Style.transition({ ...this.props.transition, property: ["color"] });
		
		return (
			<section id={this.props.id ?? "text"}>
				{this.props.children?.map((builder, index) => {
					switch (builder.value) {
						case "\n": {
							return (<br key={index}/>);
						}
						default: {
							return (<section key={index} style={{ ...transition, display: "initial", color: builder.color, fontSize: builder.size, fontStyle: builder.style, fontFamily: builder.family, fontWeight: builder.weight }}>{builder.value}</section>);
						}
					}
				})}
			</section>
		);
	}
}

export default Text;
