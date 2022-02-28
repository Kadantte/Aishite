// common
import Unit from "@/app/common/unit";
import Style from "@/app/common/style";

class Corner extends Style {
	public readonly all?: Unit;
	/** Short for **T**op **L**eft. */
	public readonly TL?: Unit;
	/** Short for **T**op **R**ight. */
	public readonly TR?: Unit;
	/** Short for **B**oys **L**ove. */
	public readonly BL?: Unit;
	/** Short for **B**ottom **R**ight. */
	public readonly BR?: Unit;

	constructor(args: Args<Corner>) {
		super();

		this.all = args.all;
		this.TL = args.TL;
		this.TR = args.TR;
		this.BL = args.BL;
		this.BR = args.BR;
	}
	protected compile() {
		return {
			borderTopLeftRadius: this.TL ?? this.all,
			borderTopRightRadius: this.TR ?? this.all,
			borderBottomLeftRadius: this.BL ?? this.all,
			borderBottomRightRadius: this.BR ?? this.all
		};
	}
}

export default Corner;
