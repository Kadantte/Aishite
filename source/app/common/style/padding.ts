import Unit from "@/app/common/unit";

interface Padding {
	readonly all?: Unit;
	readonly top?: Unit;
	readonly left?: Unit;
	readonly right?: Unit;
	readonly bottom?: Unit;
}

function Padding(style: Padding): React.CSSProperties {
	// check before
	if (!style.all && !style.top && !style.left && !style.right && !style.bottom) return {};

	return {
		paddingTop: style.top ?? style.all,
		paddingLeft: style.left ?? style.all,
		paddingRight: style.right ?? style.all,
		paddingBottom: style.bottom ?? style.all
	};
}

export default Padding;
