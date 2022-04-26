import Page from "@/app/pages";

import Unit from "@/app/common/unit";
import { Clear } from "@/app/common/props";
import { LifeCycle } from "@/app/common/framework";

import Image from "@/app/layout/image";

import discord from "@/modules/discord";

import navigator from "@/manager/navigator";

import gallery from "@/apis/hitomi.la/gallery";

type _Gallery = Await<ReturnType<typeof gallery["get"]>>;
type _GalleryFile = Await<ReturnType<_Gallery["getFiles"]>>;

class ViewerProps extends Clear<undefined> {
	public factor: number;
	public gallery: number;

	constructor(args: Args<ViewerProps>) {
		super(args);

		this.factor = args.factor;
		this.gallery = args.gallery;
	}
}

class ViewerState {
	public init: boolean;
	public ctrl: boolean;
	public title: string;
	public files: _GalleryFile;
	public factor: number;

	constructor(args: Args<ViewerState>) {
		this.init = args.init;
		this.ctrl = args.ctrl;
		this.title = args.title;
		this.files = args.files;
		this.factor = args.factor;
	}
}

class Viewer extends Page<ViewerProps, ViewerState> {
	protected create() {
		// permanent
		this.handle_0 = this.handle_0.bind(this);
		this.handle_1 = this.handle_1.bind(this);
		this.handle_2 = this.handle_2.bind(this);
		this.handle_3 = this.handle_3.bind(this);
		this.handle_4 = this.handle_4.bind(this);

		return new ViewerState({ init: false, ctrl: false, title: "Loading...", files: [], factor: this.props.factor });
	}
	protected events(): LifeCycle<ViewerProps, ViewerState> {
		return {
			DID_MOUNT: () => {
				// @ts-ignore
				this.handle_0(null);

				navigator.handle(this.handle_0);

				window.addEventListener("resize", this.handle_1);
				// for zoom
				window.addEventListener("wheel", this.handle_2);
				window.addEventListener("keyup", this.handle_3);
				window.addEventListener("keydown", this.handle_4);
			},
			WILL_UNMOUNT: () => {
				navigator.unhandle(this.handle_0);

				window.removeEventListener("resize", this.handle_1);
				// for zoom
				window.removeEventListener("wheel", this.handle_2);
				window.removeEventListener("keyup", this.handle_3);
				window.removeEventListener("keydown", this.handle_4);
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
			<section id={"viewer"} data-scrollable={"frame"}>
				{this.state.files.map((file, index) => {
					return (
						<Image key={index} source={file.url} width={this.state.factor} height={file.height / (file.width / window.outerWidth.clamp(0, this.state.factor))} minimum={{ width: responsive.width }} maximum={{ width: Unit(100, "%") }} margin={{ all: "auto" }}></Image>
					);
				})}
			</section>
		);
	}
	protected handle_0(event: Parameters<Parameters<typeof navigator["handle"]>[0]>[0]) {
		if (!this.visible()) return;

		if (this.state.init) {
			this.discord();
		} else {
			this.display();
		}

	}
	protected handle_1(event: UIEvent) {
		if (!this.visible()) return;

		this.setState((state) => ({}));
	}
	protected handle_2(event: WheelEvent) {
		if (!this.visible()) return;
		if (!this.state.ctrl) return;
		
		this.setState((state) => ({ factor: (state.factor - event.deltaY).clamp(responsive.width, window.outerWidth) }));
	}
	protected handle_3(event: KeyboardEvent) {
		if (!this.visible()) return;
		if (event.key !== "Control") return;
		
		this.state.ctrl = false;
	}
	protected handle_4(event: KeyboardEvent) {
		if (!this.visible()) return;
		if (event.key !== "Control") return;
		
		this.state.ctrl = true;
	}
	protected discord(state: boolean = true) {
		if (!this.visible()) return;

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
	protected display() {
		gallery.get(this.props.gallery).then((_gallery) => _gallery.getFiles().then((files) => this.setState((state) => ({ init: true, title: _gallery.title, files: files }), () => this.discord())));
	}
}

export default Viewer;
