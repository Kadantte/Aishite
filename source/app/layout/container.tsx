import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Transition from "@/app/common/style/transition";

interface ContainerProps extends Props<Children> {
	/** Whether to prevent event triggers from elements underneath. */
	readonly priority?: boolean;
	readonly transition?: Transition;
	// events
	readonly onMouseUp?: (callback: Container["style"]) => void;
	readonly onMouseDown?: (callback: Container["style"]) => void;
	readonly onMouseEnter?: (callback: Container["style"]) => void;
	readonly onMouseLeave?: (callback: Container["style"]) => void;
	readonly onMouseMove?: (callback: Container["style"]) => void;
}

interface ContainerState {
	decoration: Nullable<Pick<ContainerProps, ("color" | "image" | "border" | "corner" | "shadow" | "opacity")>>;
}

class Container extends Stateful<ContainerProps, ContainerState> {
	protected create() {
		this.style = this.style.bind(this);

		return ({ decoration: null });
	}
	protected postCSS(): React.CSSProperties {
		return {
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
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={this.props.id}
				onMouseUp={(event) => {
					if (this.props.priority) event.stopPropagation();
					this.props.onMouseUp?.(this.style);
				}}
				onMouseDown={(event) => {
					if (this.props.priority) event.stopPropagation();
					this.props.onMouseDown?.(this.style);
				}}
				onMouseEnter={(event) => {
					if (this.props.priority) event.stopPropagation();
					this.props.onMouseEnter?.(this.style);
				}}
				onMouseLeave={(event) => {
					if (this.props.priority) event.stopPropagation();
					this.props.onMouseLeave?.(this.style);
				}}
				onMouseOver={(event) => {
					if (this.props.priority) event.stopPropagation();
					this.props.onMouseMove?.(this.style);
				}}
				onContextMenu={(event) => {
					if (this.props.onMouseUp) event.stopPropagation();
					if (this.props.onMouseDown) event.stopPropagation();
				}}
			>{this.props.children}</section>
		);
	}
	public style(decoration: ContainerState["decoration"], callback?: () => void) {
		this.setState((state) => ({ decoration: decoration }), () => callback?.());
	}
}

export default Container;
