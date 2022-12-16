import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import Bracket from "app/widgets/bracket";

import Fallback from "app/pages/fallback";

import structure from "handles/index";

interface PageViewProps extends Props.Clear<undefined> {
	// TODO: none
}

interface PageViewState {
	key: Nullable<React.Key>;
}

/**
 * This widget will display `history`'s current view,
 * and will scroll up to top upon `history` receive changes.
 * One may define which `Element` to scroll up
 * by declare `data-scrollbar` custom attribute to desired element.
 */
class Display extends Stateful<PageViewProps, PageViewState> {
	protected create() {
		return {
			key: structure("tabs").page.element.key
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				structure("tabs").handle((event) => {
					// cache
					const key = event.detail.post.pages[event.detail.post.index].element.key;

					// reorder
					if (this.state.key === key && event.detail.pre.pages.length === event.detail.post.pages.length) return;

					// re-render
					this.setState((state) => ({ key: event.detail.post.pages[event.detail.post.index].element.key }), () => {
						// reset scroll position
						const element = document.querySelector("#bracket:not([style*=\"display: none\"])");

						(element?.querySelector("*[style*=\"overflow: auto\"]") ?? element?.querySelector("*[style*=\"overflow: hidden auto\"]"))?.scrollTo({ top: 0, behavior: "smooth" });
					});
				});
			}
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<>
				{structure("tabs").state.pages.map((page, index) => {
					return (
						<Bracket key={page.element.key} constraint={{ height: 100.0 + "%" }} flags={{ visible: this.state.key ? this.state.key === page.element.key : structure("tabs").state.index === index }}
							fallback={<Fallback></Fallback>}
							children={page.element}
						/>
					);
				})}
			</>
		);
	}
}

export default Display;
