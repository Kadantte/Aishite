// common
import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
import Color from "@/app/common/color";
import Transition from "@/app/common/transition";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

class IconProps extends Props<undefined> {
	public readonly color?: Nullable<string>;
	/** Whether to also trigger event from elements underneath. */
	public readonly phantom?: boolean;
	public readonly transition?: ConstructorParameters<typeof Transition>[0];
	// events
	public readonly onMouseUp?: (callback: Icon) => void;
	public readonly onMouseDown?: (callback: Icon) => void;
	public readonly onMouseEnter?: (callback: Icon) => void;
	public readonly onMouseLeave?: (callback: Icon) => void;

	constructor(args: Args<IconProps>) {
		super(args);

		this.color = args.color;
		this.phantom = args.phantom;
		this.transition = args.transition;
		this.onMouseUp = args.onMouseUp;
		this.onMouseDown = args.onMouseDown;
		this.onMouseEnter = args.onMouseEnter;
		this.onMouseLeave = args.onMouseLeave;
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
		return new IconState({ color: null });
	}
	protected postCSS(): React.CSSProperties {
		return {
			fill: this.state.color ?? this.props.color ?? Color.TEXT_000,
			...new Transition({ ...this.props.transition, property: ["fill"] }).toStyle()
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...new Size({ width: Unit(12.5), height: Unit(12.5) }).toStyle()
		};
	}
	protected modify() {
		return {
			id: this.props.id,
			// events
			onMouseUp: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseUp?.(this);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseDown?.(this);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseEnter?.(this);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseLeave?.(this);
			}
		};
	}
	protected abstract build(): JSX.Element | Element;
	/** Override current style. */
	public style(color: IconState["color"], callback?: Method) {
		this.setState({ ...this.state, color: color }, callback);
	}
}

export default Icon;
