import Style from "app/common/styles";
import { Props } from "app/common/props";
import { StyleSheet } from "app/common/framework";

interface TransformProps extends Props.Casacade {
	// optional
	readonly scale?: Parameters<typeof scale>;
	readonly rotate?: Parameters<typeof rotate>;
	readonly translate?: Parameters<typeof translate>;
	readonly transition?: Style["transition"];
}

class Transform extends StyleSheet<TransformProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			// manually
			transform: [scale(...this.props.scale ?? new Array()), rotate(...this.props.rotate ?? new Array()), translate(...this.props.translate ?? new Array())].join(space),
			// automatic
			...Style.transition({ ...this.props.transition, property: ["transform"] })
		};
	}
}

function scale(x?: number, y?: number) {
	if ((x ?? y) === undefined) return undefined;

	return "scale(" + [x ?? 1.0, y ?? 1.0].join(comma) + ")";
}

function rotate(angle?: number) {
	if (angle === undefined) return undefined;

	return "rotate(" + angle + "deg)";
}

function translate(x?: number, y?: number) {
	if ((x ?? y) === undefined) return undefined;

	return "translate(" + [(x ?? 0.0) + "%", (y ?? x ?? 0.0) + "%"].join(comma) + ")";
}

export default Transform;
