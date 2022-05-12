import Unit from "@/app/common/unit";
import { Clear } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import navigator from "@/manager/navigator";

interface ViewportProps extends Clear<undefined> {
	// TODO: none
}

interface ViewportState {
	key: Nullable<React.Key>;
}

/**
 * This widget will display `navigator`'s current view,
 * and will scroll up to top upon `navigator` receive changes.
 * One may define which `Element` to scroll up
 * by declare `data-scrollable` custom attribute to desired element.
 */
class Viewport extends Stateful<ViewportProps, ViewportState> {
	protected create() {
		return ({ key: navigator.state.pages[navigator.state.index].widget.key });
	}
	protected events(): LifeCycle<ViewportProps, ViewportState> {
		return {
			DID_MOUNT: () => {
				navigator.handle((event) => {
					// cache
					const key = event.detail.after.pages[event.detail.after.index].widget.key;

					// reorder
					if (this.state.key === key && event.detail.before.pages.length === event.detail.after.pages.length) return;
					
					// render
					this.setState((state) => ({ key: event.detail.after.pages[event.detail.after.index].widget.key }), () => {
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
		return (<>{navigator.state.pages.map((page, index) => <section key={index} data-scrollable={"frame"} style={{ display: (this.state.key ? this.state.key === page.widget.key : navigator.state.index === index) ? "block" : "none", width: Unit(100, "%"), height: Unit(100, "%"), overflow: "auto" }}>{page.widget}</section>)}</>);
	}
}

export default Viewport;
