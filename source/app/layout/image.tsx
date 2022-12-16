import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import structure from "handles/index";

// @see https://stackoverflow.com/questions/9126105/blank-image-encoded-as-data-uri
const transparent = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

interface ImageProps extends Props.Clear<undefined>, Props.Style {
	// required
	readonly source: string;
	// events
	readonly onLoad?: VoidFunction;
	readonly onError?: VoidFunction;
}

interface ImageState {
	loaded: boolean;
}

class Image extends Stateful<ImageProps, ImageState> {
	protected create(): ImageState {
		return {
			loaded: false
		};
	}
	protected events() {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<img id={this.props.id ?? "image"} src={transparent} draggable={false}
				onLoad={(event) => {
					// @ts-ignore
					if (event.target.src === transparent) {
						// dont load unless visible in viewport
						const observer: IntersectionObserver = new IntersectionObserver((entries) => {
							for (const entry of entries) {
								// skip
								if (!entry.isIntersecting) break;
								// @ts-ignore
								event.target.src = this.props.source;
								// stop
								observer.disconnect();
							}
						});
						// @ts-ignore
						observer.observe(event.target);
					}
					else {
						// update
						this.state.loaded = true;

						if (structure("ctm").state.id === this.props.source) {
							// refresh ctm
							this.contextmenu(structure("ctm").state.x, structure("ctm").state.y);
						}

						this.props.onLoad?.();
					}

				}}
				onError={(event) => {
					// @ts-ignore
					event.target.src = transparent;

					this.props.onError?.();
				}}
				onContextMenu={(event) => {
					this.contextmenu(event.pageX, event.pageY);
				}}
			/>
		);
	}
	protected canvas() {
		// cache
		const image = this.node<HTMLImageElement>();
		const canvas = document.createElement("canvas");

		canvas.width = image.width;
		canvas.height = image.height;

		const context = canvas.getContext("2d");

		context?.drawImage(image, 0, 0);

		return canvas;
	}
	protected contextmenu(x: number, y: number) {
		structure("ctm").state = {
			id: this.props.source,
			x: x,
			y: y,
			items: [{
				role: "Copy",
				toggle: this.state.loaded,
				method: async () => {
					// cache
					const blob = await new Promise<Blob>((resolve, reject) => this.canvas().toBlob((blob) => resolve(blob!)));

					navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
				}
			},
			{
				role: "Copy Link",
				toggle: true,
				method: async () => {
					// clipboard
					navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([this.props.source], { type: "text/plain" }) })]);
				}
			},
				"seperator",
			{
				role: "Save image as",
				toggle: this.state.loaded,
				method: async () => {
					// cache
					const button = document.createElement("a");

					button.href = this.canvas().toDataURL("image/png");
					button.download = "image.png";

					button.click();
				}
			}]
		};
	}
}

export default Image;
