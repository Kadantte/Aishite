import Color from "app/common/color";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import Text from "app/layout/text";
import Grid from "app/layout/grid";
import Column from "app/layout/column";

import Scroll from "app/layout/casacade/scroll";
import Spacer from "app/layout/casacade/spacer";

import Button from "app/widgets/button";
import Paging from "app/widgets/paging";
import Dropdown from "app/widgets/dropdown";

import Gallery from "app/pages/browser/gallery";

import discord from "modules/discord";

import structure from "handles/index";

import { search } from "apis/hitomi.la/search";
import { suggest } from "apis/hitomi.la/suggest";

interface BrowserProps extends Props.Clear<undefined> {
	readonly value: string;
	readonly index: number;
}

interface BrowserState {
	init: boolean;
	search: {
		value: string;
		index: number;
	};
	suggest: {
		items: Await<ReturnType<typeof suggest>>;
	};
	gallery: {
		value: Array<number>;
	};
	highlight: string;
}

class Browser extends Stateful<BrowserProps, BrowserState> {
	protected create() {
		return {
			init: false,
			search: {
				value: this.props.value,
				index: this.props.index
			},
			suggest: {
				items: []
			},
			gallery: {
				value: []
			},
			highlight: "???"
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				this.onRender();

				structure("tabs").handle(this.onRender);
			},
			WILL_UNMOUNT: () => {
				structure("tabs").unhandle(this.onRender);
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
		return (
			<Column {...this.props} id={this.props.id ?? "browser"}>
				<Dropdown enable={this.state.gallery.value.isNotEmpty} items={this.state.suggest.items.map((item) => [item.first.key + ":" + item.first.value, item.second.toString()])} index={0} value={this.props.value === "language = \"all\"" ? undefined : this.props.value} fallback={this.state.search.value.isEmpty ? "language = \"all\"" : this.state.search.value} highlight={this.state.highlight} offset={{ margin: { all: 20.0 } }}
					onReset={() => {
						suggest("expire");

						structure("tabs").rename("NEW TAB");

						this.browse("language = \"all\"");
					}}
					onHover={(index) => {
						const element = this.node().getElementsByTagName("input").item(0);

						if (!element) return;
						if (!this.state.suggest.items[index]) return;

						element.value = (element.value.trim().replace(/\s*(=|!=)\s*/g, ($0, $1) => $1).split(space).slice(0, -1).join(space).replace(/\s*[&?+-]\s*$/, "") + space + "&" + space + this.state.suggest.items[index].first.toString()).replace(/\s*(=|!=)\s*/g, ($0, $1) => space + $1 + space).replace(/^\s*[&?+-]\s*/, "");
					}}
					onSelect={(value) => {
						suggest("expire");

						this.setState((state) => ({ suggest: { items: [] } }));
					}}
					onSubmit={(value) => {
						suggest("expire");

						structure("tabs").rename("Searching...");

						this.browse(value.isEmpty ? "language = \"all\"" : value).then((length) => {
							// rename
							structure("tabs").rename(`${length} Results`);
						});
					}}
					onChange={(value) => {
						suggest("expire");

						suggest(this.state.highlight).then((items) => {
							if (this.state.suggest.items.isNotEmpty) this.setState((state) => ({ suggest: { items: [] } }));

							this.state.highlight = value.trim().split(space).last ?? "???";

							if (items.isNotEmpty) this.setState((state) => ({ suggest: { items: items } }));
						});
					}}
				/>
				<Scroll x="hidden" y="auto">
					<Spacer>
						<Grid.Layout id="display" gap={20.0} count={5} width={resolution.width.maximum / (5 + 1)} offset={{ margin: { left: 20.0, right: 20.0 } }}>
							{this.state.gallery.value.skip(this.state.search.index * 25).take((this.state.gallery.value.length - this.state.search.index * 25).clamp(0, 25)).map((gallery) => {
								return (
									<Gallery key={gallery} gallery={gallery} constraint={{ height: resolution.height.minimum - 180.0 - 0.25 }}
										onClick={(tag) => {
											const element = this.node().getElementsByTagName("input").item(0);

											this.setState((state) => ({ suggest: { items: [] } }));

											if (!element) return;

											element.value = element.value.includes(tag) ? element.value.replace(tag, "").replace(/\s*[&?+-]\s*[&?+-]\s*/, space + "&" + space).replace(/\s*[&?+-]\s*$/, "") : (element.value + space + "&" + space + tag).replace(/^\s*[&?+-]\s*/, "");
										}}
									/>
								);
							})}
						</Grid.Layout>
					</Spacer>
				</Scroll>
				<Paging enable={this.state.gallery.value.isNotEmpty} size={5} index={this.state.search.index} length={Math.ceil(this.state.gallery.value.length / 25)} constraint={{ height: 60.0 }} flags={{ visible: Math.ceil(this.state.gallery.value.length / 25) > 1 }}
					builder={(key, index, indexing, handle) => {
						return (
							<Button key={key} offset={{ margin: { all: 2.5, top: 7.5, bottom: 7.5 }, padding: { left: 7.5, right: 7.5 } }} constraint={{ minimum: { width: 50.0 } }} decoration={{ corner: { all: 5.0 } }}
								onMouseDown={(setStyle) => {
									setStyle(undefined);

									handle(index);
								}}
								onMouseEnter={(setStyle) => {
									setStyle({ decoration: { color: Color.pick(3.0) } });
								}}
								onMouseLeave={(setStyle) => {
									setStyle(undefined);
								}}>
								<Text>{[{ value: /^[0-9]$/.test(key) ? (index + 1).toString() : key, color: indexing ? "aquamarine" : undefined }]}</Text>
							</Button>
						);
					}}
					onPaging={(index) => {
						if (!this.visible()) return false;
						// reset scroll position
						this.node().querySelector("#display")?.scrollTo({ top: 0 });
						// this.browse(this.state.search.value, index);
						this.setState((state) => ({ search: { value: this.state.search.value, index: index } }));

						return true;
					}}
				/>
			</Column>
		);
	}
	protected visible() {
		return structure("tabs").peek().element.props["data-key"] === (this.props as typeof this.props & { "data-key": string })["data-key"];
	}
	protected discord() {
		if (!this.visible()) return;

		if (this.state.gallery.value.isEmpty) {
			discord.update({ state: "Browsing", details: "Loading...", partyMax: undefined, partySize: undefined });
		}
		else {
			discord.update({ state: "Browsing", details: this.state.search.value, partyMax: Math.ceil(this.state.gallery.value.length / 25), partySize: this.state.search.index + 1 });
		}
	}
	protected async browse(value: string, index = 0) {
		return new Promise((resolve, reject) => {
			this.setState((state) => ({ search: { value: value, index: index }, suggest: { items: [] }, gallery: { value: [] }, highlight: "???" }), () => {

				this.discord();

				search(value).then((_bundle) => {
					const _result = Array.from(_bundle);

					this.discord();

					this.setState((state) => ({ gallery: { value: _result } }), () => resolve(_result.length));
				});
			});
		});
	}
	@autobind()
	protected async onRender() {
		if (!this.visible()) return;

		this.discord();
		
		if (this.state.init) return;
		
		this.state.init = true;

		this.browse(this.state.search.value, this.state.search.index);
	}
}

export default Browser;
