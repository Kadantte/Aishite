// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Container from "@/app/layout/container";
// layout/casacade
import Stack from "@/app/layout/casacade/stack";
import Scroll from "@/app/layout/casacade/scroll";
import Offset from "@/app/layout/casacade/offset";
import Inline from "@/app/layout/casacade/inline";
import Opacity from "@/app/layout/casacade/opacity";
import Position from "@/app/layout/casacade/position";
import Transform from "@/app/layout/casacade/transform";
import Decoration from "@/app/layout/casacade/decoration";
// widgets
import Button from "@/app/widgets/button";
// icons
import Read from "@/app/icons/read";
import Delete from "@/app/icons/delete";
import Bookmark from "@/app/icons/bookmark";
import Download from "@/app/icons/download";
import Discovery from "@/app/icons/discovery";
// states
import navigator from "@/states/navigator";
// assets
import languages from "@/assets/languages.json";
// modules
import { GalleryTag, GalleryBlock } from "@/modules/hitomi.la/gallery";

enum Asuka {
	TITLE = 0,
	TOOLS = 1
}

enum Ayanami {
	THUMBNAIL_0 = 0,
	THUMBNAIL_1 = 1,
	INFORMATION = 2
}

class GalleryProps extends Props<undefined> {
	public readonly gallery: GalleryBlock;
	public readonly onTagClick?: (callback: string) => void;

	constructor(args: Args<GalleryProps>) {
		super(args);

		this.gallery = args.gallery;
		this.onTagClick = args.onTagClick;
	}
}

class GalleryState {
	public foreground: Asuka;
	public background: Ayanami;

	constructor(args: Args<GalleryState>) {
		this.foreground = args.foreground;
		this.background = args.background;
	}
}

class Gallery extends Stateful<GalleryProps, GalleryState> {
	protected create() {
		return new GalleryState({ foreground: Asuka.TITLE, background: Ayanami.THUMBNAIL_0 });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Container id={"gallery"} decoration={{ shadow: [[Color.DARK_100, 0, 0, 5, 0]], corner: { all: Unit(4.5) }, background: { color: Color.DARK_400 } }}
				onMouseEnter={(I) => {
					I.style({ corner: { all: Unit(14.5) } }, () => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState({ ...this.state, background: Ayanami.THUMBNAIL_1 });
						}
					});
				}}
				onMouseLeave={(I) => {
					I.style(null, () => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState({ ...this.state, background: Ayanami.THUMBNAIL_0 });
						}
					});
				}}>
				<Stack>
					{/* BACKGROUND */}
					<Opacity value={69}>
						{[
							//
							// INDEX: 0
							// WIDGET: THUMBNAIL_0
							//
							<Decoration background={{ image: [0, 1, 2].map((index) => "url(" + this.props.gallery.thumbnail[index] + ")").join(",") }}>
								<section></section>
							</Decoration>,
							//
							// INDEX: 1
							// WIDGET: THUMBNAIL_1
							//
							<Decoration background={{ image: [3, 4, 5].map((index) => "url(" + this.props.gallery.thumbnail[index] + ")").join(",") }}>
								<section></section>
							</Decoration>,
							//
							// INDEX: 2
							// WIDGET: INFORMATION
							//
							<section>
								<Position all={Unit(25)} bottom={Unit(100)}>
									<Decoration shadow={[[Color.DARK_100, 0, 0, 5, 0]]} corner={{ all: Unit(4.5) }} background={{ color: Color.DARK_300 }}>
										<section>
											<Position all={Unit(15)}>
												<Scroll x={"hidden"} y={"auto"}>
													<section>
														{[
															{ key: "No.", value: this.props.gallery.id },
															{ key: "Type:", value: this.props.gallery.type },
															{ key: "Title:", value: this.props.gallery.title },
															{ key: "Language:", value: this.props.gallery.language },
															{ key: "Character:", value: this.props.gallery.character },
															{ key: "Artist:", value: this.props.gallery.artist },
															{ key: "Series:", value: this.props.gallery.series },
															{ key: "Group:", value: this.props.gallery.group },
															{ key: "Tags:", value: this.props.gallery.tags },
															{ key: "Date:", value: this.props.gallery.date }
														].map((fragment, x) => {
															return (
																<Offset key={x} type={"margin"} all={Unit(3.5)}>
																	<section>
																		<Inline type={"flex"}>
																			{/* KEY */}
																			<Text>{[{ value: fragment.key }]}</Text>
																			{/* VALUE */}
																			<Offset type={"margin"} all={Unit(2.5)}>
																				{(fragment.value instanceof Array ? fragment.value.isEmpty() ? ["N/A"] : fragment.value : [fragment.value ?? "N/A"]).map((tag, y) => {
																					return (
																						<Offset key={y} type={"padding"} all={Unit(3.0)} left={Unit(6.5)} right={Unit(6.5)}>
																							<Button size={{ maximum: { width: Unit(69, "%") } }} decoration={{ border: { all: [0.75, "solid", Color.DARK_200] }, corner: { all: Unit(4.5) }, background: { color: Color.DARK_400 } }}
																								onMouseDown={(I) => {
																									switch (fragment.key) {
																										// skip
																										case "Title:":
																										case "Date:": {
																											break;
																										}
																										// modify
																										case "No.": {
																											this.props.onTagClick?.("id:" + tag.toString());
																											break;
																										}
																										case "Tags:": {
																											this.props.onTagClick?.((tag as GalleryTag).toString());
																											break;
																										}
																										case "Language:": {
																											this.props.onTagClick?.("language:" + Object.keys(languages).filter((tongue) => languages[tongue as keyof typeof languages] === tag));
																											break;
																										}
																										default: {
																											this.props.onTagClick?.(fragment.key.replace(/^([A-Za-z]+):$/, ($0, $1) => $1.toLowerCase()) + ":" + tag.toString().replace(/\s/g, "_"));
																											break;
																										}
																									}
																								}}
																								onMouseEnter={(I) => {
																									I.style({ background: { color: Color.DARK_500 } });
																								}}
																								onMouseLeave={(I) => {
																									I.style(null);
																								}}
																								children={<Text>{(tag instanceof GalleryTag ? [{ value: tag.type, color: Color[tag.type.toUpperCase() as keyof typeof Color] }, { value: ":" + tag.value }] : [{ value: tag.toString() }]).map((item) => ({ ...item, size: Unit(13.5) }))}</Text>}
																							/>
																						</Offset>
																					);
																				})}
																			</Offset>
																		</Inline>
																	</section>
																</Offset>
															);
														})}
													</section>
												</Scroll>
											</Position>
										</section>
									</Decoration>
								</Position>
							</section>
						].map((children, x) => {
							return (
								<Transform key={x} translate={[Unit((x - this.state.background) * 100, "%"), Unit(0, "%")]} transition={{ duration: 600 }} children={children}/>
							);
						})}
					</Opacity>
					{/* FOREGROUND */}
					<Position left={Unit(25)} right={Unit(25)} bottom={Unit(25)}>
						<Container id={"foreground"} width={"auto"} height={Unit(50)} decoration={{ shadow: [[Color.DARK_100, 0, 0, 5, 0]], corner: { all: Unit(4.5) }, background: { color: Color.DARK_300 } }}
							onMouseEnter={(I) => {
								this.setState({ ...this.state, foreground: Asuka.TOOLS });
							}}
							onMouseLeave={(I) => {
								this.setState({ ...this.state, foreground: Asuka.TITLE });
							}}>
							<Stack>
								{[
									//
									// INDEX: 0
									// WIDGET: TITLE
									//
									<Text size={{ maximum: { width: Unit(90, "%") } }}>{[{ value: this.props.gallery.title, weight: "bold" }]}</Text>,
									//
									// INDEX: 1
									// WIDGET: TOOLS
									//
									<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
										<Read width={Unit(25)} height={Unit(25)} color={Color.DARK_500}
											onMouseDown={(I) => {
												navigator.open(this.props.gallery.title, "VIEWER", { gallery: this.props.gallery.id });
											}}
											onMouseEnter={(I) => {
												I.style(Color.TEXT_000);
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
										/>
										<Delete width={Unit(25)} height={Unit(25)} color={Color.DARK_400}
											onMouseEnter={(I) => {
												// I.style(Color.TEXT_000);
											}}
											onMouseLeave={(I) => {
												// I.style(null);
											}}
										/>
										<Download width={Unit(25)} height={Unit(25)} color={Color.DARK_400}
											onMouseEnter={(I) => {
												// I.style(Color.TEXT_000);
											}}
											onMouseLeave={(I) => {
												// I.style(null);
											}}
										/>
										<Bookmark width={Unit(25)} height={Unit(25)} color={Color.DARK_400}
											onMouseEnter={(I) => {
												// I.style(Color.TEXT_000);
											}}
											onMouseLeave={(I) => {
												// I.style(null);
											}}
										/>
										<Discovery width={Unit(25)} height={Unit(25)} color={Color.DARK_500}
											onMouseDown={(I) => {
												if (this.state.background !== Ayanami.INFORMATION) {
													I.style(Color.SPOTLIGHT, () => {
														this.setState({ ...this.state, background: Ayanami.INFORMATION });
													});
												} else {
													I.style(Color.TEXT_000, () => {
														this.setState({ ...this.state, background: Ayanami.THUMBNAIL_1 });
													});
												}
											}}
											onMouseEnter={(I) => {
												if (this.state.background !== Ayanami.INFORMATION) {
													I.style(Color.TEXT_000);
												}
											}}
											onMouseLeave={(I) => {
												if (this.state.background !== Ayanami.INFORMATION) {
													I.style(null);
												}
											}}
										/>
									</Offset>
								].map((children, x) => {
									return (
										<Transform key={x} translate={[Unit(0, "%"), Unit((x - this.state.foreground) * 100, "%")]}>
											<Center x={true} y={true} children={children}/>
										</Transform>
									);
								})}
							</Stack>
						</Container>
					</Position>
				</Stack>
			</Container>
		);
	}
}

export default Gallery;
