import React from "react";

import Unit from "@/app/common/unit";

import Size from "@/app/common/style/size";
import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";

export interface Clear<C extends Children> {
	readonly id?: string;
	readonly style?: React.CSSProperties;
	readonly override?: React.CSSProperties;
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
	readonly minimum?: Omit<Size, "type">;
	readonly maximum?: Omit<Size, "type">;
	// offset
	readonly margin?: Margin;
	readonly padding?: Padding;
	// behaviour
	// decoration
	readonly color?: React.CSSProperties["backgroundColor"];
	readonly image?: React.CSSProperties["backgroundImage"];
	readonly border?: Parameters<typeof Border>[0];
	readonly corner?: Parameters<typeof Corner>[0];
	readonly shadow?: Parameters<typeof Shadow>[0];
	readonly opacity?: number;
}

export interface FlipFlop<C extends Children> extends Props<C> {
	readonly toggle: boolean;
}

export interface Casacade {
	readonly style?: React.CSSProperties;
	readonly override?: Record<string, unknown>;
	readonly children: Children;
}
