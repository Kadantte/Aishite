import unit from "app/common/unit";

interface Shadow {
	readonly inset?: boolean;
	readonly color: React.CSSProperties["color"];
	readonly x: unit;
	readonly y: unit;
	readonly blur: unit;
	readonly spread: unit;
}

function shadow(style: Array<Shadow>): React.CSSProperties {
	if (style.isEmpty) return {};

	return {
		boxShadow: style.map((args) => compiler(args)).join(comma)
	};
}

function compiler(style: Shadow) {
	const shadow = [unit(style.x ?? 0), unit(style.y ?? 0), unit(style.blur ?? 0), unit(style.spread ?? 0), style.color];

	return (style.inset ? ["inset", ...shadow] : shadow).join(space);
}

export default shadow;
