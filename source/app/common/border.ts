// common
import Unit from "@/app/common/unit";
import Style from "@/app/common/style";

class Border extends Style {
	public readonly all?: Parameters<typeof compiler>;
	public readonly top?: Parameters<typeof compiler>;
	public readonly left?: Parameters<typeof compiler>;
	public readonly right?: Parameters<typeof compiler>;
	public readonly bottom?: Parameters<typeof compiler>;

	constructor(args: Args<Border>) {
		super();

		this.all = args.all;
		this.top = args.top;
		this.left = args.left;
		this.right = args.right;
		this.bottom = args.bottom;
	}
	protected compile() {
		return {
			border: this.all ? compiler(...this.all) : undefined,
			borderTop: this.top ? compiler(...this.top) : undefined,
			borderLeft: this.left ? compiler(...this.left) : undefined,
			borderRight: this.right ? compiler(...this.right) : undefined,
			borderBottom: this.bottom ? compiler(...this.bottom) : undefined,
		};
	}
}

function compiler(width: number, style?: React.CSSProperties["borderStyle"], color?: string) {
	return [Unit(width), style ?? "hidden", color ?? "transparent"].join("\u0020");
}

export default Border;
