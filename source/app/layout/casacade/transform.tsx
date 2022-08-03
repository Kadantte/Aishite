import CSS from "@/app/common/style";
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

interface TransformProps extends Casacade {
	readonly scale?: Parameters<typeof scale>;
	readonly rotate?: Parameters<typeof rotate>;
	readonly translate?: Parameters<typeof translate>;
	readonly transition?: CSS["transition"];
}

class Transform extends StyleSheet<TransformProps> {
	protected postCSS(): React.CSSProperties {
		return {
			transform: [scale(...this.props.scale ?? []), rotate(...this.props.rotate ?? []), translate(...this.props.translate ?? [])].join(space),
			// automatic
			...CSS.Transition({ ...this.props.transition, property: ["transform"] })
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

function scale(x?: number, y?: number) {
	if ((x ?? y) === undefined) return undefined;

	return `scale(${[x ?? 1.0, y ?? 1.0].join(comma)})`;
}

function rotate(angle?: number) {
	if (angle === undefined) return undefined;

	return `rotate(${angle}deg)`;
}

function translate(x?: number, y?: number) {
	if ((x ?? y) === undefined) return undefined;
	
	return `translate(${[Unit(x ?? 0.0, "%"), Unit(y ?? x ?? 0.0, "%")].join(comma)})`;
}

export default Transform;
