import Style from "@/app/common/styles";
import { Props } from "@/app/common/props";
import { CSSProps } from "@/app/common/framework";
import { Stateful } from "@/app/common/framework";

interface ContainerProps extends Props.Clear, Props.Style {
	// optional
	readonly priority?: boolean;
	readonly transition?: Style["transition"];
	// events
	readonly onMouseUp?: (setStyle: typeof Container.prototype["setStyle"]) => void;
	readonly onMouseDown?: (setStyle: typeof Container.prototype["setStyle"]) => void;
	readonly onMouseEnter?: (setStyle: typeof Container.prototype["setStyle"]) => void;
	readonly onMouseLeave?: (setStyle: typeof Container.prototype["setStyle"]) => void;
	readonly onMouseMove?: (setStyle: typeof Container.prototype["setStyle"]) => void;
}

interface ContainerState {
	decoration?: Props.Style;
}

class Container extends Stateful<ContainerProps, ContainerState> {
	protected create() {
		return {
			decoration: undefined
		};
	}
	protected events() {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {
			// automatic
			...CSSProps.plus(this.state.decoration ?? {}),
			// @ts-ignore
			...Style.transition({ ...this.props.transition, property: ["opacity", "box-shadow", "border", "border-radius", "transform", "background"] })
		};
	}
	protected override() {
		return {
			// events
			onMouseUp: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseUp?.(this.setStyle);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseDown?.(this.setStyle);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseEnter?.(this.setStyle);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseLeave?.(this.setStyle);
			},
			onMouseMove: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				this.props.onMouseMove?.(this.setStyle);
			},
			onContextMenu: (event: MouseEvent) => {
				if (this.props.onMouseUp) event.stopPropagation();
				if (this.props.onMouseDown) event.stopPropagation();
			}
		};
	}
	protected build() {
		return (
			<section id={this.props.id ?? "container"}>{this.props.children}</section>
		);
	}
	@autobind()
	protected setStyle(decoration: ContainerState["decoration"], callback?: () => void) {
		this.setState((state) => ({ decoration: decoration }), callback);
	}
}

export default Container;
