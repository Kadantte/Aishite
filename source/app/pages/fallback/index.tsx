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
				this.onRender();

				structure("tabs").handle(this.onRender);
			},
			WILL_UNMOUNT: () => {
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
		return structure("tabs").peek().element.props["data-key"] === (this.props as typeof this.props & { "data-key": string })["data-key"];
	}
	protected discord() {
		if (!this.visible()) return;
		
		discord.update({ state: "ERROR", details: "something went wrong", partyMax: undefined, partySize: undefined });
	}
	@autobind()
	protected async onRender() {
		if (!this.visible()) return;

		this.discord();
	}
}

export default Fallback;
