interface Padding {
	readonly all?: unit;
	readonly top?: unit;
	readonly left?: unit;
	readonly right?: unit;
	readonly bottom?: unit;
}

function padding(style: Padding): React.CSSProperties {
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		paddingTop: style.top ?? style.all,
		paddingLeft: style.left ?? style.all,
		paddingRight: style.right ?? style.all,
		paddingBottom: style.bottom ?? style.all
	};
}

export default padding;
