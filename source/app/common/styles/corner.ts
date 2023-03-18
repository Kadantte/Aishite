interface Corner {
	readonly all?: unit;
	/** short for **T**op **L**eft. */
	readonly TL?: unit;
	/** short for **T**op **R**ight. */
	readonly TR?: unit;
	/** short for **B**oys **L**ove. */
	readonly BL?: unit;
	/** short for **B**ottom **R**ight. */
	readonly BR?: unit;
}

function corner(style: Corner): React.CSSProperties {
	if ((style.all ?? style.TL ?? style.TR ?? style.BL ?? style.BR) === undefined) return {};

	return {
		borderTopLeftRadius: style.TL ?? style.all,
		borderTopRightRadius: style.TR ?? style.all,
		borderBottomLeftRadius: style.BL ?? style.all,
		borderBottomRightRadius: style.BR ?? style.all
	};
}

export default corner;
