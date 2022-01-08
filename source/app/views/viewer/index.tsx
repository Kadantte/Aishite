// TOP-LEVEL
import PageView from "@/app/views";
// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { EventManager } from "@/app/common/framework";
// layout
import Size from "@/app/layout/size";
import Image from "@/app/layout/image";
import Offset from "@/app/layout/offset";
// modules
import discord from "@/modules/discord";
import { GalleryScript } from "@/modules/hitomi.la/gallery";
// states
import navigator from "@/states/navigator";

class ViewerProps extends Props<undefined> {
	public gallery: number;

	constructor(args: Args<ViewerProps>) {
		super(args);

		this.gallery = args.gallery;
	}
}

class ViewerState {
	public init: boolean;
	/** Oh boy... due to the `navigatior`'s design I can't name this to `gallery`. */
	public script?: GalleryScript;

	constructor(args: Args<ViewerState>) {
		this.init = args.init;
		this.script = args.script;
	}
}

class Viewer extends PageView<ViewerProps, ViewerState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (this.visible()) {
				if (!this.state.init) {
					// loading
					this.discord(false);
					// init
					this.macro_0(() => {
						if (this.visible()) this.discord(true);
					});
				} else {
					this.macro_0(() => {
						if (this.visible()) this.discord(true);
					});
				}
			}
		});
		return new ViewerState({ init: false, script: undefined });
	}
	protected events() {
		return [
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) { this.discord(false); this.macro_0(() => { if (this.visible()) this.discord(true); }); }
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={"viewer"} data-scrollable={"frame"}>
				{(() => {
					if (this.state.script) {
						return (
							<Size width={Unit(1000)}>
								<Size type={"minimum"} width={Unit(500)}>
									<Size type={"maximum"} width={Unit(100, "%")}>
										<Offset type={"margin"} all={"auto"}>
											{this.state.script.files.map((file, x) => <Image key={x} source={file.url}/>)}
										</Offset>
									</Size>
								</Size>
							</Size>
						);
					}
				})()}
			</section>
		);
	}
	protected macro_0(callback?: () => void) {
		GalleryScript(this.props.gallery).then((script) => {
			this.setState({ ...this.state, init: true, script: script }, () => callback?.());
		});
	}
	protected discord(loaded: boolean) {
		switch (loaded) {
			case true: {
				discord.update({
					state: "Reading",
					details: `#${this.state.script!.id}\u0020${this.state.script!.title}`,
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
			case false: {
				discord.update({
					state: "Reading",
					details: "Loading...",
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
}

export default Viewer;
