import CSS from "csstype";

declare type Global = "inherit" | "initial" | "unset" | "auto";

declare module "csstype" {
	interface Properties {
		WebkitAppRegion?: Global | "drag" | "no-drag";
	}
}
