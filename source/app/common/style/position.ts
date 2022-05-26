import Unit from "@/app/common/unit";

interface Position {
	readonly all?: Unit;
	readonly top?: Unit;
	readonly left?: Unit;
	readonly right?: Unit;
	readonly bottom?: Unit;
}

function Position(style: Position): React.CSSProperties {
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

export default Position;
