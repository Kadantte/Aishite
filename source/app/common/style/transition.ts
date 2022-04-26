import Unit from "@/app/common/unit";

interface Transition {
	readonly delay?: number;
	readonly duration?: number;
	readonly property?: Array<keyof React.CSSProperties>;
	readonly function?: React.CSSProperties["transitionTimingFunction"];
}

function Transition(style: Args<Transition>): React.CSSProperties {
	// check before
	if (style.property?.isEmpty()) return {};

	return {
		transitionDelay: Unit(style.delay ?? 0, "ms"),
		transitionDuration: Unit(style.duration ?? 350, "ms"),
		transitionProperty: style.property?.join(comma),
		transitionTimingFunction: style.function ?? "ease-in-out"
	};
}

export default Transition;
