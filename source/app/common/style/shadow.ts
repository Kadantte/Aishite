import Unit from "@/app/common/unit";

interface Shadow {
	readonly inset?: boolean;
	readonly color: React.CSSProperties["color"];
	readonly x: Unit;
	readonly y: Unit;
	readonly blur: Unit;
	readonly spread: Unit;
}

function Shadow(style: Array<Shadow>): React.CSSProperties {
	// check before
	if (style.isEmpty()) return {};

	return {
		boxShadow: style.map((args) => compiler(args)).join(comma)
	};
}

function compiler(style: Shadow) {
	// cache
	const shadow = [Unit(style.x ?? 0), Unit(style.y ?? 0), Unit(style.blur ?? 0), Unit(style.spread ?? 0), style.color];

	return (style.inset ? ["inset", ...shadow] : shadow).join(space);
}

export default Shadow;
