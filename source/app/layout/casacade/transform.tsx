import Unit from "@/app/common/unit";
import Transition from "@/app/common/transition";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class TransformProps extends Casacade {
	public readonly scale?: Parameters<typeof scale>;
	public readonly rotate?: Parameters<typeof rotate>;
	public readonly translate?: Parameters<typeof translate>;
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
			transform: [scale(...this.props.scale ?? []), rotate(...this.props.rotate ?? []), translate(...this.props.translate ?? [])].join("\u0020"),
			// automate
			...new Transition({ ...this.props.transition, property: ["transform"] }).toStyle()
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

function scale(x?: number, y?: number) {
	return `scale(${x ?? 1.0},${y ?? 1.0})`;
}

function rotate(angle?: number) {
	return `rotate(${angle ?? 0}deg)`;
}

function translate(x?: Unit, y?: Unit) {
	return `translate(${x ?? 0.0},${y ?? x ?? 0.0})`;
}

export default Transform;
