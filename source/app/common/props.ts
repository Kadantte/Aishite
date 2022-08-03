import React from "react";

import CSS from "@/app/common/style";
import Unit from "@/app/common/unit";

export interface Clear<C extends Children> {
	readonly id?: string;
	readonly style?: React.CSSProperties;
	readonly custom?: React.CSSProperties;
	readonly visible?: boolean;
	readonly draggable?: boolean;
	readonly children?: C;
}

export interface Props<C extends Children> extends Clear<C> {
	// position
	readonly all?: Unit;
	readonly top?: Unit;
	readonly left?: Unit;
	readonly right?: Unit;
	readonly bottom?: Unit;
	// constraint
	readonly width?: Unit
	readonly height?: Unit;
	readonly minimum?: Omit<CSS["size"], "type">;
	readonly maximum?: Omit<CSS["size"], "type">;
	// offset
	readonly margin?: CSS["margin"];
	readonly padding?: CSS["padding"];
	// behaviour
	// decoration
	readonly color?: React.CSSProperties["backgroundColor"];
	readonly image?: React.CSSProperties["backgroundImage"];
	readonly border?: CSS["border"];
	readonly corner?: CSS["corner"];
	readonly shadow?: CSS["shadow"];
	readonly opacity?: number;
}

export interface FlipFlop<C extends Children> extends Props<C> {
	readonly toggle: boolean;
}

export interface Casacade {
	readonly style?: React.CSSProperties;
	readonly children: Children;
}
