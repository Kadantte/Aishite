import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

import contextmenu from "@/manager/contextmenu";

class ContextMenuProps extends Casacade {
	public readonly items: typeof contextmenu["state"]["items"];
	/** Whether to prevent event triggers from elements underneath. */
	public readonly phantom?: boolean;

	constructor(args: Args<ContextMenuProps>) {
		super(args);

		this.items = args.items;
		this.phantom = args.phantom;
	}
}

class ContextMenu extends StyleSheet<ContextMenuProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected override() {
		return {
			// events
			onContextMenu: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				// open
				contextmenu.state = { x: event.pageX, y: event.pageY, items: this.props.items };
			}
		};
	}
}

export default ContextMenu;
