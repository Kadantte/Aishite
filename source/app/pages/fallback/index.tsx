import Page from "@/app/pages";

import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Clear, FlipFlop } from "@/app/common/props";
import { LifeCycle, Stateless } from "@/app/common/framework";

import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";

import Stack from "@/app/layout/casacade/stack";
import Spacer from "@/app/layout/casacade/spacer";
import Transform from "@/app/layout/casacade/transform";

import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";

import discord from "@/modules/discord";

import navigator from "@/manager/navigator";
import Grid from "@/app/layout/grid";
import Container from "@/app/layout/container";
import Element from "@/app/layout/element";
import Read from "@/app/icons/read";

class FallbackProps extends Clear<undefined> {
	constructor(args: Args<FallbackProps>) {
		super(args);
	}
}

class FallbackState {
	public index: number;

	constructor(args: Args<FallbackState>) {
		this.index = args.index;
	}
}

class Fallback extends Page<FallbackProps, FallbackState> {
	protected create() {
		// permanent
		this.handle = this.handle.bind(this);

		return new FallbackState({ index: NaN });
	}
	protected events(): LifeCycle<FallbackProps, FallbackState> {
		return {
			DID_MOUNT: () => {
				// @ts-ignore
				this.handle(null);

				navigator.handle(this.handle);
			},
			WILL_UNMOUNT: () => {
				navigator.unhandle(this.handle);
			}
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build(): Child {
		throw new Error("Method not implemented.");
	}
	protected handle(event: Parameters<Parameters<typeof navigator["handle"]>[0]>[0]) {
		this.discord();
	}
	protected discord(state: boolean = true) {
		if (!this.visible()) return;

		switch (state) {
			case true:
			case false: {
				discord.update({
					state: "IDLE",
					details: "Beep-beep...",
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
}

class CardProps extends FlipFlop<undefined> {
	constructor(args: Args<CardProps>) {
		super(args);
	}
}

class SmallCard extends Stateless<CardProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build(): Child {
		throw new Error("Method not implemented.");
	}
}

class LargeCard extends Stateless<CardProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build(): Child {
		throw new Error("Method not implemented.");
	}
}

export default Fallback;
