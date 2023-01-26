interface Margin {
	readonly all?: unit;
	readonly top?: unit;
	readonly left?: unit;
	readonly right?: unit;
	readonly bottom?: unit;
}

function margin(style: Margin): React.CSSProperties {
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		marginTop: style.top ?? style.all,
		marginLeft: style.left ?? style.all,
		marginRight: style.right ?? style.all,
		marginBottom: style.bottom ?? style.all
	};
}

export default margin;
