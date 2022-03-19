// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Column from "@/app/layout/column";
// layout/casacade
import Spacer from "@/app/layout/casacade/spacer";
import Draggable from "@/app/layout/casacade/draggable";
// widgets
import Button from "@/app/widgets/button";
import Viewport from "@/app/widgets/view";
import Navigator from "@/app/widgets/navigator";
// icons
import Close from "@/app/icons/close";
import Maximize from "@/app/icons/maximize";
import Minimize from "@/app/icons/minimize";
import Unmaximize from "@/app/icons/unmaximize";
// modules
import request from "@/modules/request";
// api
import { BridgeEvent } from "@/api";

class AppProps extends Props<undefined> {
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
		request.GET("https://api.github.com/repos/Any-Material/Aishite/releases?per_page=100", "json").then((response) => {
			// parse version string to number
			function HAL_K45(version: string) {
				return Number(version.replace(/\./g, ""));
			}
			if (HAL_K45(response.encode["0"]["tag_name"]) > HAL_K45(require("@/../package.json")["version"])) {
				// update available	
			}
		});
		return new AppState({ maximize: false, fullscreen: false });
	}
	protected events() {
		return [
			new EventManager(window, "keydown", (event: KeyboardEvent) => {
				switch (event.key) {
					case "F11": {
						window.API.fullscreen();
						break;
					}
					case "F12": {
						window.API.development();
						break;
					}
				}
			}),
			new EventManager(window.bridge, BridgeEvent.MAXIMIZE, () => {
				this.setState({ ...this.state, maximize: true });
			}),
			new EventManager(window.bridge, BridgeEvent.UNMAXIMIZE, () => {
				this.setState({ ...this.state, maximize: false });
			}),
			new EventManager(window.bridge, BridgeEvent.ENTER_FULL_SCREEN, () => {
				this.setState({ ...this.state, fullscreen: true });
			}),
			new EventManager(window.bridge, BridgeEvent.LEAVE_FULL_SCREEN, () => {
				this.setState({ ...this.state, fullscreen: false });
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {
			background: Color.DARK_000
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Column id={"root"}>
				{/* TITLEBAR */}
				<Draggable drag={true}>
					<Row id="titlebar" height={Unit(40)} visible={!this.state.fullscreen}>
						<Spacer>
							<Navigator size={{ maximum: { width: calculate("100% - 69px - 50px - 50px - 50px") } }}/>
						</Spacer>
						<section style={{ width: Unit(69) }}/>
						<Button id={"minimize"} width={Unit(50)}
							onMouseDown={(I) => {
								window.API.minimize();
							}}
							onMouseEnter={(I) => {
								I.style({ background: { color: Color.DARK_100 } });
							}}
							onMouseLeave={(I) => {
								I.style(null);
							}}
							children={<Minimize/>}
						/>
						<Button id={"maximize"} width={Unit(50)}
							onMouseDown={(I) => {
								if (this.state.maximize) {
									window.API.unmaximize();
								} else {
									window.API.maximize();
								}
							}}
							onMouseEnter={(I) => {
								I.style({ background: { color: Color.DARK_100 } });
							}}
							onMouseLeave={(I) => {
								I.style(null);
							}}
							children={this.state.maximize ? <Unmaximize/> : <Maximize/>}
						/>
						<Button id={"close"} width={Unit(50)}
							onMouseDown={(I) => {
								window.API.close("titlebar");
							}}
							onMouseEnter={(I) => {
								I.style({ background: { color: Color.SPOTLIGHT } });
							}}
							onMouseLeave={(I) => {
								I.style(null);
							}}
							children={<Close/>}
						/>
					</Row>
				</Draggable>
				{/* CONTENT */}
				<section style={{ width: Unit(100, "%"), height: Unit(100, "%"), background: Color.DARK_200 }}>
					<Viewport/>
				</section>
			</Column>
		);
	}
}

export default App;
