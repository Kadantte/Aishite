import Color from "app/common/color";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import { Tag } from "models/tag";

import Text from "app/layout/text";
import Center from "app/layout/center";
import Element from "app/layout/element";
import Container from "app/layout/container";

import Stack from "app/layout/casacade/stack";
import Scroll from "app/layout/casacade/scroll";
import Inline from "app/layout/casacade/inline";
import Transform from "app/layout/casacade/transform";

import Button from "app/widgets/button";

import Read from "app/icons/read";
import Delete from "app/icons/delete";
import Bookmark from "app/icons/bookmark";
import Download from "app/icons/download";
import Discovery from "app/icons/info";

import structure from "handles/index";

import languages from "assets/languages.json";

import { gallery } from "apis/hitomi.la/gallery";

const cache = new Map<number, number>();

enum Lelouch {
	TITLE,
	TOOLS
}

enum Lamperouge {
	THUMBNAIL_0,
	THUMBNAIL_1,
	INFORMATION
}

interface GalleryProps extends Props.Clear<undefined>, Props.Style {
	// required
	readonly gallery: number;
	// events
	readonly onClick?: (callback: string) => void;
}

interface GalleryState {
	init: boolean;
	offset: number;
	gallery: Discard<Await<ReturnType<typeof gallery>>>;
	foreground: Lelouch;
	background: Lamperouge;
}

class Gallery extends Stateful<GalleryProps, GalleryState> {
	protected create() {
		return {
			init: false,
			offset: NaN,
			gallery: undefined,
			foreground: Lelouch.TITLE,
			background: Lamperouge.THUMBNAIL_0
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				// cache
				const element = this.node(); const rect = element.getBoundingClientRect();

				const observer: IntersectionObserver = new IntersectionObserver((entries) => {
					for (const entry of entries) {
						// skip
						if (!entry.isIntersecting) break;

						this.setState((state) => ({ init: true }), () => {
							// fetch
							gallery(this.props.gallery).then((_gallery) => {
								// callback hell...
								this.setState((state) => ({ gallery: _gallery }), () => {
									// please end this nest
									if (structure("ctm").state.id === this.props.gallery.toString()) {
										// refresh ctm
										this.contextmenu(structure("ctm").state.x, structure("ctm").state.y);
									}
								});
							});
						});
						// stop
						observer.disconnect();
					}
				});
				// start
				observer.observe(element);

				const height = rect.height - 160.0;

				if (!cache.has(height)) {
					// cache
					let count = 0;
					// max-height
					while (height / count >= 60.0) {
						count++;
					}
					// update
					cache.set(rect.height, ((height / count) - 35.0) * 0.5);
				}
				// update
				this.setState((state) => ({ offset: cache.get(rect.height)! }));
			}
		};
	}
	protected build() {
		return (
			<section id="wrapper"
				onContextMenu={(event) => {
					this.contextmenu(event.pageX, event.pageY);
				}}>
				{this.state.init ? this.build_1() : this.build_0()}
			</section>
		);
	}
	protected build_0() {
		return (
			<Container {...this.props} id={this.props.id ?? "gallery"} decoration={{ color: Color.pick(2.5), border: { all: { width: 1.5, style: "solid", color: Color.pick(3.0) } }, corner: { all: 10.0 } }}></Container>
		);
	}
	protected build_1() {
		if (!this.state.gallery) return this.build_0();

		return (
			<Container {...this.props} id={this.props.id ?? "gallery"} decoration={{ color: Color.pick(2.5), border: { all: { width: 1.5, style: "solid", color: Color.pick(3.0) } }, corner: { all: 10.0 } }}
				onMouseEnter={(setStyle) => {
					if (this.state.background === Lamperouge.INFORMATION) return;

					setStyle({ decoration: { color: Color.pick(3.0), border: { all: { width: 1.5, style: "solid", color: Color.pick(5.0) } }, corner: { all: 15.0 }, shadow: [{ x: 0.0, y: 0.0, blur: 5.0, spread: 0.0, color: Color.pick(1.0) }] } });

					this.setState((state) => ({ background: Lamperouge.THUMBNAIL_1 }));
				}}
				onMouseLeave={(setStyle) => {
					if (this.state.background === Lamperouge.INFORMATION) return;

					setStyle(undefined);

					this.setState((state) => ({ background: Lamperouge.THUMBNAIL_0 }));
				}}>
				<Stack>
					{[
						(<Element id="thumbnail_0" decoration={{ image: "url(" + this.state.gallery.thumbnail[0] + ")" }}></Element>),
						(<Element id="thumbnail_1" decoration={{ image: "url(" + this.state.gallery.thumbnail[1] + ")" }}></Element>),
						(<Element id="information">
							<Element position={{ all: 25.0, bottom: 100.0 }} decoration={{ color: Color.pick(2.0), corner: { all: 5.0 }, border: { all: { width: 1.5, style: "solid", color: Color.pick(5.0) } } }}>
								<Scroll x="hidden" y="auto" scrollbar="smooth">
									<Element position={{ all: 15.0 }}>
										{isNaN(this.state.offset) ? undefined : [
											{ key: "id", value: this.state.gallery.id },
											{ key: "type", value: this.state.gallery.type },
											{ key: "title", value: this.state.gallery.title },
											{ key: "language", value: this.state.gallery.language },
											{ key: "characters", value: this.state.gallery.characters },
											{ key: "artists", value: this.state.gallery.artists },
											{ key: "parody", value: this.state.gallery.parody },
											{ key: "group", value: this.state.gallery.group },
											{ key: "tags", value: this.state.gallery.tags },
											{ key: "date", value: this.state.gallery.date }
										].map((section, index) => {
											return (
												<Element key={index} offset={{ padding: { all: this.state.offset, left: 0.0, right: 15.0 } }}>
													{/* KEY */}
													<Inline flex={true}>
														<Text>{[{ value: section.key == "id" ? "No." : section.key.replace(/^([\D])([\D]+)$/, ($0, $1, $2) => $1.toUpperCase() + $2.toLowerCase() + ":") }]}</Text>
													</Inline>
													{/* VALUE */}
													<Inline flex={true}>
														{[section.value instanceof Array && section.value.isEmpty ? ["N/A"] : section.value ?? "N/A"].flat().map((chip, index) => {
															// cache
															const enable = chip !== "N/A" && section.key !== "title" && section.key !== "date";

															return (
																<Button key={index} offset={{ margin: { all: 3.0 }, padding: { all: 2.5, left: 5.0, right: 5.0 } }} constraint={{ maximum: { width: 69.0 + "%" } }} decoration={{ color: Color.pick(3.0), border: { all: { width: 1.5, style: "solid", color: Color.pick(1.5) } }, corner: { all: 2.5 } }}
																	onMouseDown={(setStyle) => {
																		// skip
																		if (!enable) return;

																		let callback: Tag;

																		switch (section.key) {
																			case "id": {
																				callback = new Tag({ namespace: section.key, value: Number(chip) });
																				break;
																			}
																			case "type": {
																				callback = new Tag({ namespace: "type", value: chip.toString().replace(/\s/g, "") });
																				break;
																			}
																			case "language": {
																				callback = new Tag({ namespace: "language", value: Object.keys(languages).filter((tongue) => languages[tongue as keyof typeof languages] === chip)[0] });
																				break;
																			}
																			case "characters": {
																				callback = new Tag({ namespace: "character", value: chip.toString() });
																				break;
																			}
																			case "artists": {
																				callback = new Tag({ namespace: "artist", value: chip.toString() });
																				break;
																			}
																			case "parody": {
																				callback = new Tag({ namespace: "series", value: chip.toString() });
																				break;
																			}
																			case "tags": {
																				callback = chip as Tag;
																				break;
																			}
																			default: {
																				callback = new Tag({ namespace: section.key, value: chip.toString() });
																				break;
																			}
																		}
																		this.props.onClick?.(callback.toString());
																	}}
																	onMouseEnter={(setStyle) => {
																		// skip
																		if (!enable) return;

																		setStyle({ decoration: { color: Color.pick(4.5) } });
																	}}
																	onMouseLeave={(setStyle) => {
																		// skip
																		if (!enable) return;

																		setStyle(undefined);
																	}}
																	children={<Text length={100.0 + "%"}>{(chip instanceof Tag ? [{ value: chip.namespace, size: 13.5, color: chip.namespace === "male" ? "cyan" : chip.namespace === "female" ? "pink" : "white" }, { value: ":", size: 13.5 }, { value: chip.value, size: 13.5 }] : [{ value: chip.toString(), size: 13.5, color: enable ? undefined : Color.pick(5.0) }])}</Text>}
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
						</Element>)
					].map((children, index) => {
						return (<Transform key={index} translate={[(index - this.state.background) * 100.0, 0.0]} transition={{ duration: 750 }}>{children}</Transform>);
					})}
				</Stack>
				<Container position={{ left: 25.0, right: 25.0, bottom: 25.0 }} constraint={{ width: "auto", height: 50.0 }} decoration={{ color: Color.pick(3.0), corner: { all: 5.0 }, border: { all: { width: 1.5, style: "solid", color: Color.pick(5.0) } } }}
					onMouseEnter={(setStyle) => {
						if (this.state.background === Lamperouge.INFORMATION) return;

						this.setState((state) => ({ foreground: Lelouch.TOOLS }));
					}}
					onMouseLeave={(setStyle) => {
						if (this.state.background === Lamperouge.INFORMATION) return;

						this.setState((state) => ({ foreground: Lelouch.TITLE }));
					}}>
					<Stack>
						{[
							(<Text id="title" length={90.0 + "%"}>{[{ value: this.state.gallery.title, weight: "bold" }]}</Text>),
							(<>
								<Read color={Color.pick(5.0)} offset={{ margin: { left: 10.0, right: 10.0 } }} constraint={{ width: 25.0, height: 25.0 }}
									onMouseDown={(setColor) => {
										structure("tabs").open(this.state.gallery!.title, "VIEWER", { gallery: this.state.gallery!.id });
									}}
									onMouseEnter={(setColor) => {
										setColor("#AAAAAA");
									}}
									onMouseLeave={(setColor) => {
										setColor(undefined);
									}}
								/>
								<Delete color={Color.pick(3.5)} offset={{ margin: { left: 10.0, right: 10.0 } }} constraint={{ width: 25.0, height: 25.0 }}
									onMouseEnter={(setColor) => {
										// setColor("#AAAAAA");
									}}
									onMouseLeave={(setColor) => {
										// setColor(undefined);
									}}
								/>
								<Download color={Color.pick(3.5)} offset={{ margin: { left: 10.0, right: 10.0 } }} constraint={{ width: 25.0, height: 25.0 }}
									onMouseEnter={(setColor) => {
										// setColor("#AAAAAA");
									}}
									onMouseLeave={(setColor) => {
										// setColor(undefined);
									}}
								/>
								<Bookmark color={Color.pick(3.5)} offset={{ margin: { left: 10.0, right: 10.0 } }} constraint={{ width: 25.0, height: 25.0 }}
									onMouseEnter={(setColor) => {
										// setColor("#AAAAAA");
									}}
									onMouseLeave={(setColor) => {
										// setColor(undefined);
									}}
								/>
								<Discovery color={Color.pick(5.0)} offset={{ margin: { left: 10.0, right: 10.0 } }} constraint={{ width: 25.0, height: 25.0 }}
									onMouseDown={(setColor) => {
										if (this.state.background === Lamperouge.INFORMATION) {
											setColor("#AAAAAA", () => this.setState((state) => ({ background: Lamperouge.THUMBNAIL_1 })));
										}
										else {
											setColor("aquamarine", () => this.setState((state) => ({ background: Lamperouge.INFORMATION })));
										}
									}}
									onMouseEnter={(setColor) => {
										if (this.state.background === Lamperouge.INFORMATION) return;

										setColor("#AAAAAA");
									}}
									onMouseLeave={(setColor) => {
										if (this.state.background === Lamperouge.INFORMATION) return;

										setColor(undefined);
									}}
								/>
							</>)
						].map((children, index) => {
							return (<Transform key={index} translate={[0.0, (index - this.state.foreground) * 100.0]}><Center x={true} y={true}>{children}</Center></Transform>);
						})}
					</Stack>
				</Container>
			</Container>
		);
	}
	protected contextmenu(x: number, y: number) {
		structure("ctm").state = {
			id: this.props.gallery.toString(),
			x: x,
			y: y,
			items: [
				{
					role: "Copy URL",
					toggle: this.state.gallery !== undefined,
					method: () => {
						navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([this.state.gallery!.URL()], { type: "text/plain" }) })]);
					}
				},
				"seperator",
				{
					role: "Download",
					toggle: false,
					method: () => {
						throw new Error("Unimplemented");
					}
				},
				{
					role: "Bookmark",
					toggle: false,
					method: () => {
						throw new Error("Unimplemented");
					}
				},
				"seperator",
				{
					role: "Open in Viewer",
					toggle: this.state.gallery !== undefined,
					method: () => {
						structure("tabs").open(this.state.gallery!.title, "viewer", { gallery: this.state.gallery!.id });
					}
				},
				{
					role: "Open in External Browser",
					toggle: this.state.gallery !== undefined,
					method: () => {
						chromium.open_url(this.state.gallery!.URL());
					}
				}]
		};
	}
}

export default Gallery;
