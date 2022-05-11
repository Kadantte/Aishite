import React from "react";

import Page from "@/app/pages";

import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear } from "@/app/common/props";
import { LifeCycle } from "@/app/common/framework";

import Pair from "@/models/pair";

import Text from "@/app/layout/text";
import Grid from "@/app/layout/grid";

import Scroll from "@/app/layout/casacade/scroll";
import Spacer from "@/app/layout/casacade/spacer";
import ContextMenu from "@/app/layout/casacade/contextmenu";

import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";
import Dropdown from "@/app/widgets/dropdown";

import Gallery from "@/app/pages/browser/gallery";

import discord from "@/modules/discord";

import navigator from "@/manager/navigator";

import search from "@/apis/hitomi.la/search";
import suggest from "@/apis/hitomi.la/suggest";
import gallery from "@/apis/hitomi.la/gallery";
import Column from "@/app/layout/column";

type _Gallery = Await<ReturnType<typeof gallery["get"]>>;
type _Suggests = Await<ReturnType<typeof suggest["tags"]>>;

class BrowserProps extends Clear<undefined> {
	public query: string;
	public index: number;

	constructor(args: Args<BrowserProps>) {
		super(args);

		this.query = args.query;
		this.index = args.index;
	}
}

class BrowserState extends BrowserProps {
	public init: boolean;
	public gallery: Array<_Gallery>;
	public suggests: _Suggests;
	public highlight: string;
	public length: number;

	public controller: Reference<HTMLInputElement>;

	constructor(args: Omit<Args<BrowserState>, "controller">) {
		super(args);

		this.init = args.init;
		this.gallery = args.gallery;
		this.suggests = args.suggests;
		this.highlight = args.highlight;
		this.length = args.length;

		this.controller = React.createRef();
	}
}

class Browser extends Page<BrowserProps, BrowserState> {
	protected create() {
		// permanent
		this.handle = this.handle.bind(this);

		return new BrowserState({ init: false, query: this.props.query, index: this.props.index, gallery: [], suggests: [], highlight: "", length: 0 });
	}
	protected events(): LifeCycle<BrowserProps, BrowserState> {
		return {
			DID_MOUNT: () => {
				// @ts-ignore
				this.handle(null);

				navigator.handle(this.handle);
			},
			WILL_UNMOUNT: () => {
				navigator.unhandle(this.handle);
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
			<Column id="browser">
				<Spacer>
					<Scroll x="hidden" y="auto" scrollbar="frame">
						<section>
							<Grid.Region gap={{ inner: 15, outer: 15 }} rows={[40, Unit(1.0, "fr")]} columns={[Unit(1.0, "fr")]} template={[["form"], ["display"]]}>
								<Grid.Cell id="form">
									<Dropdown toggle={!this.state.gallery.isEmpty()} index={0} items={this.state.suggests.map((suggestion) => new Pair(suggestion.first.toString(), suggestion.second.toString()))} value={this.state.query === "language:all" ? undefined : this.state.query} fallback={this.state.query.isEmpty() ? "language:all" : this.state.query} highlight={this.state.highlight} controller={this.state.controller}
										onReset={() => {
											// expire
											suggest.outdate();

											navigator.rename("language:all");

											this.display("language:all", 0);
										}}
										onIndex={(index) => {
											// cache
											const element = this.state.controller.current;

											if (element) {
												element.value = element.value.split(/\s+/).slice(0, -1).add(this.state.suggests[index].first.toString()).join(space).replace(/\s+/g, space).replace(/^\s+/, "").replace(/\s+$/, "");
											}
										}}
										onSelect={(text) => {
											// expire
											suggest.outdate();

											this.setState((state) => ({ suggests: [] }));
										}}
										onSubmit={(text) => {
											// cache
											const query = text.isEmpty() ? "language:all" : text;
											// expire
											suggest.outdate();

											navigator.rename(query);

											this.display(query, 0);
										}}
										onChange={(text) => {
											// expire
											suggest.outdate();

											if (!this.state.suggests.isEmpty()) this.setState((state) => ({ suggests: [] }));

											this.state.highlight = text.split(/\s+/).last?.split(":").last ?? "";

											suggest.tags(this.state.highlight).then((suggestion) => {
												if (!suggestion.isEmpty()) this.setState((state) => ({ suggests: suggestion }));
											});
										}}
									/>
								</Grid.Cell>
								<Grid.Cell id="display">
									<Grid.Layout gap={{ inner: 15 }} count={5} minimum={(responsive.width - 30) / 1.5 - 30}>
										{this.state.gallery.map((_gallery, index) => {
											return (
												<ContextMenu key={index} items={[
													{
														role: "Copy URL",
														toggle: true,
														method: () => {
															// text/plain
															window.navigator.clipboard.writeText(_gallery.getURL());
														}
													},
													"seperator",
													{
														role: "Download",
														toggle: false,
														method: () => {
															throw Error("Unimplemented");
														}
													},
													{
														role: "Bookmark",
														toggle: false,
														method: () => {
															throw Error("Unimplemented");
														}
													},
													"seperator",
													{
														role: "Open in Viewer",
														toggle: true,
														method: () => {
															navigator.open(_gallery.title, "VIEWER", { gallery: _gallery.id });
														}
													}]}>
													<section id="wrapper">
														<Gallery gallery={_gallery} height={(responsive.height - (185 - 15))}
															onClick={(tag) => {
																// cache
																const element = this.state.controller.current;

																if (element) {
																	element.value = (element.value.includes(tag) ? element.value.replace(tag, "") : element.value + space + tag).replace(/\s+/g, space).replace(/^\s+/, "").replace(/\s+$/, "");
																}
															}}
														/>
													</section>
												</ContextMenu>
											);
										})}
									</Grid.Layout>
								</Grid.Cell>
							</Grid.Region>
						</section>
					</Scroll>
				</Spacer>
				<Paging toggle={!this.state.gallery.isEmpty()} index={this.state.index} length={this.state.length} overflow={7} shortcut={new Pair(true, true)} color={Color.DARK_100} height={45} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]} visible={this.state.length > 1}
					onPaging={(index) => {
						// disapprove
						if (!this.visible()) return false;

						this.display(this.state.query, index);
						// approve
						return true;
					}}
					builder={(key, indexing, handle) => {
						return (
							<Button key={key} minimum={{ width: 50 }} margin={{ top: 7.5, bottom: 7.5 }} padding={{ left: 7.5, right: 7.5 }} corner={{ all: 4.5 }}
								onMouseDown={(style) => {
									style(null, () => handle());
								}}
								onMouseEnter={(style) => {
									style({ color: Color.DARK_200 });
								}}
								onMouseLeave={(style) => {
									style(null);
								}}
								children={<Text>{[{ text: typeof key === "string" ? key : (key + 1).toString(), color: !this.state.gallery.isEmpty() && this.state.length ? indexing ? Color.RGBA_000 : Color.TEXT_000 : Color.DARK_500 }]}</Text>}
							/>
						);
					}}
				/>
			</Column>
		);
	}
	protected handle(event: Parameters<Parameters<typeof navigator["handle"]>[0]>[0]) {
		if (!this.visible()) return;

		if (this.state.init) {
			// update
			this.discord(true);
		} else {
			// update
			this.discord(false);

			this.state.init = true;

			this.display(this.state.query, this.state.index);
		}
	}
	protected discord(state: boolean = !this.state.gallery.isEmpty()) {
		if (!this.visible()) return;

		switch (state) {
			case true: {
				discord.update({
					state: "Browsing",
					details: this.state.query,
					partyMax: this.state.length,
					partySize: this.state.index + 1
				});
				break;
			}
			case false: {
				discord.update({
					state: "Browsing",
					details: "Loading...",
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
	protected display(query: string, index: number) {
		// reset
		this.setState((state) => ({ query: query, gallery: [], suggests: [], highlight: "" }), () => {
			// fetch
			search.query(query).then((response) => {
				// avoid bottleneck
				const block = Array<_Gallery>();
				const array = Array.from(response).skip(index ? index * 25 : 0).take(25);

				for (let _index = 0; _index < array.length; _index++) {
					// fetch
					gallery.get(array[_index]).then((_gallery) => {
						// assign
						block[_index] = _gallery;

						if (block.length === array.length) {
							// update
							this.setState((state) => ({ index: index, gallery: block, length: Math.ceil(response.size / 25) }), () => this.discord(true));
						}
					}).catch((error) => print(error));
				}
			});
		});
	}
}

export default Browser;
