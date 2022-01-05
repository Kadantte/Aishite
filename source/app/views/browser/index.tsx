// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Text from "@/app/layout/text";
import Form from "@/app/layout/form";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Offset from "@/app/layout/offset";
import Spacer from "@/app/layout/spacer";
import Scroll from "@/app/layout/scroll";
import Container from "@/app/layout/container";
import Decoration from "@/app/layout/decoration";
import { Cell, Grid } from "@/app/layout/grid";
// widgets
import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";
import Gallery from "@/app/views/browser/gallery";
// icons
import Close from "@/app/icons/close";
// modules
import { SearchQuery } from "@/modules/hitomi.la/search";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";
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

	constructor(args: Args<BrowserState>) {
		super(args);

		this.init = args.init;
		this.length = args.length;
		this.gallery = args.gallery;
	}
}

class Browser extends Stateful<BrowserProps, BrowserState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (this.visible() && !this.state.init) this.macro_0();
		});
		return new BrowserState({ init: false, index: this.props.index, query: this.props.query, length: 0, gallery: [] });
	}
	protected events() {
		return [
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) this.macro_0();
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
										Unit(1, "fr")
									]}
									columns={[
										Unit(1, "fr")
									]}
									template={[
										["query"],
										["gallery"]
									]}>
									<Cell area={"query"}>
										<Container decoration={{ shadow: [[Color.DARK_100, 0, 0, 5, 0]], corner: { all: Unit(4.5) }, background: { color: Color.DARK_300 } }}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.DARK_400 } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}>
											<Size height={Unit(100, "%")}>
												<Row>
													<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
														<Form toggle={!this.state.gallery.empty} fallback={this.state.query.length ? this.state.query : "language:all"}
															onType={(text) => {
																return true;
															}}
															onSubmit={(text) => {
																// reset gallery
																this.setState({ ...this.state, index: 0, query: text.length ? text : "language:all", length: 0, gallery: [] }, () => {
																	// update gallery
																	this.gallery(this.state.query, this.state.index);
																	// rename
																	navigator.rename(this.state.query);
																});
															}}
														/>
													</Offset>
													<Size width={Unit(50)}>
														<Center x={true} y={true}>
															<Close color={Color.DARK_500}
																onMouseDown={(I) => {
																	// reset gallery
																	this.setState({ ...this.state, index: 0, query: "language:all", length: 0, gallery: [] }, () => {
																		// update gallery
																		this.gallery(this.state.query, this.state.index);
																		// rename
																		navigator.rename(this.state.query);
																	});
																}}
																onMouseEnter={(I) => {
																	I.style(Color.TEXT_000);
																}}
																onMouseLeave={(I) => {
																	I.style(null);
																}}
															/>
														</Center>
													</Size>
												</Row>
											</Size>
										</Container>
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
															const query = this.node()!.querySelector("input")!;

															if (query.value.includes(tag)) {
																query.value = query.value.replace(tag, "").replace(/\s$/, "").replace(/\s\s+/g, "\u0020");
															} else {
																query.value += "\u0020" + tag;
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
				{(() => {
					if (this.state.length > 1) {
						return (
							<Size height={Unit(45)}>
								<Decoration shadow={[[Color.DARK_100, 0, 0, 5, 0]]} background={{ color: Color.DARK_100 }}>
									<Paging toggle={!this.state.gallery.empty} index={this.state.index} length={this.state.length} overflow={7} shortcut={{ first: true, last: true }}
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
										onButton={(key, index, indexing, jump) => {
											return (
												<Size key={key} type={"minimum"} width={Unit(50)}>
													<Offset type={"margin"} top={Unit(7.5)} bottom={Unit(7.5)}>
														<Offset type={"padding"} left={Unit(7.5)} right={Unit(7.5)}>
															<Button decoration={{ corner: { all: Unit(3.5) } }}
																onMouseDown={(I) => {
																	I.style(null, jump);
																}}
																onMouseEnter={(I) => {
																	I.style({ background: { color: Color.DARK_200 } });
																}}
																onMouseLeave={(I) => {
																	I.style(null);
																}}
																children={<Text color={!this.state.gallery.empty && this.state.length ? indexing ? Color.SPOTLIGHT : Color.TEXT_000 : Color.DARK_500}>{typeof index === "string" ? index : (index + 1).toString()}</Text>}
															/>
														</Offset>
													</Offset>
												</Size>
											);
										}}
									/>
								</Decoration>
							</Size>
						);
					}
				})()}
			</Column>
		);
	}
	/**
	 * Based on 1920*1080
	 */
	protected grid() {
		return Math.round(window.outerWidth / (1920 / 5));
	}
	/**
	 * Whether the component is visible
	 */
	protected visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.node()?.closest("section[style*=\"display: block\"]") !== null;
	}
	/**
	 * Update gallery blocks based on current (state / props) `query` and `index`.
	 */
	protected gallery(query: string, index: number) {
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
					}
				}).catch(() => {
					// fallback
					return this.gallery("language:all", 0);
				});
			}
		});
	}
	protected macro_0() {
		this.setState({ ...this.state, init: true }, () => this.gallery(this.state.query, this.state.index));
	}
}

export default Browser;
