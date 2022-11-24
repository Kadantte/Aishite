import Style from "@/app/common/styles";
import { Props } from "@/app/common/props";
import { CSSPlus } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

interface IconProps extends Props.Clear<undefined>, Omit<Props.Style, CSSPlus.DECORATION> {
	// optional
	readonly color?: React.CSSProperties["fill"];
	readonly priority?: boolean;
	readonly transition?: Style["transition"];
	// events
	readonly onMouseUp?: (setColor: typeof Icon.prototype["setColor"]) => void;
	readonly onMouseDown?: (setColor: typeof Icon.prototype["setColor"]) => void;
	readonly onMouseEnter?: (setColor: typeof Icon.prototype["setColor"]) => void;
	readonly onMouseLeave?: (setColor: typeof Icon.prototype["setColor"]) => void;
	readonly onMouseMove?: (setColor: typeof Icon.prototype["setColor"]) => void;
}

interface IconState {
	color: IconProps["color"];
}

abstract class Icon extends Stateful<IconProps, IconState> {
	protected create() {
		return {
			color: undefined 
		};
	}
	protected events() {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Style.size({ width: 12.5, height: 12.5 })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {
			// manually
			fill: this.state.color ?? this.props.color ?? "#AAAAAA",
			// automatic
			...Style.transition({ ...this.props.transition, property: ["fill"] })
		};
	}
	protected override() {
		return {
			// events
			onMouseUp: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseUp?.(this.setColor);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseDown?.(this.setColor);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseEnter?.(this.setColor);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseLeave?.(this.setColor);
			},
			onMouseMove: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseMove?.(this.setColor);
			},
			onContextMenu: (event: MouseEvent) => {
				if (this.props.onMouseUp) event.stopPropagation();
				if (this.props.onMouseDown) event.stopPropagation();
			}
		};
	}
	@autobind()
	protected setColor(color: IconState["color"], callback?: () => void) {
		this.setState((state) => ({ color: color }), callback);
	}
}

export default Icon;
