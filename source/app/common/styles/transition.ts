import unit from "app/common/unit";

interface Transition {
	readonly delay?: number;
	readonly duration?: number;
	readonly property?: Array<keyof React.CSSProperties>;
	readonly function?: React.CSSProperties["transitionTimingFunction"];
}

function transition(style: Args<Transition>): React.CSSProperties {
	if (style.property?.isEmpty) return {};

	return {
		transitionDelay: unit(style.delay ?? 0, "ms"),
		transitionDuration: unit(style.duration ?? 350, "ms"),
		transitionProperty: style.property?.join(comma),
		transitionTimingFunction: style.function ?? "ease-in-out"
	};
}

export default transition;
