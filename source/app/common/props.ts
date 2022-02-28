// common
import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
import React from "react";

export class Props<C extends Children> {
	public readonly id?: string;
	public readonly size?: {
		minimum?: ConstructorParameters<typeof Size>[0];
		maximum?: ConstructorParameters<typeof Size>[0];
	};
	/** DO NOT MODIFY UNLESS CERTAIN. */
	public readonly style?: React.CSSProperties;
	public readonly width?: Unit
	public readonly height?: Unit;
	public readonly visible?: boolean;
	public readonly override?: React.CSSProperties;
	/** DO NOT MODIFY UNLESS CERTAIN. */
	public readonly children?: C;

	constructor(args: Props<C>) {
		this.id = args.id;
		this.size = args.size;
		this.width = args.width;
		this.height = args.height;
		this.visible = args.visible;
		this.override = args.override;
		this.style = args.style;
		this.children = args.children;
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
	public readonly modify?: Record<string, any>;
	@required
	public readonly children: Children;

	constructor(args: Casacade) {
		this.style = args.style;
		this.modify = args.modify;
		this.children = args.children;
	}
}
