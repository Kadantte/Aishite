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
		length: number;
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
				items: new Array()
			},
			gallery: {
				value: new Array(),
				length: 0
			},
			highlight: "???"
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				// initial
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
				<Dropdown enable={!this.state.gallery.value.isEmpty} items={this.state.suggest.items.map((suggestion) => [suggestion.first.namespace + ":" + suggestion.first.value, suggestion.second.toString()])} index={0} value={this.props.value === "language = \"all\"" ? undefined : this.props.value} fallback={this.state.search.value.isEmpty ? "language = \"all\"" : this.state.search.value} highlight={this.state.highlight} offset={{ margin: { all: 20.0 } }}
					onReset={() => {
						suggest("expire");

						structure("tabs").rename("NEW TAB");

						this.browse("language = \"all\"");
					}}
					onHover={(index) => {
						// cache
						const input = this.node().getElementsByTagName("input").item(0)!;

						if (!this.state.suggest.items[index]) return;

						input.value = (input.value.trim().replace(/\s*(=|!=)\s*/g, ($0, $1) => $1).split(space).slice(0, -1).join(space).replace(/\s*[&?+-]\s*$/, "") + space + "&" + space + this.state.suggest.items[index].first.toString()).replace(/\s*(=|!=)\s*/g, ($0, $1) => space + $1 + space).replace(/^\s*[&?+-]\s*/, "");
					}}
					onSelect={(text) => {
						suggest("expire");

						this.setState((state) => ({ suggest: { items: new Array() } }));
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

						if (!this.state.suggest.items.isEmpty) this.setState((state) => ({ suggest: { items: new Array() } }));
						// silent update
						this.state.highlight = value.trim().split(space).last ?? "???";

						suggest(this.state.highlight).then((suggestion) => {
							if (!suggestion.isEmpty) this.setState((state) => ({ suggest: { items: suggestion } }));
						});
					}}
				/>
				<Scroll x="hidden" y="auto">
					<Spacer>
						<Grid.Layout id="display" gap={20.0} count={5} width={app.max_width / (5 + 1)} offset={{ margin: { left: 20.0, right: 20.0 } }}>
							{this.state.gallery.value.map((gallery, index) => {
								return (
									<Gallery key={index} gallery={gallery} constraint={{ height: app.min_height - 180.0 - 0.25 }}
										onClick={(tag) => {
											// cache
											const input = this.node().getElementsByTagName("input").item(0)!;

											this.setState((state) => ({ suggest: { items: new Array() } }));

											input.value = input.value.includes(tag) ? input.value.replace(tag, "").replace(/\s*[&?+-]\s*[&?+-]\s*/, space + "&" + space).replace(/\s*[&?+-]\s*$/, "") : (input.value + space + "&" + space + tag).replace(/^\s*[&?+-]\s*/, "");
										}}
									/>
								);
							})}
						</Grid.Layout>
					</Spacer>
				</Scroll>
				<Paging enable={!this.state.gallery.value.isEmpty} size={5} index={this.state.search.index} length={this.state.gallery.length} constraint={{ height: 60.0 }} flags={{ visible: this.state.gallery.length > 1 }}
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
								}}
								children={<Text>{[{ value: /^[0-9]$/.test(key) ? (index + 1).toString() : key, color: indexing ? "aquamarine" : undefined }]}</Text>}
							/>
						);
					}}
					onPaging={(index) => {
						if (!this.visible()) return false;

						this.browse(this.state.search.value, index);

						return true;
					}}
				/>
			</Column>
		);
	}
	protected visible() {
		return structure("tabs").page.element.props["data-key"] === (this.props as any)["data-key"];
	}
	protected discord() {
		if (!this.visible()) return;

		if (this.state.gallery.value.isEmpty) {
			discord.update({ state: "Browsing", details: "Loading...", partyMax: undefined, partySize: undefined });
		}
		else {
			discord.update({ state: "Browsing", details: this.state.search.value, partyMax: this.state.gallery.length, partySize: this.state.search.index + 1 });
		}
	}
	protected async browse(value: string, index: number = 0, length: number = 25) {
		return new Promise((resolve, reject) => {
			// update
			this.setState((state) => ({ search: { value: value, index: index }, suggest: { items: new Array() }, gallery: { value: new Array(), length: this.state.gallery.length }, highlight: "???" }), () => {
				// rich presence
				this.discord();

				search(value).then((_bundle) => {
					// cache
					const [_result, _galleries] = [Array.from(_bundle), new Array()];

					const [_offset, _length] = [index * length, (_result.length - index * length).clamp(0, length)];

					// rich presence
					this.discord();
					// callback?
					resolve(_result.length);

					this.setState((state) => ({ gallery: { value: _result.skip(_offset).take(_length), length: Math.ceil(_result.length / length) } }));
				});
			});
		});
	}
	@autobind()
	protected async onRender() {
		// skip
		if (!this.visible()) return;

		if (!this.state.init) {
			// silent update
			this.state.init = true;

			this.browse(this.state.search.value, this.state.search.index);
		}
	}
}

export default Browser;
