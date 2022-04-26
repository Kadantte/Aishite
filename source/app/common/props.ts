import React from "react";

import Unit from "@/app/common/unit";

import Size from "@/app/common/style/size";
import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";

export class Clear<C extends Children> {
	public readonly id?: string;
	public readonly style?: React.CSSProperties;
	public readonly override?: React.CSSProperties;
	public readonly visible?: boolean;
	public readonly draggable?: boolean;
	public readonly children?: C;

	constructor(args: Clear<C>) {
		this.id = args.id;
		this.style = args.style;
		this.override = args.override;
		this.visible = args.visible;
		this.draggable = args.draggable;
		this.children = args.children;
	}
}

export class Props<C extends Children> extends Clear<C> {
	// position
	public readonly all?: Unit;
	public readonly top?: Unit;
	public readonly left?: Unit;
	public readonly right?: Unit;
	public readonly bottom?: Unit;
	// constraint
	public readonly width?: Unit
	public readonly height?: Unit;
	public readonly minimum?: Omit<Size, "type">;
	public readonly maximum?: Omit<Size, "type">;
	// offset
	public readonly margin?: Margin;
	public readonly padding?: Padding;
	// behaviour
	// decoration
	public readonly color?: React.CSSProperties["backgroundColor"];
	public readonly image?: React.CSSProperties["backgroundImage"];
	public readonly border?: Parameters<typeof Border>[0];
	public readonly corner?: Parameters<typeof Corner>[0];
	public readonly shadow?: Parameters<typeof Shadow>[0];
	public readonly opacity?: number;

	constructor(args: Props<C>) {
		super(args);
		
		// position
		this.all = args.all;
		this.top = args.top;
		this.left = args.left;
		this.right = args.right;
		this.bottom = args.bottom;
		// constraint
		this.width = args.width;
		this.height = args.height;
		this.minimum = args.minimum;
		this.maximum = args.maximum;
		// offset
		this.margin = args.margin;
		this.padding = args.padding;
		// decoration
		this.color = args.color;
		this.image = args.image;
		this.border = args.border;
		this.corner = args.corner;
		this.shadow = args.shadow;
		this.opacity = args.opacity;
	}
}

export class FlipFlop<C extends Children> extends Props<C> {
	public readonly toggle: boolean;

	constructor(args: FlipFlop<C>) {
		super(args);

		this.toggle = args.toggle;
	}
}

export class Casacade {
	public readonly style?: React.CSSProperties;
	public readonly override?: Record<string, unknown>;
	@required
	public readonly children: Children;

	constructor(args: Casacade) {
		this.style = args.style;
		this.override = args.override;
		this.children = args.children;
	}
}
