import Color from "app/common/color";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import { Window } from "models/chromium";

import Row from "app/layout/row";
import Text from "app/layout/text";
import Center from "app/layout/center";
import Column from "app/layout/column";
import Element from "app/layout/element";
import Container from "app/layout/container";

import Spacer from "app/layout/casacade/spacer";

import Button from "app/widgets/button";
import Display from "app/widgets/display";

import Plus from "app/icons/plus";
import Close from "app/icons/close";
import Maximize from "app/icons/maximize";
import Minimize from "app/icons/minimize";
import Unmaximize from "app/icons/unmaximize";

import structure from "handles/index";

interface AppProps extends Props.Clear<undefined> {
	// TODO: none
}

interface AppState {
	maximize: boolean;
	fullscreen: boolean;
	contextmenu: boolean;
}

class App extends Stateful<AppProps, AppState> {
	protected create() {
		return {
			maximize: false,
			fullscreen: false,
			contextmenu: false
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				// cache
				const contextmenu = document.getElementById("contextmenu") as HTMLElement;

				structure("ctm").handle((state) => {
					this.setState((state) => ({ contextmenu: true }), () => {
						// cache
						const [x, y] = [
							state.detail.post.x + contextmenu.getBoundingClientRect().width >= window.innerWidth,
							state.detail.post.y + contextmenu.getBoundingClientRect().height >= window.innerHeight
						];
						// update
						contextmenu.style.setProperty("transform", "translate(" + [x, y].map((toggle) => toggle ? "-100%" : "0%").join(comma) + ")");
					});
				});

				chromium.handle(Window.Event.BLUR, (event) => this.setState((state) => ({ contextmenu: false })));
				chromium.handle(Window.Event.MAXIMIZE, (event) => this.setState((state) => ({ maximize: true })));
				chromium.handle(Window.Event.UNMAXIMIZE, (event) => this.setState((state) => ({ maximize: false })));
				chromium.handle(Window.Event.CONTEXTMENU, (event) => {
					structure("ctm").state = {
						id: "NATIVE",
						x: event.detail[0].x,
						y: event.detail[0].y,
						items: [
							{
								role: "New Tab",
								toggle: true,
								method: () => {
									structure("tabs").open("NEW TAB", "BROWSER", {});
								}
							},
							"seperator",
							{
								role: "Close All Tabs",
								toggle: true,
								method: () => {
									structure("tabs").reset();
								}
							},
						]
					};
				});
				chromium.handle(Window.Event.ENTER_FULL_SCREEN, (event) => this.setState((state) => ({ fullscreen: true })));
				chromium.handle(Window.Event.LEAVE_FULL_SCREEN, (event) => this.setState((state) => ({ fullscreen: false })));

				window.addEventListener("wheel", (event) => this.setState((state) => ({ contextmenu: false }), () => Object.defineProperty(structure("ctm").state, "id", { value: "???" })));
				window.addEventListener("keydown", (event) => { if (event.key === "w" && !event.altKey && event.ctrlKey && !event.shiftKey) structure("tabs").close(); });
				window.addEventListener("mousedown", (event) => this.setState((state) => ({ contextmenu: false }), () => Object.defineProperty(structure("ctm").state, "id", { value: "???" })));
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
			<Column id="app">
				{/* TITLEBAR */}
				<Row id="titlebar" constraint={{ height: 40.0 }} decoration={{ color: Color.pick(0.0) }} flags={{ visible: !this.state.fullscreen, draggable: true }}>
					{/* TABS */}
					<Spacer><Controller></Controller></Spacer>
					{/* GAP */}
					<Element constraint={{ width: 69.0 }}></Element>
					{/* MENU */}
					<Button id="minimize" constraint={{ width: 50.0 }} flags={{ draggable: false }}
						onMouseDown={(setStyle) => {
							chromium.minimize();
						}}
						onMouseEnter={(setStyle) => {
							setStyle({ decoration: { color: Color.pick(1.0) } });
						}}
						onMouseLeave={(setStyle) => {
							setStyle(undefined);
						}}
						children={<Minimize></Minimize>}
					/>
					<Button id="maximize" constraint={{ width: 50.0 }} flags={{ draggable: false }}
						onMouseDown={(setStyle) => {
							this.state.maximize ? chromium.unmaximize() : chromium.maximize();
						}}
						onMouseEnter={(setStyle) => {
							setStyle({ decoration: { color: Color.pick(1.0) } });
						}}
						onMouseLeave={(setStyle) => {
							setStyle(undefined);
						}}
						children={this.state.maximize ? <Unmaximize></Unmaximize> : <Maximize></Maximize>}
					/>
					<Button id="close" constraint={{ width: 50.0 }} flags={{ draggable: false }}
						onMouseDown={(setStyle) => {
							chromium.close("titlebar");
						}}
						onMouseEnter={(setStyle) => {
							setStyle({ decoration: { color: "tomato" } });
						}}
						onMouseLeave={(setStyle) => {
							setStyle(undefined);
						}}
						children={<Close></Close>}
					/>
				</Row>
				{/* CONTENT */}
				<Element id="content" constraint={{ width: 100.0 + "%", height: 100.0 + "%" }} decoration={{ color: Color.pick(2.0) }}><Display></Display></Element>
				{/* CONTEXTMENU */}
				<Element id="contextmenu" offset={{ padding: { top: 5.0, bottom: 5.0 } }} position={{ top: structure("ctm").state.y, left: structure("ctm").state.x }} decoration={{ color: Color.pick(3.0), border: { all: { width: 1.0, style: "solid", color: Color.pick(5.0) } }, corner: { all: 5.0 }, shadow: [{ x: 0.0, y: 0.0, blur: 5.0, spread: 0.0, color: Color.pick(1.0) }] }} flags={{ visible: this.state.contextmenu }}>
					{structure("ctm").state.items.map((element, index) => {
						switch (element) {
							case "seperator": {
								return (
									<Element key={index} offset={{ margin: { top: 5.0, bottom: 5.0 } }} constraint={{ height: 1.0 }} decoration={{ color: Color.pick(5) }}></Element>
								);
							}
							default: {
								return (
									<Container key={index} priority={true} offset={{ padding: { left: 10.0, right: 25.0 } }} constraint={{ height: 35.0 }}
										onMouseDown={(setStyle) => {
											// skip
											if (!element.toggle) return;
											// update
											this.setState((state) => ({ contextmenu: false }), element.method);
										}}
										onMouseEnter={(setStyle) => {
											setStyle({ decoration: { color: Color.pick(4.0) } });
										}}
										onMouseLeave={(setStyle) => {
											setStyle(undefined);
										}}>
										<Center x={false} y={true}>
											<Text>{[{ value: element.role, color: element.toggle ? undefined : Color.pick(5.0) }]}</Text>
										</Center>
									</Container>
								);
							}
						}
					})}
				</Element>
			</Column>
		);
	}
}

class Handle {
	public offset: number;
	public readonly minimum: number;
	public readonly maximum: number;

	constructor(
		public index: number,
		public readonly element: HTMLElement
	) {
		this.offset = 0;
		this.minimum = this.width * this.index * -1;
		this.maximum = this.width * (structure("tabs").state.pages.length - this.index - 1);
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

interface ControllerProps extends Props.Clear<undefined> {
	// TODO: none
}

interface ControllerState {
	index: number;
	handle?: Handle;
}

class Controller extends Stateful<ControllerProps, ControllerState> {
	protected create() {
		return ({ index: structure("tabs").state.index, handle: undefined });
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				structure("tabs").handle((event) => {
					// reset
					this.setState((state) => ({ index: event.detail.post.index, handle: undefined }));
				});
				// cache
				const element = this.node();

				if (!element) throw new Error();

				window.addEventListener("mouseup", (event) => {
					if (this.state.handle) {
						// undo
						for (let index = 0; index < structure("tabs").state.pages.length; index++) {
							// cache
							const children = element.children.item(index) as HTMLElement;
							// style
							children.style.setProperty("left", "unset");
							children.style.setProperty("z-index", "unset");
							children.style.setProperty("transform", "unset");
						}

						if (structure("tabs").state.index !== this.state.handle.index) {
							// update
							structure("tabs").reorder(this.state.handle.index);
						}
						else {
							// reset
							this.setState((state) => ({ handle: undefined }));
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

						this.state.handle = new Handle(this.state.index, children);
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

						if (this.state.handle.index !== destination && destination >= 0 && destination < structure("tabs").state.pages.length) {
							// move left
							if (event.movementX < 0) {
								if (this.state.index < this.state.handle.index && this.state.handle.index > destination) {
									(element.children.item(destination + 1) as HTMLElement).style.setProperty("transform", "unset");
								}
								else {
									(element.children.item(destination) as HTMLElement).style.setProperty("transform", "translateX(100%)");
								}
							}
							// move right
							if (event.movementX > 0) {
								if (this.state.index > this.state.handle.index && this.state.handle.index < destination) {
									(element.children.item(destination - 1) as HTMLElement).style.setProperty("transform", "unset");
								}
								else {
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
					{structure("tabs").state.pages.map((page, index) => {
						return (
							<Spacer key={index}>
								<Container id="handle" constraint={{ minimum: { width: 30.0 }, maximum: { width: 250.0 } }} decoration={{ color: this.state.index === index ? Color.pick(2.0) : Color.pick(0.0), border: { top: { width: 2.5, style: "solid", color: this.state.index === index ? "aquamarine" : undefined }, bottom: { width: 2.5 } } }} flags={{ draggable: false }}
									onMouseDown={(setStyle) => {
										// skip
										if (structure("tabs").state.index === index) return;

										setStyle(undefined);

										structure("tabs").jump(index);
									}}
									onMouseEnter={(setStyle) => {
										// skip
										if (structure("tabs").state.index === index) return;

										setStyle({ decoration: { color: Color.pick(1.0), border: { top: { width: 2.5, style: "solid", color: Color.pick(2.0) } } } });
									}}
									onMouseLeave={(setStyle) => {
										setStyle(undefined);
									}}>
									{/* TITLE */}
									<Text position={{ all: 7.5, left: 10.0, right: 30.0 }}>{[{ value: page.title, color: this.state.index === index ? undefined : Color.pick(5.0) }]}</Text>
									{/* CLOSE */}
									<Button id="close" position={{ top: 7.5, left: "auto", right: 5.0, bottom: 7.5 }} constraint={{ width: 19.5, height: 19.5 }} decoration={{ corner: { all: 2.5 } }}
										onMouseDown={(setStyle) => {
											structure("tabs").close(index);
										}}
										onMouseEnter={(setStyle) => {
											setStyle({ decoration: { color: this.state.index === index ? Color.pick(4.0) : Color.pick(3.0) } });
										}}
										onMouseLeave={(setStyle) => {
											setStyle(undefined);
										}}
										children={<Close color={this.state.index === index ? undefined : Color.pick(5.0)}></Close>}
									/>
								</Container>
							</Spacer>
						);
					})}
				</>
				<Button id="open" offset={{ margin: { all: (40.0 - 25.0) * 0.5 } }} constraint={{ width: 25.0, height: 25.0 }} decoration={{ color: Color.pick(2.0), corner: { all: 2.5 } }} flags={{ draggable: false }}
					onMouseDown={(setStyle) => {
						structure("tabs").open("NEW TAB", "BROWSER", {});
					}}
					onMouseEnter={(setStyle) => {
						setStyle({ decoration: { color: Color.pick(4.0) } });
					}}
					onMouseLeave={(setStyle) => {
						setStyle(undefined);
					}}
					children={<Plus></Plus>}
				/>
			</Row>
		);
	}
}

export default App;
