import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

import ContextMenu from "@/app/layout/casacade/contextmenu";

// @see https://stackoverflow.com/questions/9126105/blank-image-encoded-as-data-uri
const transparent = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

interface ImageProps extends Props<undefined> {
	readonly source: string;
	// events
	readonly onError?: () => void;
	readonly onLoaded?: () => void;
}

class Image extends Stateless<Omit<ImageProps, ("color" | "image")>> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<ContextMenu items={[
				{
					role: "Copy",
					toggle: true,
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
					toggle: true,
					method: async () => {
						// cache
						const button = document.createElement("a");

						button.href = this.canvas().toDataURL("image/png");
						button.download = "image.png";

						button.click();
					}
				}]}>
				<img id={this.props.id} src={transparent}
					onLoad={(event) => {
						// @ts-ignore
						switch (event.target.src) {
							case transparent: {
								const observer: IntersectionObserver = new IntersectionObserver((entries) => {
									for (const entry of entries) {
										if (entry.isIntersecting) {
											// @ts-ignore
											event.target.src = this.props.source;
											// unobserve
											observer.disconnect();
											break;
										}
									}
								});
								// @ts-ignore
								observer.observe(event.target);
								break;
							}
						}
						this.props.onLoaded?.();
					}}
					onError={(event) => {
						// @ts-ignore
						event.target.src = transparent;

						this.props.onError?.();
					}}
					onDragStart={(event) => {
						// return false do not work properly
						event.preventDefault();
					}}
				/>
			</ContextMenu>
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
}

export default Image;
