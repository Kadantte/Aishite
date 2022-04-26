import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Transition from "@/app/common/style/transition";

class ContainerProps extends Props<Children> {
	/** Whether to also trigger event from elements underneath. */
	public readonly phantom?: boolean;
	public readonly transition?: Transition;
	// events
	public readonly onMouseUp?: (callback: Container) => void;
	public readonly onMouseDown?: (callback: Container) => void;
	public readonly onMouseEnter?: (callback: Container) => void;
	public readonly onMouseLeave?: (callback: Container) => void;

	constructor(args: Args<ContainerProps>) {
		super(args);

		this.phantom = args.phantom;
		this.transition = args.transition;
		// events
		this.onMouseUp = args.onMouseUp;
		this.onMouseDown = args.onMouseDown;
		this.onMouseEnter = args.onMouseEnter;
		this.onMouseLeave = args.onMouseLeave;
	}
}

class ContainerState {
	public decoration: Nullable<Pick<ContainerProps, ("color" | "image" | "border" | "corner" | "shadow" | "opacity")>>;

	constructor(args: Args<ContainerState>) {
		this.decoration = args.decoration;
	}
}

class Container extends Stateful<ContainerProps, ContainerState> {
	protected create() {
		return new ContainerState({ decoration: null });
	}
	protected postCSS(): React.CSSProperties {
		return nullsafe({
			// handfully
			backgroundColor: this.state.decoration?.color,
			backgroundImage: this.state.decoration?.image,
			// automatic
			...Border(this.state.decoration?.border ?? {}),
			...Corner(this.state.decoration?.corner ?? {}),
			...Shadow(this.state.decoration?.shadow ?? []),
			// handfully...
			opacity: this.state.decoration?.opacity ? (this.state.decoration.opacity.clamp(0, 100) / 100) : undefined,
			// @ts-ignore
			...Transition({ ...this.props.transition, property: ["opacity", "box-shadow", "border", "border-radius", "transform", "background"] })
		});
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={this.props.id}
				onMouseUp={(event) => {
					if (!this.props.phantom) event.stopPropagation();
					this.props.onMouseUp?.(this);
				}}
				onMouseDown={(event) => {
					if (!this.props.phantom) event.stopPropagation();
					this.props.onMouseDown?.(this);
				}}
				onMouseEnter={(event) => {
					if (!this.props.phantom) event.stopPropagation();
					this.props.onMouseEnter?.(this);
				}}
				onMouseLeave={(event) => {
					if (!this.props.phantom) event.stopPropagation();
					this.props.onMouseLeave?.(this);
				}}
			>{this.props.children}</section>
		);
	}
	public style(decoration: ContainerState["decoration"], callback?: () => void) {
		this.setState((state) => ({ decoration: decoration }), () => callback?.());
	}
}

export default Container;
