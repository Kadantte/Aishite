// common
import Unit from "@/app/common/unit";
import Transition from "@/app/common/transition";
import { Stateless } from "@/app/common/framework";

type TextBuilder = {
	readonly value: string;
} & {
	readonly size?: Unit;
	readonly style?: React.CSSProperties["fontStyle"];
	readonly color?: string;
	readonly family?: string;
	readonly weight?: React.CSSProperties["fontWeight"];
} | "\n";

class TextProps {
	public readonly id?: string;
	public readonly style?: React.CSSProperties;
	public readonly transition?: ConstructorParameters<typeof Transition>[0];
	@required
	public readonly children: Array<TextBuilder>;

	constructor(args: Args<TextProps>) {

		this.id = args.id;
		this.style = args.style;
		this.children = args.children;
		this.transition = args.transition;
	}
}

class Text extends Stateless<TextProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis"
		};
	}
	protected build() {
		return (
			<section id={this.props.id}>
				{this.props.children.map((builder, index) => {
					// linebreak
					if (builder === "\n") {
						return (<br key={index}></br>);
					}
					return (
						<section key={index} style={Object.assign(
							{
								display: "initial"
							},
							new Transition({ ...this.props.transition, property: ["color"] }).toStyle(),
							{
								color: builder.color,
								fontSize: builder.size,
								fontStyle: builder.style,
								fontFamily: builder.family,
								fontWeight: builder.weight
							},
						)}>{builder.value}</section>
					);
				})}
			</section>
		);
	}
}

export default Text;
