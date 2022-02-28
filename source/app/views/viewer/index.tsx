// TOP-LEVEL
import PageView from "@/app/views";
// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { EventManager } from "@/app/common/framework";
// layout
import Image from "@/app/layout/image";
// layout/casacade
import Offset from "@/app/layout/casacade/offset";
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
	public width: number;
	public gallery?: GalleryScript;

	constructor(args: Args<ViewerState>) {
		this.init = args.init;
		this.width = args.width;
		this.gallery = args.gallery;
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
		return new ViewerState({ init: false, width: NaN, gallery: undefined });
	}
	protected events() {
		return [
			new EventManager(window, "resize", () => {
				if (this.visible()) this.setState({ ...this.state, width: this.node()?.offsetWidth ?? this.state.width });
			}),
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
					if (this.state.gallery) {
						return (
							<Offset type={"margin"} all={"auto"}>
								{this.state.gallery.files.map((file, x) => <Image key={x} source={file.url} width={Unit(1000)} height={file.height / (file.width / this.state.width.clamp(0, 1000))} size={{ minimum: { width: Unit(500) }, maximum: { width: Unit(100, "%") } }}/>)}
							</Offset>
						);
					}
				})()}
			</section>
		);
	}
	protected macro_0(callback?: Method) {
		GalleryScript(this.props.gallery).then((gallery) => {
			this.setState({ ...this.state, init: true, width: this.node()?.offsetWidth ?? this.state.width, gallery: gallery }, () => callback?.());
		});
	}
	protected discord(state: boolean) {
		switch (state) {
			case true:
			case false: {
				discord.update({
					state: `Reading (${this.props.gallery})`,
					details: this.state.gallery ? this.state.gallery.title : "Loading...",
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
}

export default Viewer;
