import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Tag from "@/models/tag";

import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Container from "@/app/layout/container";

import Stack from "@/app/layout/casacade/stack";
import Scroll from "@/app/layout/casacade/scroll";
import Offset from "@/app/layout/casacade/offset";
import Inline from "@/app/layout/casacade/inline";
import Opacity from "@/app/layout/casacade/opacity";
import Position from "@/app/layout/casacade/position";
import Transform from "@/app/layout/casacade/transform";
import Decoration from "@/app/layout/casacade/decoration";

import Button from "@/app/widgets/button";

import Read from "@/app/icons/read";
import Delete from "@/app/icons/delete";
import Bookmark from "@/app/icons/bookmark";
import Download from "@/app/icons/download";
import Discovery from "@/app/icons/discovery";

import navigator from "@/manager/navigator";

import languages from "@/assets/languages.json";

import { GalleryInfo } from "@/apis/hitomi.la/gallery";

type _Gallery = Await<ReturnType<typeof GalleryInfo>>;

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
	public readonly gallery: _Gallery;
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
							<Decoration background={{ image: this.props.gallery.thumbnail.skip(0).take(3).map((url) => `url(${url})`).join(",") }}>
								<section></section>
							</Decoration>,
							//
							// INDEX: 1
							// WIDGET: THUMBNAIL_1
							//
							<Decoration background={{ image: this.props.gallery.thumbnail.skip(3).take(3).map((url) => `url(${url})`).join(",") }}>
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
													<section data-scrollable={"elegant"}>
														{[
															{ key: "No.", value: this.props.gallery.id },
															{ key: "Type:", value: this.props.gallery.type },
															{ key: "Title:", value: this.props.gallery.title },
															{ key: "Language:", value: this.props.gallery.language },
															{ key: "Characters:", value: this.props.gallery.characters },
															{ key: "Artists:", value: this.props.gallery.artists },
															{ key: "Series:", value: this.props.gallery.series },
															{ key: "Group:", value: this.props.gallery.group },
															{ key: "Tags:", value: this.props.gallery.tags },
															{ key: "Date:", value: this.props.gallery.date }
														].map((info, index) => {
															return (
																<Offset key={index} type={"margin"} all={Unit(3.5)}>
																	<section>
																		<Inline type={"flex"}>
																			{/* KEY */}
																			<Text>{[{ value: info.key }]}</Text>
																			{/* VALUE */}
																			<Offset type={"margin"} all={Unit(2.5)}>
																				{[info.value instanceof Array && info.value.isEmpty() ? ["N/A"] : info.value ?? "N/A"].flat().map((chip, _index) => {
																					return (
																						<Offset key={_index} type={"padding"} all={Unit(3.0)} left={Unit(6.5)} right={Unit(6.5)}>
																							<Button size={{ maximum: { width: Unit(69, "%") } }} decoration={{ border: { all: [0.75, "solid", Color.DARK_200] }, corner: { all: Unit(4.5) }, background: { color: Color.DARK_400 } }}
																								onMouseDown={(I) => {
																									if (chip !== "N/A") {
																										switch (info.key) {
																											// skip
																											case "Title:":
																											case "Date:": {
																												break;
																											}
																											// modify
																											case "No.": {
																												this.props.onTagClick?.(`id:${chip}`);
																												break;
																											}
																											case "Type:": {
																												this.props.onTagClick?.(`type:${chip === "artist\u0020CG" ? "artistcg" : chip}`);
																												break;
																											}
																											case "Language:": {
																												this.props.onTagClick?.(`language:${Object.keys(languages).filter((tongue) => languages[tongue as keyof typeof languages] === chip)}`);
																												break;
																											}
																											case "Tags:": {
																												this.props.onTagClick?.(chip.toString());
																												break;
																											}
																											default: {
																												this.props.onTagClick?.(info.key.replace(/^([A-Za-z]+):$/, ($0, $1) => $1.toLowerCase()) + ":" + chip.toString().replace(/\s/g, "_"));
																												break;
																											}
																										}
																									}

																								}}
																								onMouseEnter={(I) => {
																									I.style({ background: { color: Color.DARK_500 } });
																								}}
																								onMouseLeave={(I) => {
																									I.style(null);
																								}}
																								children={<Text>{(chip instanceof Tag ? [{ value: chip.namespace, color: Color[chip.namespace.toUpperCase() as keyof typeof Color] }, { value: ":" }, { value: chip.value }] : [{ value: chip.toString() }]).map((item) => ({ ...item, size: Unit(13.5) }))}</Text>}
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
						].map((children, index) => {
							return (
								<Transform key={index} translate={[Unit((index - this.state.background) * 100, "%"), Unit(0, "%")]} transition={{ duration: 600 }} children={children}/>
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
								].map((children, index) => {
									return (
										<Transform key={index} translate={[Unit(0, "%"), Unit((index - this.state.foreground) * 100, "%")]}>
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
