type Unit = (number | string | "inherit" | "initial" | "unset" | "auto");

function Unit(value: number | string, type: string = "px") {
	return typeof value === "string" ? value : value + type;
}

export default Unit;
