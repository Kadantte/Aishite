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
				<Row id="titlebar" height={40} visible={!this.state.fullscreen} draggable={true}>
					<Spacer>
						<Controller width={Unit(100, "%")}></Controller>
					</Spacer>
					<Element width={69}>
						{/* GAP */}
					</Element>
					<Button id="minimize" width={Unit(50)} draggable={false}
						onMouseDown={(I) => {
							protocol.minimize();
						}}
						onMouseEnter={(I) => {
							I.style({ color: Color.DARK_100 });
						}}
						onMouseLeave={(I) => {
							I.style(null);
						}}
						children={<Minimize/>}
					/>
					<Button id="maximize" width={Unit(50)} draggable={false}
						onMouseDown={(I) => {
							if (this.state.maximize) {
								protocol.unmaximize();
							} else {
								protocol.maximize();
							}
						}}
						onMouseEnter={(I) => {
							I.style({ color: Color.DARK_100 });
						}}
						onMouseLeave={(I) => {
							I.style(null);
						}}
						children={this.state.maximize ? <Unmaximize/> : <Maximize/>}
					/>
					<Button id="close" width={Unit(50)} draggable={false}
						onMouseDown={(I) => {
							protocol.close("titlebar");
						}}
						onMouseEnter={(I) => {
							I.style({ color: Color.RGBA_100 });
						}}
						onMouseLeave={(I) => {
							I.style(null);
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

	constructor(args: Args<ControllerState>) {
		this.index = args.index;
	}
}

class Controller extends Stateful<ControllerProps, ControllerState> {
	protected create() {
		return new ControllerState({ index: navigator.state.index });
	}
	protected events(): LifeCycle<ControllerProps, ControllerState> {
		return {
			DID_MOUNT: () => {
				navigator.handle((event) => {
					this.setState((state) => ({ index: event.detail.after.index }));
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
			<Row id={"navigator"}>
				<>
					{navigator.state.pages.map((page, index) => {
						return (
							<Spacer key={index}>
								<Container color={this.state.index === index ? Color.DARK_200 : Color.DARK_000} minimum={{ width: 29.5 }} maximum={{ width: 250 }} border={{ top: { width: 2.5, style: "solid", color: this.state.index === index ? Color.RGBA_000 : "transparent" }, bottom: { width: 2.5 } }} draggable={false}
									onMouseDown={(I) => {
										if (navigator.state.index !== index) {
											I.style(null, () => {
												navigator.jump(index);
											});
										}
									}}
									onMouseEnter={(I) => {
										if (navigator.state.index !== index) {
											I.style({ color: Color.DARK_100, border: { top: { width: 2.5, style: "solid", color: Color.DARK_200 } } });
										}
									}}
									onMouseLeave={(I) => {
										I.style(null);
									}}>
									{/* TITLE */}
									<Text all={7.5} left={10} right={29.5} children={[{ text: page.title, color: this.state.index === index ? undefined : Color.DARK_500 }]}/>
									{/* CLOSE */}
									<Button all={7.5} left="auto" right={5.0} width={19.5} height={19.5} corner={{ all: 2.5 }}
										onMouseDown={(I) => {
											navigator.close(index);
										}}
										onMouseEnter={(I) => {
											I.style({ color: Color.RGBA_100 });
										}}
										onMouseLeave={(I) => {
											I.style(null);
										}}
										children={<Close color={this.state.index === index ? undefined : Color.DARK_500}/>}
									/>
								</Container>
							</Spacer>
						);
					})}
				</>
				<Button id="open" color={Color.DARK_200} width={26.5} height={26.5} margin={{ all: 20 - 13.25 }} corner={{ all: 2.5 }} draggable={false}
					onMouseDown={(I) => {
						navigator.open("NEW TAB", "BROWSER", {});
					}}
					onMouseEnter={(I) => {
						I.style({ color: Color.DARK_400 });
					}}
					onMouseLeave={(I) => {
						I.style(null);
					}}
					children={<Plus/>}
				/>
			</Row>
		);
	}
}

export default App;
