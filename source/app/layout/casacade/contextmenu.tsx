import { Props } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

import structure from "@/handles";

interface ContextMenuProps extends Props.Casacade {
	// required
	readonly items: ReturnType<typeof structure>["state"]["items"];
	// optional
	readonly priority?: boolean;
}

class ContextMenu extends StyleSheet<ContextMenuProps> {
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected override() {
		return {
			onContextMenu: (event: MouseEvent) => {
				if (this.props.priority) event.stopPropagation();
				// open contextmenu
				structure("contextmenu").state = { id: new Date().toISOString(), x: event.pageX, y: event.pageY, items: this.props.items };
			}
		};
	}
}

export default ContextMenu;
