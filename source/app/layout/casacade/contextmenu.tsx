import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

import contextmenu from "@/manager/contextmenu";

interface ContextMenuProps extends Casacade {
	readonly items: typeof contextmenu["state"]["items"];
	/** Whether to prevent event triggers from elements underneath. */
	readonly phantom?: boolean;
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
