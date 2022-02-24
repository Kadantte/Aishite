// common
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

const transparent = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

class ImageProps extends Props<undefined> {
	public readonly source: string;
	public readonly width?: number;
	public readonly height?: number;
	// events
	public readonly onError?: (callback: Image) => void;
	public readonly onLoaded?: (callback: Image) => void;

	constructor(args: Args<ImageProps>) {
		super(args);

		this.source = args.source;
		this.width = args.width;
		this.height = args.height;
		this.onError = args.onError;
		this.onLoaded = args.onLoaded;
	}
}

class Image extends Stateless<ImageProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<img id={this.props.id} src={transparent} width={this.props.width} height={this.props.height}
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
							// observe
							observer.observe(event.target as HTMLImageElement);
							break;
						}
					}
				}}
				onError={(event) => {
					// @ts-ignore
					event.target.src = transparent;
				}}
			/>
		);
	}
}

export default Image;
