import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

import Transition from "@/app/common/style/transition";

class TransformProps extends Casacade {
	public readonly scale?: Parameters<typeof scale>;
	public readonly rotate?: Parameters<typeof rotate>;
	public readonly translate?: Parameters<typeof translate>;
	public readonly transition?: Transition;

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
			transform: [scale(...this.props.scale ?? []), rotate(...this.props.rotate ?? []), translate(...this.props.translate ?? [])].join(space),
			// automatic
			...Transition({ ...this.props.transition, property: ["transform"] })
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

function scale(x?: number, y?: number) {
	if ((x ?? y) !== undefined) {
		return `scale(${[x ?? 1.0, y ?? 1.0].join(comma)})`;
	}
}

function rotate(angle?: number) {
	if (angle !== undefined) {
		return `rotate(${angle}deg)`;
	}
}

function translate(x?: number, y?: number) {
	if ((x ?? y) !== undefined) {
		return `translate(${[`${x ?? 0.0}%`, `${y ?? x ?? 0.0}%`].join(comma)})`;
	}
}

export default Transform;
