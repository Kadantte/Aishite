import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Tag from "@/models/tag";

import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Element from "@/app/layout/element";
import Container from "@/app/layout/container";

import Stack from "@/app/layout/casacade/stack";
import Scroll from "@/app/layout/casacade/scroll";
import Inline from "@/app/layout/casacade/inline";
import Transform from "@/app/layout/casacade/transform";

import Button from "@/app/widgets/button";

import Read from "@/app/icons/read";
import Delete from "@/app/icons/delete";
import Bookmark from "@/app/icons/bookmark";
import Download from "@/app/icons/download";
import Discovery from "@/app/icons/discovery";

import navigator from "@/manager/navigator";

import languages from "@/assets/languages.json";

import gallery from "@/apis/hitomi.la/gallery";

type _Gallery = Await<ReturnType<typeof gallery["get"]>>;

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
	// events
	public readonly onClick?: (callback: string) => void;

	constructor(args: Args<GalleryProps>) {
		super(args);

		this.gallery = args.gallery;
		// events
		this.onClick = args.onClick;
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
			<Container id={"gallery"} color={Color.DARK_400} border={{ all: { width: 7.5, style: "solid", color: Color.DARK_300 } }} corner={{ all: 4.5 }} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]}
				onMouseEnter={(I) => {
					I.style({ corner: { all: 14.5 } }, () => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState((state) => ({ background: Ayanami.THUMBNAIL_1 }));
						}
					});
				}}
				onMouseLeave={(I) => {
					I.style(null, () => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState((state) => ({ background: Ayanami.THUMBNAIL_0 }));
						}
					});
				}}>
				<Stack>
					{[
						<Element id="thumbnail_1" image={this.props.gallery.thumbnail.skip(0).take(3).map((url) => `url(${url})`).join(comma)} opacity={69}></Element>,
						<Element id="thumbnail_2" image={this.props.gallery.thumbnail.skip(3).take(3).map((url) => `url(${url})`).join(comma)} opacity={69}></Element>,
						<section id="information">
							<Element color={Color.DARK_300} all={25} bottom={100} corner={{ all: 4.5 }} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]}>
								<Scroll x="hidden" y="auto" scrollbar="elegant">
									<Element all={15}>
										{[
											{ key: "id", value: this.props.gallery.id },
											{ key: "type", value: this.props.gallery.type },
											{ key: "title", value: this.props.gallery.title },
											{ key: "language", value: this.props.gallery.language },
											{ key: "characters", value: this.props.gallery.characters },
											{ key: "artist", value: this.props.gallery.artist },
											{ key: "series", value: this.props.gallery.series },
											{ key: "group", value: this.props.gallery.group },
											{ key: "tags", value: this.props.gallery.tags },
											{ key: "date", value: this.props.gallery.date }
										].map((section, index) => {
											return (
												<Element padding={{ all: 3.75, left: 0, right: 14.5 }}>
													{/* KEY */}
													<Inline flex={true}>
														<Text children={[{ text: section.key == "id" ? "No." : section.key.replace(/^([\D])([\D]+)$/, ($0, $1, $2) => `${$1.toUpperCase()}${$2.toLowerCase()}:`) }]}/>
													</Inline>
													{/* VALUE */}
													<Inline flex={true}>
														{[section.value instanceof Array && section.value.isEmpty() ? ["N/A"] : section.value ?? "N/A"].flat().map((chip, _index) => {
															return (
																<Button key={_index} color={Color.DARK_400} maximum={{ width: Unit(69, "%") }} border={{ all: { width: 0.75, style: "solid", color: Color.DARK_200 } }} corner={{ all: 3.0 }} margin={{ all: 4.0 }} padding={{ all: 3.0, left: 5.5, right: 5.5 }}
																	onMouseDown={(I) => {
																		// skip
																		if (chip === "N/A" || section.key === "title" || section.key === "date") return;

																		switch (section.key) {
																			case "language": {
																				this.props.onClick?.(`language:${Object.keys(languages).filter((tongue) => languages[tongue as keyof typeof languages] === chip)}`);
																				break;
																			}
																			case "tags": {
																				this.props.onClick?.(chip.toString());
																				break;
																			}
																			default: {
																				this.props.onClick?.(`${section.key}:${chip === "artist\u0020CG" ? "artistcg" : chip.toString().replace(/\s/g, "_")}`);
																				break;
																			}
																		}
																	}}
																	onMouseEnter={(I) => {
																		I.style({ color: Color.DARK_500 });
																	}}
																	onMouseLeave={(I) => {
																		I.style(null);
																	}}
																	children={<Text length={Unit(100, "%")}>{(chip instanceof Tag ? [{ text: chip.namespace, color: chip.namespace === "male" ? "cyan" : chip.namespace === "female" ? "pink" : "white" }, { text: ":" }, { text: chip.value }] : [{ text: chip.toString() }]).map((item) => ({ ...item, size: 13.5 }))}</Text>}
																/>
															);
														})}
													</Inline>
												</Element>
											);
										})}
									</Element>
								</Scroll>
							</Element>
						</section>
					].map((children, index) => {
						return (
							<Transform key={index} translate={[(index - this.state.background) * 100, 0]} transition={{ duration: 600 }} children={children}/>
						);
					})}
				</Stack>
				<Container color={Color.DARK_300} width={"auto"} height={50} left={25} right={25} bottom={25} corner={{ all: 4.5 }} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]}
					onMouseEnter={(I) => {
						this.setState((state) => ({ foreground: Asuka.TOOLS }));
					}}
					onMouseLeave={(I) => {
						this.setState((state) => ({ foreground: Asuka.TITLE }));
					}}>
					<Stack>
						{[
							<Text length={Unit(90, "%")} children={[{ text: this.props.gallery.title }]}/>,
							<>
								<Read color={Color.DARK_500} width={Unit(25)} height={Unit(25)} margin={{ left: 10, right: 10 }}
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
								<Delete color={Color.DARK_400} width={Unit(25)} height={Unit(25)} margin={{ left: 10, right: 10 }}
									onMouseEnter={(I) => {
										// I.style(Color.TEXT_000);
									}}
									onMouseLeave={(I) => {
										// I.style(null);
									}}
								/>
								<Download color={Color.DARK_400} width={Unit(25)} height={Unit(25)} margin={{ left: 10, right: 10 }}
									onMouseEnter={(I) => {
										// I.style(Color.TEXT_000);
									}}
									onMouseLeave={(I) => {
										// I.style(null);
									}}
								/>
								<Bookmark color={Color.DARK_400} width={Unit(25)} height={Unit(25)} margin={{ left: 10, right: 10 }}
									onMouseEnter={(I) => {
										// I.style(Color.TEXT_000);
									}}
									onMouseLeave={(I) => {
										// I.style(null);
									}}
								/>
								<Discovery color={Color.DARK_500} width={Unit(25)} height={Unit(25)} margin={{ left: 10, right: 10 }}
									onMouseDown={(I) => {
										if (this.state.background !== Ayanami.INFORMATION) {
											I.style(Color.RGBA_000, () => {
												this.setState((state) => ({ background: Ayanami.INFORMATION }));
											});
										} else {
											I.style(Color.TEXT_000, () => {
												this.setState((state) => ({ background: Ayanami.THUMBNAIL_1 }));
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
							</>
						].map((children, index) => {
							return (
								<Transform key={index} translate={[0, (index - this.state.foreground) * 100]}>
									<Center x={true} y={true} children={children}/>
								</Transform>
							);
						})}
					</Stack>
				</Container>
			</Container >
		);
	}
}

export default Gallery;
