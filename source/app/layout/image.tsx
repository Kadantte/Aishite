import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

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
		);
	}
}

export default Image;
