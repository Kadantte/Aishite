// common
import Unit from "@/app/common/unit";
import Transition from "@/app/common/transition";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class TransformProps extends Casacade {
	public readonly scale?: [x: number, y?: number];
	public readonly rotate?: number;
	public readonly translate?: [x: Unit, y?: Unit];
	public readonly transition?: ConstructorParameters<typeof Transition>[0];

	constructor(args: Args<TransformProps>) {
		super(args);

		this.scale = args.scale;
		this.rotate = args.rotate;
		this.translate = args.translate;
		this.transition = args.transition;
	}
}

class Transform extends StyleSheet<TransformProps> {
	protected postCSS(): React.CSSProperties {
		return {
			transform: ["scale(" + (this.props.scale?.[0] ?? 1.0) + "," + (this.props.scale?.[1] ?? this.props.scale?.[0] ?? 1.0) + ")", "rotate(" + (this.props.rotate ?? 0) + "deg)", "translate(" + (this.props.translate?.[0] ?? 0.0) + "," + (this.props.translate?.[1] ?? this.props.translate?.[0] ?? 0.0) + ")"].join("\u0020"),
			// automate
			...new Transition({ ...this.props.transition, property: ["transform"] }).toStyle()
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Transform;
