import Unit from "@/app/common/unit";
import { Clear } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import history from "@/handles/history";

interface ViewportProps extends Clear<undefined> {
	// TODO: none
}

interface ViewportState {
	key: Nullable<React.Key>;
}

/**
 * This widget will display `history`'s current view,
 * and will scroll up to top upon `history` receive changes.
 * One may define which `Element` to scroll up
 * by declare `data-scrollable` custom attribute to desired element.
 */
class Viewport extends Stateful<ViewportProps, ViewportState> {
	protected create() {
		return ({ key: history.state.pages[history.state.index].element.key });
	}
	protected events(): LifeCycle<ViewportProps, ViewportState> {
		return {
			DID_MOUNT: () => {
				history.handle((event) => {
					// cache
					const key = event.detail.after.pages[event.detail.after.index].element.key;

					// reorder
					if (this.state.key === key && event.detail.before.pages.length === event.detail.after.pages.length) return;
					
					// render
					this.setState((state) => ({ key: event.detail.after.pages[event.detail.after.index].element.key }), () => {
						// reset scroll position
						document.querySelector("#background > section[style*=\"display: block\"] *[data-scrollable]")?.scrollTo({ top: 0, behavior: "smooth" });
					});
				});
			}
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (<>{history.state.pages.map((page, index) => <section key={index} data-scrollable="frame" style={{ display: (this.state.key ? this.state.key === page.element.key : history.state.index === index) ? "block" : "none", width: Unit(100, "%"), height: Unit(100, "%"), overflow: "auto" }}>{page.element}</section>)}</>);
	}
}

export default Viewport;
