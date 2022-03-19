// react
import React from "react";
// TOP-LEVEL
import PageView from "@/app/views";
// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { EventManager } from "@/app/common/framework";
// layout
import Text from "@/app/layout/text";
import Column from "@/app/layout/column";
import { Cell, Grid } from "@/app/layout/grid";
// layout/casacade
import Offset from "@/app/layout/casacade/offset";
import Spacer from "@/app/layout/casacade/spacer";
import Scroll from "@/app/layout/casacade/scroll";
import Decoration from "@/app/layout/casacade/decoration";
// widgets
import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";
import Gallery from "@/app/views/browser/gallery";
import Dropdown from "@/app/widgets/dropdown";
// modules
import discord from "@/modules/discord";
import { SearchQuery } from "@/modules/hitomi.la/search";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";
import { SuggestTags, SuggestExpire } from "@/modules/hitomi.la/suggest";
// states
import navigator from "@/states/navigator";

class BrowserProps extends Props<undefined> {
	public index: number;
	public query: string;

	constructor(args: Args<BrowserProps>) {
		super(args);

		this.index = args.index;
		this.query = args.query;
	}
}

class BrowserState extends BrowserProps {
	public init: boolean;
	public length: number;
	public gallery: Array<GalleryBlock>;
	public suggests: Await<ReturnType<typeof SuggestTags>>;
	public highlight: string;
	public controller: React.RefObject<HTMLInputElement>;

	constructor(args: Omit<Args<BrowserState>, "controller">) {
		super(args);

		this.init = args.init;
		this.length = args.length;
		this.gallery = args.gallery;
		this.suggests = args.suggests;
		this.highlight = args.highlight;
		this.controller = React.createRef();
	}
}

class Browser extends PageView<BrowserProps, BrowserState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (this.visible()) {
				if (!this.state.init) {
					// loading
					this.discord(false);
					// init
					this.macro_0(() => {
						if (this.visible()) this.discord(true);
					});
				}
				this.discord(!this.state.gallery.isEmpty());
			}
		});
		return new BrowserState({ init: false, index: this.props.index, query: this.props.query, length: 0, gallery: [], suggests: [], highlight: "" });
	}
	protected events() {
		return [
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) { this.discord(false); this.macro_0(() => { if (this.visible()) this.discord(true); }); }
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Column id={"browser"}>
				{/* SCROLL */}
				<Spacer>
					<Scroll x={"hidden"} y={"auto"}>
						<section data-scrollable={"frame"}>
							{/* QUERY */}
							<Offset type={"margin"} all={Unit(15)}>
								<Grid
									gap={Unit(15)}
									rows={[
										Unit(40),
										Unit(1.0, "fr")
									]}
									columns={[
										Unit(1.0, "fr")
									]}
									template={[
										["query"],
										["gallery"]
									]}>
									<Cell area={"query"} overflow={true}>
										<Dropdown toggle={!this.state.gallery.isEmpty()} index={0} options={this.state.suggests.map((suggest) => [suggest.field + ":" + suggest.value, suggest.count.toString()])} value={this.state.query === "language:all" ? undefined : this.state.query} fallback={this.state.query.length ? this.state.query : "language:all"} highlight={this.state.highlight} controller={this.state.controller}
											onReset={() => {
												// expire
												SuggestExpire();
												// reset gallery
												this.setState({ ...this.state, index: 0, query: "language:all", length: 0, gallery: [], suggests: [] }, () => {
													// update gallery
													this.gallery(this.state.query, this.state.index);
													// rename
													navigator.rename(this.state.query);
												});
											}}
											onIndex={(index) => {
												// update
												this.query()!.value = this.query()!.value.split(/\s+/).slice(0, -1).concat((this.state.suggests[index].field + ":" + this.state.suggests[index].value).replace(/\s+/g, "_")).join("\u0020");
											}}
											onSelect={(text) => {
												// expire
												SuggestExpire();
												// reset suggestions
												this.setState({ ...this.state, suggests: [] });
											}}
											onSubmit={(text) => {
												// expire
												SuggestExpire();
												// reset gallery
												this.setState({ ...this.state, index: 0, query: text.length ? text : "language:all", length: 0, gallery: [], suggests: [] }, () => {
													// update gallery
													this.gallery(this.state.query, this.state.index);
													// rename
													navigator.rename(this.state.query);
												});
											}}
											onChange={(text) => {
												// expire
												SuggestExpire();
												// update highlight
												this.state.highlight = text.split(/\s+/).last?.split(/:/).last ?? "";
												// reset suggestions
												if (!this.state.suggests.isEmpty()) {
													this.setState({ ...this.state, suggests: [] });
												}
												// fetch
												SuggestTags(this.state.highlight).then((suggestions) => {
													// updage suggestions
													if (!suggestions.isEmpty()) {
														this.setState({ ...this.state, suggests: suggestions });
													}
												});
											}}
										/>
									</Cell>
									<Cell area={"gallery"}>
										<Grid
											gap={Unit(15)}
											rows={{
												times: "auto",
												values: [Unit(455)]
											}}
											columns={{
												times: "auto-fit",
												minimum: Unit(1920 / (5 + 1))
											}}>
											{this.state.gallery.map((gallery, x) => {
												return (
													<Gallery key={x} gallery={gallery}
														onTagClick={(tag) => {
															// cache
															const query = this.query();

															if (query) {
																if (query.value.includes(tag)) {
																	query.value = query.value.replace(tag, "").replace(/^\s/, "").replace(/\s$/, "").replace(/\s\s+/g, "\u0020");
																} else {
																	query.value += "\u0020" + tag;
																}
															}
														}}
													/>
												);
											})}
										</Grid>
									</Cell>
								</Grid>
							</Offset>
						</section>
					</Scroll>
				</Spacer>
				{/* PAGING */}
				<Decoration shadow={[[Color.DARK_100, 0, 0, 5, 0]]} background={{ color: Color.DARK_100 }}>
					<Paging visible={this.state.length > 1} toggle={!this.state.gallery.isEmpty()} index={this.state.index} length={this.state.length} overflow={7} firstShortcut={true} lastShortcut={true} height={Unit(45)}
						onPaging={(index) => {
							if (!this.visible()) {
								return false;
							}
							// reset gallery
							this.setState({ ...this.state, index: index, gallery: [] }, () => {
								// update gallery
								this.gallery(this.state.query, this.state.index);
							});
							// approve
							return true;
						}}
						builder={(key, index, indexing, jump) => {
							return (
								<Offset key={key} type={"margin"} top={Unit(7.5)} bottom={Unit(7.5)}>
									<Offset type={"padding"} left={Unit(7.5)} right={Unit(7.5)}>
										<Button size={{ minimum: { width: Unit(50) } }} decoration={{ corner: { all: Unit(3.5) } }}
											onMouseDown={(I) => {
												I.style(null, jump);
											}}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.DARK_200 } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
											children={<Text>{[{ value: typeof index === "string" ? index : (index + 1).toString(), color: !this.state.gallery.isEmpty() && this.state.length ? indexing ? Color.SPOTLIGHT : Color.TEXT_000 : Color.DARK_500 }]}</Text>}
										/>
									</Offset>
								</Offset>
							);
						}}
					/>
				</Decoration>
			</Column>
		);
	}
	/**
	 * Based on 1920*1080
	 */
	protected grid() {
		return Math.round(window.outerWidth / (screen.width / 5));
	}
	protected query() {
		// return this.node()?.getElementsByTagName("input")?.item(0);
		return this.state.controller.current;
	}
	/**
	 * Update gallery blocks based on current (state / props) `query` and `index`.
	 */
	protected gallery(query: string, index: number, callback?: Method) {
		// fetch
		SearchQuery(query).then((response) => {
			// to avoid bottleneck, make requests then assign them in order
			const block: Array<GalleryBlock> = [];
			const array: Array<number> = response.skip(index ? index * 25 : 0).take(25);

			for (let index = 0; index < array.length; index++) {
				// fetch
				GalleryBlock(array[index]).then((gallery) => {
					// assigned
					block[index] = gallery;
					// check if every request is retrieved
					if (block.length === array.length) {
						// update
						this.setState({ ...this.state, length: Math.ceil(response.length / 25), gallery: block });
						// callaback
						return callback?.();
					}
				}).catch((error) => console.debug(error));
			}
		});
	}
	protected macro_0(callback?: Method) {
		this.setState({ ...this.state, init: true }, () => {
			this.gallery(this.state.query, this.state.index, () => callback?.());
		});
	}
	protected discord(state: boolean) {
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
}

export default Browser;
