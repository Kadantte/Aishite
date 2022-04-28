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

import { BridgeEvent } from "@/api";

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
				bridge.handle(BridgeEvent.MAXIMIZE, () => this.setState((state) => ({ maximize: true })));
				bridge.handle(BridgeEvent.UNMAXIMIZE, () => this.setState((state) => ({ maximize: false })));
				bridge.handle(BridgeEvent.ENTER_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: true })));
				bridge.handle(BridgeEvent.LEAVE_FULL_SCREEN, () => this.setState((state) => ({ fullscreen: false })));

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

class ControllerProps extends Props<undefined> {
	constructor(args: Args<ControllerProps>) {
		super(args);
	}
}

class ControllerState {
	public index: number;
	public dragging: Nullable<HTMLElement>;
	public destination: number;

	constructor(args: Args<ControllerState>) {
		this.index = args.index;
		this.dragging = args.dragging;
		this.destination = args.destination;
	}
}

class Controller extends Stateful<ControllerProps, ControllerState> {
	protected create() {
		return new ControllerState({ index: navigator.state.index, dragging: null, destination: NaN });
	}
	protected events(): LifeCycle<ControllerProps, ControllerState> {
		return {
			DID_MOUNT: () => {
				navigator.handle((event) => {
					// reset
					this.setState((state) => ({ index: event.detail.after.index, dragging: null, destination: NaN }));
				});

				const element = this.node()!;

				document.addEventListener("mouseup", (event) => {
					if (this.state.dragging) {
						// undo
						for (let index = 0; index < navigator.state.pages.length; index++) {
							// cache
							const children = element.children.item(index) as HTMLElement;

							children.style.left = "unset";
							children.style.zIndex = "unset";
							children.style.transform = "unset";
						}
						// update
						navigator.reorder(this.state.destination);
					}
				});
				document.addEventListener("mousedown", (event) => {
					if ((event.target as HTMLElement).id === "handle") {
						// cache
						const children = event.target as HTMLElement;

						children.style.left = "unset";
						children.style.zIndex = "6974";
						children.style.transform = "unset";

						this.state.dragging = children;
						this.state.destination = this.state.index;
					}
				});
				document.addEventListener("mousemove", (event) => {
					if (this.state.dragging) {
						// cache
						const { width, height } = this.state.dragging.getBoundingClientRect();

						const margin = 35;

						const moveX = Number(this.state.dragging.style.left.match(/-?\d+/g)) + event.movementX;

						const posX = (this.state.index * width) + moveX;

						// x-axis check
						if (event.clientX < posX - margin) return;
						if (event.clientX > posX + width + margin) return;
						// y-axis check
						if (event.clientY < 0 - margin) return;
						if (event.clientY > height + margin) return;

						const destination = Math.floor((posX / width) + 0.5);

						if (destination >= 0 && destination < navigator.state.pages.length && this.state.destination !== destination) {
							// move left
							if (event.movementX < 0) {
								if (this.state.index < this.state.destination && this.state.destination > destination) {
									(element.children.item(destination + 1) as HTMLElement).style.transform = "unset";
								} else {
									(element.children.item(destination) as HTMLElement).style.transform = "translate(100%)";
								}
							}
							// move right
							if (event.movementX > 0) {
								if (this.state.index > this.state.destination && this.state.destination < destination) {
									(element.children.item(destination - 1) as HTMLElement).style.transform = "unset";
								} else {
									(element.children.item(destination) as HTMLElement).style.transform = "translateX(-100%)";
								}
							}
							// update
							this.state.destination = destination;
						}
						// update
						this.state.dragging.style.left = Unit(moveX.clamp(width * this.state.index * -1, width * (navigator.state.pages.length - this.state.index - 1)));
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
								<Container id="handle" color={this.state.index === index ? Color.DARK_200 : Color.DARK_000} minimum={{ width: 29.5 }} maximum={{ width: 250 }} border={{ top: { width: 2.5, style: "solid", color: this.state.index === index ? Color.RGBA_000 : "transparent" }, bottom: { width: 2.5 } }} phantom={true} draggable={false}
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
									<Text all={7.5} left={10} right={29.5} children={[{ text: page.title, color: this.state.index === index ? undefined : Color.DARK_500 }]}/>
									{/* CLOSE */}
									<Button all={7.5} left="auto" right={5.0} width={19.5} height={19.5} corner={{ all: 2.5 }} phantom={true}
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
