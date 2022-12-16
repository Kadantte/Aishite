import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import Text from "app/layout/text";
import Center from "app/layout/center";

import discord from "modules/discord";

import structure from "handles/index";

interface FallbackProps extends Props.Clear<undefined> {
	// TODO: none
}

interface FallbackState {
	// TODO: none
}

class Fallback extends Stateful<FallbackProps, FallbackState> {
	protected create() {
		return {};
	}
	protected events() {
		return {
			DID_MOUNT: () => {
				// initial
				this.onRender();
				// @ts-ignore
				structure("tabs").handle(this.onRender);
			},
			WILL_UNMOUNT: () => {
				// @ts-ignore
				structure("tabs").unhandle(this.onRender);
			}
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Center {...this.props} id={this.props.id ?? "fallback"} x={true} y={true}>
				<Text>{[{ value: "OPS, SOMETHING WENT WRONG" }]}</Text>
			</Center>
		);
	}
	protected visible() {
		return structure("tabs").page.element.props["data-key"] === (this.props as any)["data-key"];
	}
	protected discord() {
		// skip
		if (!this.visible()) return;
		
		discord.update({ state: "ERROR", details: "something went wrong", partyMax: undefined, partySize: undefined });
	}
	@autobind()
	protected async onRender() {
		// skip
		if (!this.visible()) return;
		// discordRPC
		this.discord();
	}
}

export default Fallback;
