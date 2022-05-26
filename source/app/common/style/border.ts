import Unit from "@/app/common/unit";

interface Border {
	readonly width?: Unit;
	readonly style?: React.CSSProperties["borderStyle"];
	readonly color?: React.CSSProperties["borderColor"];
}

function Border(style: { all?: Border, top?: Border, left?: Border, right?: Border, bottom?: Border }): React.CSSProperties {
	// check before
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		border: compiler(style.all ?? {}),
		borderTop: compiler(style.top ?? {}),
		borderLeft: compiler(style.left ?? {}),
		borderRight: compiler(style.right ?? {}),
		borderBottom: compiler(style.bottom ?? {}),
	};
}

function compiler(style: Border) {
	// check-before
	if ((style.width ?? style.style ?? style.color) === undefined) return undefined;

	return [Unit(style.width ?? 0), style.style ?? "hidden", style.color ?? "transparent"].join(space);
}

export default Border;
