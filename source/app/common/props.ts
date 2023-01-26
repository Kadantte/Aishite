import CSS from "app/common/styles";

export enum CSSPlus {
	OFFSET = "offset",
	POSITION = "position",
	CONSTRAINT = "constraint",
	DECORATION = "decoration",
}

export enum CSSFlag {
	VISIBLE = "visible",
	DRAGGABLE = "draggable",
}

export namespace Props {
	export interface Clear<C = JSX.Element | Array<JSX.Element>> { 
		// key
		readonly id?: string;
		// optional
		readonly flags?: {
			[CSSFlag.VISIBLE]?: boolean;
			[CSSFlag.DRAGGABLE]?: boolean;
		};
		// dont tell anyone...
		readonly hidden?: {
			[key: string]: unknown;
			style?: React.CSSProperties;
		};
		readonly children?: C;
	}
	
	export interface Style {
		// style
		readonly [CSSPlus.OFFSET]?: {
			readonly margin?: CSS["margin"];
			readonly padding?: CSS["padding"];
		};
		readonly [CSSPlus.POSITION]?: {
			readonly all?: CSS["position"]["all"];
			readonly top?: CSS["position"]["right"];
			readonly left?: CSS["position"]["left"];
			readonly right?: CSS["position"]["right"];
			readonly bottom?: CSS["position"]["bottom"];
		};
		readonly [CSSPlus.CONSTRAINT]?: {
			readonly width?: unit
			readonly height?: unit;
			readonly minimum?: Omit<CSS["size"], "type">;
			readonly maximum?: Omit<CSS["size"], "type">;
		};
		readonly [CSSPlus.DECORATION]?: {
			readonly color?: React.CSSProperties["backgroundColor"];
			readonly image?: React.CSSProperties["backgroundImage"];
			readonly border?: CSS["border"];
			readonly corner?: CSS["corner"];
			readonly shadow?: CSS["shadow"];
			readonly opacity?: number;
		};
	}

	export interface Toggle {
		readonly enable: boolean;
	}
	
	export interface Casacade {
		readonly hidden?: {
			[key: string]: unknown;
		};
		readonly children: JSX.Element | Array<JSX.Element>;
	}
}
