interface Position {
	readonly all?: unit;
	readonly top?: unit;
	readonly left?: unit;
	readonly right?: unit;
	readonly bottom?: unit;
}

function position(style: Position): React.CSSProperties {
	// check before
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		position: "absolute",
		top: style.top ?? style.all,
		left: style.left ?? style.all,
		right: style.right ?? style.all,
		bottom: style.bottom ?? style.all
	};
}

export default position;
