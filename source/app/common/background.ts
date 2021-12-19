import Style from "@/app/common/style";

class Background extends Style {
	public readonly color?: string;
	public readonly image?: string;

	constructor(args: Args<Background>) {
		super();

		this.color = args.color;
		this.image = args.image;
	}
	protected compile() {
		return {
			backgroundSize: "cover",
			backgroundColor: this.color,
			backgroundImage: this.image,
			backgroundPosition: "center"
		};
	}
}

export default Background;
