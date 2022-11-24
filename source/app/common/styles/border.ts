import unit from "@/app/common/unit";

interface Border {
	readonly width?: unit;
	readonly style?: React.CSSProperties["borderStyle"];
	readonly color?: React.CSSProperties["borderColor"];
}

function border(style: { all?: Border, top?: Border, left?: Border, right?: Border, bottom?: Border }): React.CSSProperties {
	// check before
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		// border: compiler(style.all ?? {}),
		borderTop: compiler(style.top ?? style.all ?? {}),
		borderLeft: compiler(style.left ?? style.all ?? {}),
		borderRight: compiler(style.right ?? style.all ?? {}),
		borderBottom: compiler(style.bottom ?? style.all ?? {}),
	};
}

function compiler(style: Border) {
	// check-before
	if ((style.width ?? style.style ?? style.color) === undefined) return undefined;

	return [unit(style.width ?? 0), style.style ?? "hidden", style.color ?? "transparent"].join(space);
}

export default border;
