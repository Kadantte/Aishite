function unit(value: unit, type = "px") {
	return typeof value === "string" ? value : value + type;
}

export default unit;
