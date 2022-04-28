import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Size from "@/app/common/style/size";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";
import Transition from "@/app/common/style/transition";

class IconProps extends Clear<undefined> {
	public readonly color?: Nullable<React.CSSProperties["fill"]>;
	public readonly width?: Unit
	public readonly height?: Unit;
	public readonly margin?: Margin;
	public readonly padding?: Padding;
	/** Whether to also trigger event from elements underneath. */
	public readonly phantom?: boolean;
	public readonly transition?: Transition;
	// events
	public readonly onMouseUp?: (callback: Icon["style"]) => void;
	public readonly onMouseDown?: (callback: Icon["style"]) => void;
	public readonly onMouseEnter?: (callback: Icon["style"]) => void;
	public readonly onMouseLeave?: (callback: Icon["style"]) => void;
	public readonly onMouseMove?: (callback: Icon["style"]) => void;

	constructor(args: Args<IconProps>) {
		super(args);

		this.color = args.color;
		this.width = args.width;
		this.height = args.height;
		this.margin = args.margin;
		this.padding = args.padding;
		this.phantom = args.phantom;
		this.transition = args.transition;
		// events
		this.onMouseUp = args.onMouseUp;
		this.onMouseDown = args.onMouseDown;
		this.onMouseEnter = args.onMouseEnter;
		this.onMouseLeave = args.onMouseLeave;
		this.onMouseMove = args.onMouseMove;
	}
}

class IconState {
	public color: IconProps["color"];

	constructor(args: Args<IconState>) {
		this.color = args.color;
	}
}

abstract class Icon extends Stateful<IconProps, IconState> {
	protected create() {
		this.style = this.style.bind(this);
		
		return new IconState({ color: null });
	}
	protected postCSS(): React.CSSProperties {
		return {
			fill: this.state.color ?? this.props.color ?? Color.TEXT_000,
			background: "transparent",
			backgroundColor: "transparent"
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Size({ width: this.props.width ?? 12.5, height: this.props.height ?? 12.5 }),
			...Margin(this.props.margin ?? {}),
			...Padding(this.props.padding ?? {}),
			...Transition({ ...this.props.transition, property: ["fill"] })
		};
	}
	protected override() {
		return {
			id: this.props.id,
			// events
			onMouseUp: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseUp?.(this.style);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseDown?.(this.style);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseEnter?.(this.style);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseLeave?.(this.style);
			},
			onMouseMove: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseMove?.(this.style);
			}
		};
	}
	public style(color: IconState["color"], callback?: () => void) {
		this.setState((state) => ({ color: color }), () => callback?.());
	}
}

export default Icon;
