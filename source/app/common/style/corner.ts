import Unit from "@/app/common/unit";

interface Corner {
	readonly all?: Unit;
	/** Short for **T**op **L**eft. */
	readonly TL?: Unit;
	/** Short for **T**op **R**ight. */
	readonly TR?: Unit;
	/** Short for **B**oys **L**ove. */
	readonly BL?: Unit;
	/** Short for **B**ottom **R**ight. */
	readonly BR?: Unit;
}

function Corner(style: Corner): React.CSSProperties {
	// check before
	if ((style.all ?? style.TL ?? style.TR ?? style.BL ?? style.BR) === undefined) return {};

	return {
		borderTopLeftRadius: style.TL ?? style.all,
		borderTopRightRadius: style.TR ?? style.all,
		borderBottomLeftRadius: style.BL ?? style.all,
		borderBottomRightRadius: style.BR ?? style.all
	};
}

export default Corner;
