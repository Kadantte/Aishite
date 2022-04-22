import Page from "@/app/pages";

import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { EventManager } from "@/app/common/framework";

import Image from "@/app/layout/image";

import Offset from "@/app/layout/casacade/offset";

import discord from "@/modules/discord";

import navigator from "@/manager/navigator";

import { GalleryInfo } from "@/apis/hitomi.la/gallery";

type _Gallery = Await<ReturnType<typeof GalleryInfo>>;
type _GalleryFile = Await<ReturnType<_Gallery["getFiles"]>>;

class ViewerProps extends Props<undefined> {
	public clamp: number;
	public gallery: number;

	constructor(args: Args<ViewerProps>) {
		super(args);

		this.clamp = args.clamp;
		this.gallery = args.gallery;
	}
}

class ViewerState {
	public init: boolean;
	public ctrl: boolean;
	public width: number;
	public clamp: number;
	public title: string;
	public files: _GalleryFile;

	constructor(args: Args<ViewerState>) {
		this.init = args.init;
		this.ctrl = args.ctrl;
		this.width = args.width;
		this.clamp = args.clamp;
		this.title = args.title;
		this.files = args.files;
	}
}

class Viewer extends Page<ViewerProps, ViewerState> {
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
		return new ViewerState({ init: false, ctrl: false, width: NaN, clamp: this.props.clamp, title: "Loading...", files: [] });
	}
	protected events() {
		return [
			new EventManager(window, "resize", () => {
				if (this.visible()) this.setState({ ...this.state, width: this.width() });
			}),
			new EventManager(window, "wheel", (event) => {
				if (this.state.ctrl && this.visible()) this.setState({ ...this.state, clamp: (this.state.clamp - (event as WheelEvent).deltaY).clamp(550, Infinity) });
			}),
			new EventManager(window, "keyup", (event) => {
				if ((event as KeyboardEvent).key === "Control" && this.visible()) this.state.ctrl = false;
			}),
			new EventManager(window, "keydown", (event) => {
				if ((event as KeyboardEvent).key === "Control" && this.visible()) this.state.ctrl = true;
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
				<Offset type={"margin"} all={"auto"}>
					{this.state.files.map((file, index) => <Image key={index} source={file.url} width={Unit(this.state.clamp)} height={file.height / (file.width / this.state.width.clamp(0, this.state.clamp))} size={{ minimum: { width: Unit(550) }, maximum: { width: Unit(100, "%") } }}/>)}
				</Offset>
			</section>
		);
	}
	protected width() {
		return this.node()?.offsetWidth ?? this.state.width;
	}
	protected macro_0(callback?: Method) {
		GalleryInfo(this.props.gallery).then((gallery) => {
			gallery.getFiles().then((files) => {
				this.setState({ ...this.state, init: true, width: this.width(), title: gallery.title, files: files }, () => callback?.());
			})
		});
	}
	protected discord(state: boolean) {
		switch (state) {
			case true:
			case false: {
				discord.update({
					state: `Reading (${this.props.gallery})`,
					details: this.state.title,
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
}

export default Viewer;
