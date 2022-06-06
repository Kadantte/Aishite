import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Size from "@/app/common/style/size";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";
import Transition from "@/app/common/style/transition";

interface IconProps extends Clear<undefined> {
	readonly color?: Nullable<React.CSSProperties["fill"]>;
	readonly width?: Unit
	readonly height?: Unit;
	readonly margin?: Margin;
	readonly padding?: Padding;
	/** Whether to prevent event triggers from elements underneath. */
	readonly priority?: boolean;
	readonly transition?: Transition;
	// events
	readonly onMouseUp?: (callback: Icon["style"]) => void;
	readonly onMouseDown?: (callback: Icon["style"]) => void;
	readonly onMouseEnter?: (callback: Icon["style"]) => void;
	readonly onMouseLeave?: (callback: Icon["style"]) => void;
	readonly onMouseMove?: (callback: Icon["style"]) => void;
}

interface IconState {
	color: IconProps["color"];
}

abstract class Icon extends Stateful<IconProps, IconState> {
	protected create() {
		this.style = this.style.bind(this);
		
		return ({ color: null });
	}
	protected postCSS(): React.CSSProperties {
		return {
			fill: this.state.color ?? this.props.color ?? Color.TEXT_000,
			background: "unset",
			backgroundColor: "unset",
			backgroundImage: "unset"
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
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseUp?.(this.style);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseDown?.(this.style);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseEnter?.(this.style);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseLeave?.(this.style);
			},
			onMouseMove: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseMove?.(this.style);
			},
			onContextMenu: (event: MouseEvent) => {
				if (this.props.onMouseUp) event.stopPropagation();
				if (this.props.onMouseDown) event.stopPropagation();
			}
		};
	}
	public style(color: IconState["color"], callback?: () => void) {
		this.setState((state) => ({ color: color }), () => callback?.());
	}
}

export default Icon;
