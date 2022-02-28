// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class DraggableProps extends Casacade {
	public readonly drag: boolean;

	constructor(args: Args<DraggableProps>) {
		super(args);

		this.drag = args.drag;
	}
}

class Draggable extends StyleSheet<DraggableProps> {
	protected postCSS(): React.CSSProperties {
		return {
			WebkitAppRegion: (this.props.drag ? "drag" : "no-drag")
		} as const;
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
}

export default Draggable;
