function unit(value: unit, type: string = "px") {
	return typeof value === "string" ? value : value + type;
}

export default unit;
