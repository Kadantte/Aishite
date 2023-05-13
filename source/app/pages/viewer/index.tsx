import Style from "app/common/styles";
import Color from "app/common/color";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import Image from "app/layout/image";

import discord from "modules/discord";

import structure from "handles/index";

import { gallery } from "apis/hitomi.la/gallery";

interface ViewerProps extends Props.Clear<undefined> {
	// required
	readonly width: number;
	readonly gallery: number;
}

interface ViewerState {
	init: boolean;
	width: number;
	control: boolean;
	gallery: {
		title: string;
		files: Await<ReturnType<Await<ReturnType<typeof gallery>>["files"]>>;
	};
}

class Viewer extends Stateful<ViewerProps, ViewerState> {
	protected create() {
		return {
			init: false,
			width: this.props.width,
			control: false,
			gallery: { title: "???", files: [] }
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				this.onRender();

				structure("tabs").handle(this.onRender);

				window.addEventListener("wheel", this.onWheel);
				window.addEventListener("keyup", this.onKeyUp);
				window.addEventListener("resize", this.onResize);
				window.addEventListener("keydown", this.onKeyDown);
			},
			WILL_UNMOUNT: () => {
				structure("tabs").unhandle(this.onRender);

				window.removeEventListener("wheel", this.onWheel);
				window.removeEventListener("keyup", this.onKeyUp);
				window.removeEventListener("resize", this.onResize);
				window.removeEventListener("keydown", this.onKeyDown);
			}
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			// manually
			overflow: "auto",
			// automatic
			...Style.size({ width: 100.0 + "%", height: 100.0 + "%" })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected override() {
		return {
			"data-scrollbar": "square"
		};
	}
	protected items() {
		return [
			{
				role: "Copy URL", toggle: true, method: async () => {
					navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([(await gallery(this.props.gallery)).URL()], { type: "text/plain" }) })]);
				}
			},
			"seperator" as const,
			{
				role: "Download", toggle: false, method: async () => {
					throw new Error("Unimplemented");
				}
			},
			{
				role: "Bookmark", toggle: false, method: async () => {
					throw new Error("Unimplemented");
				}
			},
			"seperator" as const,
			{
				role: "Open in External Browser", toggle: true, method: async () => {
					chromium.open_url((await gallery(this.props.gallery)).URL());
				}
			}
		];
	}
	protected build() {
		return (
			<section id={this.props.id ?? "viewer"}
				onContextMenu={(event) => {
					// prevent ctm override
					event.stopPropagation();

					structure("ctm").render(this.props.gallery.toString(), event.pageX, event.pageY, this.items());
				}}>
				{this.state.gallery.files.map((file, index) => {
					return (
						<Image key={index} source={file.url} offset={{ margin: { all: "auto" } }} constraint={{ width: this.state.width, height: file.height / (file.width / resolution.width.value.clamp(0, this.state.width)), minimum: { width: resolution.width.minimum * 0.75 }, maximum: { width: 100.0 + "%" } }} decoration={{ color: Color.pick(3.0), shadow: [{ x: -4.5, y: 0, blur: 4.5, spread: -4.5, color: Color.pick(1.0) }, { x: 4.5, y: 0, blur: 4.5, spread: -4.5, color: Color.pick(1.0) }] }}></Image>
					);
				})}
			</section>
		);
	}
	protected visible() {
		return structure("tabs").peek().element.props["data-key"] === (this.props as typeof this.props & { "data-key": string })["data-key"];
	}
	protected discord() {
		if (!this.visible()) return;

		discord.update({ state: "Reading (" + this.props.gallery + ")", details: this.state.gallery.title, partyMax: undefined, partySize: undefined });
	}
	@autobind()
	protected async onRender() {
		if (!this.visible()) return;

		this.discord();

		if (this.state.init) return;

		this.state.init = true;

		const _gallery = await gallery(this.props.gallery);
		const _files = await _gallery.files();

		this.setState((state) => ({ gallery: { title: _gallery.title, files: _files } }));
	}
	@autobind()
	protected async onWheel(event: WheelEvent) {
		if (!this.visible()) return;
		if (!this.state.control) return;

		this.setState((state) => ({ width: (state.width - event.deltaY).clamp(resolution.width.minimum * 0.75, resolution.width.value) }));
	}
	@autobind()
	protected async onKeyUp(event: KeyboardEvent) {
		if (!this.visible()) return;

		switch (event.key) {
			case "Control": {
				this.state.control = false;
				break;
			}
		}
	}
	@autobind()
	protected async onResize(event: UIEvent) {
		if (!this.visible()) return;

		this.setState((state) => ({}));
	}
	@autobind()
	protected async onKeyDown(event: KeyboardEvent) {
		if (!this.visible()) return;

		switch (event.key) {
			case "=": {
				this.setState((state) => ({ width: (state.width + 100).clamp(resolution.width.minimum * 0.75, resolution.width.value) }));
				break;
			}
			case "-": {
				this.setState((state) => ({ width: (state.width - 100).clamp(resolution.width.minimum * 0.75, resolution.width.value) }));
				break;
			}
			case "Control": {
				this.state.control = true;
				break;
			}
		}
	}
}

export default Viewer;
