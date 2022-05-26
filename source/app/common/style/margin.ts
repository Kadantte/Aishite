import Unit from "@/app/common/unit";

interface Margin {
	readonly all?: Unit;
	readonly top?: Unit;
	readonly left?: Unit;
	readonly right?: Unit;
	readonly bottom?: Unit;
}

function Margin(style: Margin): React.CSSProperties {
	// check before
	if ((style.all ?? style.top ?? style.left ?? style.right ?? style.bottom) === undefined) return {};

	return {
		marginTop: style.top ?? style.all,
		marginLeft: style.left ?? style.all,
		marginRight: style.right ?? style.all,
		marginBottom: style.bottom ?? style.all
	};
}

export default Margin;
