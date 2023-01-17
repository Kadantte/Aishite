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
		files: Await<ReturnType<gallery["files"]>>;
	};
}

class Viewer extends Stateful<ViewerProps, ViewerState> {
	protected create() {
		return {
			init: false,
			width: this.props.width,
			control: false,
			gallery: { title: "???", files: new Array() }
		};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				// initial
				this.onRender();
				// @ts-ignore
				structure("tabs").handle(this.onRender);

				window.addEventListener("wheel", this.onWheel);
				window.addEventListener("keyup", this.onKeyUp);
				window.addEventListener("resize", this.onResize);
				window.addEventListener("keydown", this.onKeyDown);
			},
			WILL_UNMOUNT: () => {
				// @ts-ignore
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
			"seperator" as "seperator",
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
			"seperator" as "seperator",
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
						<Image key={index} source={file.url} offset={{ margin: { all: "auto" } }} constraint={{ width: this.state.width, height: file.height / (file.width / window.innerWidth.clamp(0, this.state.width)), minimum: { width: app.min_width * 0.75 }, maximum: { width: 100.0 + "%" } }} decoration={{ color: Color.pick(3.0), shadow: [{ x: -4.5, y: 0, blur: 4.5, spread: -4.5, color: Color.pick(1.0) }, { x: 4.5, y: 0, blur: 4.5, spread: -4.5, color: Color.pick(1.0) }] }}></Image>
					);
				})}
			</section>
		);
	}
	protected visible() {
		return structure("tabs").page.element.props["data-key"] === (this.props as any)["data-key"];
	}
	protected discord() {
		// skip
		if (!this.visible()) return;

		discord.update({ state: "Reading (" + this.props.gallery + ")", details: this.state.gallery.title, partyMax: undefined, partySize: undefined });
	}
	@autobind()
	protected async onRender() {
		// skip
		if (!this.visible()) return;
		// discordRPC
		this.discord();

		if (this.state.init) return;
		// silent update
		this.state.init = true;

		const _gallery = await gallery(this.props.gallery);
		const _files = await _gallery.files();

		await this.setState((state) => ({ gallery: { title: _gallery.title, files: _files } }));
	}
	@autobind()
	protected async onWheel(event: WheelEvent) {
		// skip
		if (!this.visible()) return;
		if (!this.state.control) return;

		await this.setState((state) => ({ width: (state.width - event.deltaY).clamp(app.min_width * 0.75, window.innerWidth) }));
	}
	@autobind()
	protected async onKeyUp(event: KeyboardEvent) {
		// skip
		if (!this.visible()) return;
		if (event.key !== "Control") return;
		// silent update
		this.state.control = false;
	}
	@autobind()
	protected async onResize(event: UIEvent) {
		// skip
		if (!this.visible()) return;
		// re-render
		this.setState((state) => ({}));
	}
	@autobind()
	protected async onKeyDown(event: KeyboardEvent) {
		// skip
		if (!this.visible()) return;
		if (event.key !== "Control") return;
		// silent update
		this.state.control = true;
	}
}

export default Viewer;
