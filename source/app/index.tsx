import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear, Props } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import Row from "@/app/layout/row";
import Text from "@/app/layout/text";
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

import navigator from "@/manager/navigator";

import { Window } from "@/apis/electron/bridge";

class AppProps extends Clear<undefined> {
	constructor(args: Args<AppProps>) {
		super(args);
	}
}

class AppState {
	public maximize: boolean;
	public fullscreen: boolean;

	constructor(args: Args<AppState>) {
		this.maximize = args.maximize;
		this.fullscreen = args.fullscreen;
	}
}

class App extends Stateful<AppProps, AppState> {
	protected create() {
		// https://github.com/Any-Material/Aishite/releases/download/{version}/{artifact}
		// request.GET("https://api.github.com/repos/Any-Material/Aishite/releases?per_page=100", "json").then((response) => {
		// 	// parse version string to number
		// 	function version(version: string) {
		// 		return Number(version.replace(/\./g, ""));
		// 	}
		// 	if (version(response.body["0"]["tag_name"]) > version(require("@/../package.json")["version"])) {
		// 		// update available	
		// 	}
		// });
		return new AppState({ maximize: false, fullscreen: false });
	}
	protected events(): LifeCycle<AppProps, AppState> {
		return {
			DID_MOUNT: () => {
				bridge.handle(Window.MAXIMIZE, () => this.setState((state) => ({ maximize: true })));
				bridge.handle(Window.UNMAXIMIZE, () => this.setState((state) => ({ maximize: false })));
				bridge.handle(Window.ENTER_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: true })));
				bridge.handle(Window.LEAVE_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: false })));

				window.addEventListener("keydown", (event) => {
					switch (event.key) {
						case "w": {
							if (!event.altKey && event.ctrlKey && !event.shiftKey) {
								navigator.close();
							}
							break;
						}
						case "F12": {
							protocol.development();
							break;
						}
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
			<Column id={"root"}>
				{/* TITLEBAR */}
				<Row id="titlebar" color={Color.DARK_000} height={40} visible={!this.state.fullscreen} draggable={true}>
					<Spacer>
						<Controller width={Unit(100, "%")}></Controller>
					</Spacer>
					<Element width={69}>
						{/* GAP */}
					</Element>
					<Button id="minimize" width={Unit(50)} draggable={false}
						onMouseDown={(style) => {
							protocol.minimize();
						}}
						onMouseEnter={(style) => {
							style({ color: Color.DARK_100 });
						}}
						onMouseLeave={(style) => {
							style(null);
						}}
						children={<Minimize/>}
					/>
					<Button id="maximize" width={Unit(50)} draggable={false}
						onMouseDown={(style) => {
							if (this.state.maximize) {
								protocol.unmaximize();
							} else {
								protocol.maximize();
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
					<Button id="close" width={Unit(50)} draggable={false}
						onMouseDown={(style) => {
							protocol.close("titlebar");
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
				{/* CONTENT */}
				<section style={{ width: Unit(100, "%"), height: Unit(100, "%"), background: Color.DARK_200 }}>
					<Viewport></Viewport>
				</section>
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
		this.maximum = this.width * (navigator.state.pages.length - args.index - 1);
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

class ControllerProps extends Props<undefined> {
	constructor(args: Args<ControllerProps>) {
		super(args);
	}
}

class ControllerState {
	public index: number;
	public handle: Nullable<Handle>;

	constructor(args: Args<ControllerState>) {
		this.index = args.index;
		this.handle = args.handle;
	}
}

class Controller extends Stateful<ControllerProps, ControllerState> {
	protected create() {
		return new ControllerState({ index: navigator.state.index, handle: null });
	}
	protected events(): LifeCycle<ControllerProps, ControllerState> {
		return {
			DID_MOUNT: () => {
				navigator.handle((event) => {
					// reset
					this.setState((state) => ({ index: event.detail.after.index, handle: null }));
				});
				// cache
				const element = this.node();

				if (!element) throw Error();

				window.addEventListener("mouseup", (event) => {
					if (this.state.handle) {
						// undo
						for (let index = 0; index < navigator.state.pages.length; index++) {
							// cache
							const children = element.children.item(index) as HTMLElement;
							// style
							children.style.left = "unset";
							children.style.zIndex = "unset";
							children.style.transform = "unset";
						}
						// update
						navigator.reorder(this.state.handle.index);
					}
				});
				window.addEventListener("mousedown", (event) => {
					if ((event.target as HTMLElement).id === "handle") {
						// cache
						const children = event.target as HTMLElement;
						// style
						children.style.left = "unset";
						children.style.zIndex = "6974";
						children.style.transform = "unset";

						this.state.handle = new Handle({ index: this.state.index, offset: 0, element: children });
					}
				});
				window.addEventListener("mousemove", (event) => {
					if (this.state.handle) {
						// extra space
						const margin = 55;

						// x-axis check
						if (event.clientX < this.state.handle.left - margin) return;
						if (event.clientX > this.state.handle.right + margin) return;
						// y-axis check
						// if (event.clientY < this.state.handle.top - margin) return;
						// if (event.clientY > this.state.handle.bottom + margin) return;

						const destination = Math.floor((this.state.handle.left / this.state.handle.width) + 0.5);

						if (this.state.handle.index !== destination && destination >= 0 && destination < navigator.state.pages.length) {
							// move left
							if (event.movementX < 0) {
								if (this.state.index < this.state.handle.index && this.state.handle.index > destination) {
									(element.children.item(destination + 1) as HTMLElement).style.transform = "unset";
								} else {
									(element.children.item(destination) as HTMLElement).style.transform = "translateX(100%)";
								}
							}
							// move right
							if (event.movementX > 0) {
								if (this.state.index > this.state.handle.index && this.state.handle.index < destination) {
									(element.children.item(destination - 1) as HTMLElement).style.transform = "unset";
								} else {
									(element.children.item(destination) as HTMLElement).style.transform = "translateX(-100%)";
								}
							}
							// update
							this.state.handle.index = destination;
						}
						// update
						this.state.handle.offset = (this.state.handle.offset + event.movementX).clamp(this.state.handle.minimum, this.state.handle.maximum);
						// style
						this.state.handle.element.style.left = Unit(this.state.handle.offset);
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
			<Row id={"controller"}>
				<>
					{navigator.state.pages.map((page, index) => {
						return (
							<Spacer key={index}>
								<Container id="handle" color={this.state.index === index ? Color.DARK_200 : Color.DARK_000} minimum={{ width: 29.5 }} maximum={{ width: 250 }} border={{ top: { width: 2.5, style: "solid", color: this.state.index === index ? Color.RGBA_000 : "transparent" }, bottom: { width: 2.5 } }} draggable={false}
									onMouseDown={(style) => {
										if (navigator.state.index !== index) {
											style(null, () => navigator.jump(index));
										}
									}}
									onMouseEnter={(style) => {
										if (navigator.state.index !== index) {
											style({ color: Color.DARK_100, border: { top: { width: 2.5, style: "solid", color: Color.DARK_200 } } });
										}
									}}
									onMouseLeave={(style) => {
										style(null);
									}}>
									{/* TITLE */}
									<Text all={7.5} left={10} right={29.5} children={[{ text: page.title, color: this.state.index === index ? undefined : Color.DARK_500, weight: "bold" }]}/>
									{/* CLOSE */}
									<Button all={7.5} left="auto" right={5.0} width={19.5} height={19.5} corner={{ all: 2.5 }}
										onMouseDown={(style) => {
											navigator.close(index);
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
						navigator.open("NEW TAB", "BROWSER", {});
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
