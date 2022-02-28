// common
import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
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
	public readonly size?: {
		minimum?: ConstructorParameters<typeof Size>[0];
		maximum?: ConstructorParameters<typeof Size>[0];
	};
	public readonly style?: React.CSSProperties;
	public readonly width?: Unit
	public readonly height?: Unit;
	public readonly transition?: ConstructorParameters<typeof Transition>[0];
	@required
	public readonly children: Array<TextBuilder>;

	constructor(args: Args<TextProps>) {
		this.id = args.id;
		this.size = args.size;
		this.style = args.style;
		this.width = args.width;
		this.height = args.height;
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
						<section key={index} style={{
							display: "initial",
							color: builder.color,
							fontSize: builder.size,
							fontStyle: builder.style,
							fontFamily: builder.family,
							fontWeight: builder.weight,
							// automate
							...new Transition({ ...this.props.transition, property: ["color"] }).toStyle(),
						}}>{builder.value}</section>
					);
				})}
			</section>
		);
	}
}

export default Text;
