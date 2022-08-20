import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear, Props } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import { Window } from "@/models/chromium";

import Row from "@/app/layout/row";
import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Element from "@/app/layout/element";
import Container from "@/app/layout/container";

import Spacer from "@/app/layout/casacade/spacer";

import Button from "@/app/widgets/button";
import Viewport from "@/app/widgets/view";

import Plus from "@/app/icons/plus";
import Close from "@/app/icons/close";
import Maximize from "@/app/icons/maximize";
import Minimize from "@/app/icons/minimize";
import Unmaximize from "@/app/icons/unmaximize";

import history from "@/handles/history";
import contextmenu from "@/handles/contextmenu";

interface AppProps extends Clear<undefined> {
	// TODO: none
}

interface AppState {
	maximize: boolean;
	fullscreen: boolean;
	contextmenu: boolean;
}

class App extends Stateful<AppProps, AppState> {
	protected create() {
		return ({ maximize: false, fullscreen: false, contextmenu: false });
	}
	protected events(): LifeCycle<AppProps, AppState> {
		return {
			DID_MOUNT: () => {
				chromium.handle(Window.Event.BLUR, () => this.setState((state) => ({ contextmenu: false })));
				chromium.handle(Window.Event.MAXIMIZE, () => this.setState((state) => ({ maximize: true })));
				chromium.handle(Window.Event.UNMAXIMIZE, () => this.setState((state) => ({ maximize: false })));
				chromium.handle(Window.Event.CONTEXTMENU, (event) => {
					// custom system contextmenu
					contextmenu.state = {
						// @ts-ignore
						x: event.detail[0].x,
						// @ts-ignore
						y: event.detail[0].y,
						items: [
							{
								role: "New Tab",
								toggle: true,
								method: () => {
									history.open("NEW TAB", "BROWSER", {});
								}
							},
							"seperator",
							{
								role: "Close All Tabs",
								toggle: true,
								method: () => {
									history.reset();
								}
							},
						]
					};
				});
				chromium.handle(Window.Event.ENTER_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: true })));
				chromium.handle(Window.Event.LEAVE_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: false })));

				contextmenu.handle((state) => {
					// update
					this.setState((state) => ({ contextmenu: true }), () => {
						// cache
						const element = document.querySelector("#contextmenu") as HTMLElement;
						// adjust
						element.style.setProperty("transform", `translate(${[state.detail.after.x + element.getBoundingClientRect().width >= window.innerWidth, state.detail.after.y + element.getBoundingClientRect().height >= window.innerHeight].map((toggle) => (toggle ? -100 : 0) + "%").join(comma)})`);
					});
				});

				window.addEventListener("wheel", (event) => this.setState((state) => ({ contextmenu: false })));
				window.addEventListener("mousedown", (event) => this.setState((state) => ({ contextmenu: false })));
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
			<Column id="root">
				{/* TITLEBAR */}
				<Row id="titlebar" color={Color.DARK_000} height={40} draggable={true} visible={!this.state.fullscreen}>
					<Spacer>
						<Controller width={Unit(100, "%")}></Controller>
					</Spacer>
					<Element width={69}>
						{/* GAP */}
					</Element>
					<Button id="minimize" width={50} draggable={false}
						onMouseDown={(style) => {
							chromium.minimize();
						}}
						onMouseEnter={(style) => {
							style({ color: Color.DARK_100 });
						}}
						onMouseLeave={(style) => {
							style(null);
						}}
						children={<Minimize/>}
					/>
					<Button id="maximize" width={50} draggable={false}
						onMouseDown={(style) => {
							if (this.state.maximize) {
								chromium.unmaximize();
							} else {
								chromium.maximize();
							}
						}}
						onMouseEnter={(style) => {
							style({ color: Color.DARK_100 });
						}}
						onMouseLeave={(style) => {
							style(null);
						}}
						children={this.state.maximize ? <Unmaximize/> : <Maximize/>}
					/>
					<Button id="close" width={50} draggable={false}
						onMouseDown={(style) => {
							chromium.close("titlebar");
						}}
						onMouseEnter={(style) => {
							style({ color: Color.RGBA_100 });
						}}
						onMouseLeave={(style) => {
							style(null);
						}}
						children={<Close/>}
					/>
				</Row>
				{/* OVERLAY */}
				{/* <Element id="overlay" color="#00000090" all="auto" width={Unit(100, "%")} height={Unit(100, "%")} priority={true} draggable={true}>
					{}
				</Element> */}
				{/* CONTENT */}
				<section id="content" style={{ width: Unit(100, "%"), height: Unit(100, "%"), background: Color.DARK_200 }}>
					<Viewport></Viewport>
				</section>
				{/* CONTEXTMENU */}
				<Element id="contextmenu" color={Color.DARK_300} top={contextmenu.state.y} left={contextmenu.state.x} padding={{ top: 5, bottom: 5 }} corner={{ all: 4.5 }} border={{ all: { width: 1.0, style: "solid", color: Color.DARK_500 } }} shadow={[{ x: 0, y: 0, blur: 2.5, spread: 0, color: Color.DARK_100 }]} visible={this.state.contextmenu}>
					{contextmenu.state.items.map((element, index) => {
						// seperator
						if (element === "seperator") return (<section key={index} style={{ width: "auto", height: 1.0, marginTop: 5, marginBottom: 5, background: Color.DARK_500 }}/>);

						return (
							<Container key={index} height={35} padding={{ left: 10, right: 25 }} priority={true}
								onMouseDown={(style) => {
									if (!element.toggle) return;
									// update
									this.setState((state) => ({ contextmenu: false }), () => element.method());
								}}
								onMouseEnter={(style) => {
									style({ color: Color.DARK_400 });
								}}
								onMouseLeave={(style) => {
									style(null);
								}}>
								<Center x={false} y={true}>
									<Text children={[{ text: element.role, color: element.toggle ? "inherit" : Color.DARK_500 }]}/>
								</Center>
							</Container>
						);
					})}
				</Element>
			</Column>
		);
	}
}

class Handle {
	public index: number;
	public offset: number;
	public readonly element: HTMLElement;
	public readonly minimum: number;
	public readonly maximum: number;

	constructor(args: {
		index: number;
		offset: number;
		element: HTMLElement;
	}) {
		this.index = args.index;
		this.offset = args.offset;
		this.element = args.element;
		this.minimum = this.width * (args.index * -1);
		this.maximum = this.width * (history.state.pages.length - args.index - 1);
	}
	public get top() {
		return this.element.getBoundingClientRect().top;
	}
	public get left() {
		return this.element.getBoundingClientRect().left;
	}
	public get right() {
		return this.element.getBoundingClientRect().right;
	}
	public get bottom() {
		return this.element.getBoundingClientRect().bottom;
	}
	public get width() {
		return this.element.getBoundingClientRect().width;
	}
	public get height() {
		return this.element.getBoundingClientRect().height;
	}
}

interface ControllerProps extends Props<undefined> {
	// TODO: none
}

interface ControllerState {
	index: number;
	handle: Nullable<Handle>;
}

class Controller extends Stateful<ControllerProps, ControllerState> {
	protected create() {
		return ({ index: history.state.index, handle: null });
	}
	protected events(): LifeCycle<ControllerProps, ControllerState> {
		return {
			DID_MOUNT: () => {
				history.handle((event) => {
					// reset
					this.setState((state) => ({ index: event.detail.after.index, handle: null }));
				});
				// cache
				const element = this.node();

				if (!element) throw Error();

				window.addEventListener("mouseup", (event) => {
					if (this.state.handle) {
						// undo
						for (let index = 0; index < history.state.pages.length; index++) {
							// cache
							const children = element.children.item(index) as HTMLElement;
							// style
							children.style.setProperty("left", "unset");
							children.style.setProperty("z-index", "unset");
							children.style.setProperty("transform", "unset");
						}
						if (history.state.index !== this.state.handle.index) {
							// update
							history.reorder(this.state.handle.index);
						} else {
							// reset
							this.setState((state) => ({ handle: null }));
						}
					}
				});
				window.addEventListener("mousedown", (event) => {
					if (!this.state.handle && (event.target as HTMLElement).id === "handle") {
						// cache
						const children = event.target as HTMLElement;
						// style
						children.style.setProperty("left", "unset");
						children.style.setProperty("z-index", "6974");
						children.style.setProperty("transform", "unset");

						this.state.handle = new Handle({ index: this.state.index, offset: 0, element: children });
					}
				});
				window.addEventListener("mousemove", (event) => {
					if (this.state.handle) {
						// extra space
						const margin = 0;

						// x-axis check
						if (event.clientX < this.state.handle.left - margin) return;
						if (event.clientX > this.state.handle.right + margin) return;
						// y-axis check
						// if (event.clientY < this.state.handle.top - margin) return;
						// if (event.clientY > this.state.handle.bottom + margin) return;

						const destination = Math.floor((this.state.handle.left / this.state.handle.width) + 0.5);

						if (this.state.handle.index !== destination && destination >= 0 && destination < history.state.pages.length) {
							// move left
							if (event.movementX < 0) {
								if (this.state.index < this.state.handle.index && this.state.handle.index > destination) {
									(element.children.item(destination + 1) as HTMLElement).style.setProperty("transform", "unset");
								} else {
									(element.children.item(destination) as HTMLElement).style.setProperty("transform", "translateX(100%)");
								}
							}
							// move right
							if (event.movementX > 0) {
								if (this.state.index > this.state.handle.index && this.state.handle.index < destination) {
									(element.children.item(destination - 1) as HTMLElement).style.setProperty("transform", "unset");
								} else {
									(element.children.item(destination) as HTMLElement).style.setProperty("transform", "translateX(-100%)");
								}
							}
							// update
							this.state.handle.index = destination;
						}
						// update
						this.state.handle.offset = (this.state.handle.offset + event.movementX).clamp(this.state.handle.minimum, this.state.handle.maximum);
						// style
						this.state.handle.element.style.setProperty("left", this.state.handle.offset + "px");
					}
				});
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
			<Row id="controller">
				<>
					{history.state.pages.map((page, index) => {
						return (
							<Spacer key={index}>
								<Container id="handle" color={this.state.index === index ? Color.DARK_200 : Color.DARK_000} minimum={{ width: 29.5 }} maximum={{ width: 250 }} border={{ top: { width: 2.5, style: "solid", color: this.state.index === index ? Color.RGBA_000 : "transparent" }, bottom: { width: 2.5 } }} draggable={false}
									onMouseDown={(style) => {
										if (history.state.index !== index) {
											style(null, () => history.jump(index));
										}
									}}
									onMouseEnter={(style) => {
										if (history.state.index !== index) {
											style({ color: Color.DARK_100, border: { top: { width: 2.5, style: "solid", color: Color.DARK_200 } } });
										}
									}}
									onMouseLeave={(style) => {
										style(null);
									}}>
									{/* TITLE */}
									<Text all={7.5} left={10} right={29.5} children={[{ text: page.title, color: this.state.index === index ? undefined : Color.DARK_500, weight: "bold", style: history.state.pages[index].element.type.name === "Browser" ? "normal" : "italic" }]}/>
									{/* CLOSE */}
									<Button all={7.5} left="auto" right={5.0} width={19.5} height={19.5} corner={{ all: 2.5 }}
										onMouseDown={(style) => {
											history.close(index);
										}}
										onMouseEnter={(style) => {
											style({ color: Color.RGBA_100 });
										}}
										onMouseLeave={(style) => {
											style(null);
										}}
										children={<Close color={this.state.index === index ? undefined : Color.DARK_500}/>}
									/>
								</Container>
							</Spacer>
						);
					})}
				</>
				<Button id="open" color={Color.DARK_200} width={26.5} height={26.5} margin={{ all: 20 - 13.25 }} corner={{ all: 2.5 }} draggable={false}
					onMouseDown={(style) => {
						history.open("NEW TAB", "BROWSER", {});
					}}
					onMouseEnter={(style) => {
						style({ color: Color.DARK_400 });
					}}
					onMouseLeave={(style) => {
						style(null);
					}}
					children={<Plus/>}
				/>
			</Row>
		);
	}
}

export default App;
