// common
import Unit from "@/app/common/unit";
import Style from "@/app/common/style";

type SizeType = "minimum" | "maximum";

class Size extends Style {
	public readonly type?: SizeType;
	public readonly width?: Unit;
	public readonly height?: Unit;

	constructor(args: Args<Size>) {
		super();

		this.type = args.type;
		this.width = args.width;
		this.height = args.height;
	}
	protected compile() {
		return {
			[this.type === "minimum" ? "minWidth" : this.type === "maximum" ? "maxWidth" : "width"]: this.width,
			[this.type === "minimum" ? "minHeight" : this.type === "maximum" ? "maxHeight" : "height"]: this.height,
			flexShrink: (this.width ?? this.height) === undefined ? undefined : this.type === undefined && typeof (this.width ?? this.height) === "string" && /%$/.test((this.width ?? this.height) as string) ? 1.0 : 0.0
		};
	}
}

export default Size;
