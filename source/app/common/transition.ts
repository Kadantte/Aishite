import Unit from "@/app/common/unit";
import Style from "@/app/common/style";

class Transition extends Style {
	public readonly delay?: number;
	public readonly duration?: number;
	public readonly property?: Array<string>;
	public readonly function?: React.CSSProperties["transitionTimingFunction"];

	constructor(args: Args<Transition>) {
		super();

		this.delay = args.delay;
		this.duration = args.duration;
		this.property = args.property;
		this.function = args.function;
	}
	protected compile() {
		return {
			transitionDelay: Unit(this.delay ?? 0, "ms"),
			transitionDuration: Unit(this.duration ?? 350, "ms"),
			transitionProperty: this.property?.join(","),
			transitionTimingFunction: this.function ?? "ease-in-out"
		};
	}
}

export default Transition;
