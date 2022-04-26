// @ts-ignore
import * as RPC from "discord-rpc";

import { StateHandler } from "@/manager";

/** @see https://discord.com/developers/docs/rich-presence/how-to */
interface RichPresence {
	readonly state?: string;
	readonly details: string;
	readonly startTimestamp?: number;
	readonly endTimestamp?: number;
	readonly largeImageKey?: string;
	readonly largeImageText?: string;
	readonly smallImageKey?: string;
	readonly smallImageText?: string;
	readonly primaryButton?: { readonly label: string; readonly url?: string; };
	readonly secondaryButton?: { readonly label: string; readonly url?: string; };
	readonly partyId?: string;
	readonly partySize?: number;
	readonly partyMax?: number;
	readonly matchSecret?: string;
	readonly spectateSecret?: string;
	readonly joinSecret?: string;
	readonly instance?: boolean;
}

/** @see https://discord.com/developers/docs/topics/rpc#setactivity */
function RichPresence(activity: RichPresence) {
	// cache
	const buttons = [activity.primaryButton, activity.secondaryButton].filter((button) => button);

	return {
		pid: process.pid,
		activity: {
			state: activity.state,
			details: activity.details,
			timestamps: {
				start: activity.startTimestamp,
				end: activity.endTimestamp
			},
			assets: {
				large_image: activity.largeImageKey,
				large_text: activity.largeImageText,
				small_image: activity.smallImageKey,
				small_text: activity.smallImageText,
			},
			party: {
				id: activity.partyId,
				size: activity.partySize && activity.partyMax ? [activity.partySize, activity.partyMax] : undefined
			},
			buttons: buttons.isEmpty() ? undefined : buttons,
			secrets: buttons.isEmpty() ? { join: activity.joinSecret, spectate: activity.spectateSecret, match: activity.matchSecret } : undefined,
			instance: activity.instance
		}
	};
}

/** @see https://discord.com/developers/applications/{application_id}/information */
class DiscordRPC extends StateHandler<{ activity: RichPresence, token: string; }> {
	protected connection: boolean = false;
	protected readonly client = new RPC.Client({ transport: "ipc" });

	protected create() {
		until(() => this.client !== null).then(() => {
			// attach function before connecting
			this.client.on("ready", () => {
				this.connection = true;
			});
			// @ts-ignore
			this.client.transport.once("close", () => {
				this.connection = false;
				// reconnect
				this.connect(this.state.token);
			});
			// connect
			this.connect(this.state.token);
		});
	}
	public get state() {
		return super.state;
	}
	public set state(state: DiscordRPC["_state"]) {
		super.state = state;
	}
	public update(activity: RichPresence = this.state.activity, override: boolean = false) {
		// conditional override
		this.state = { ...this.state, activity: Object.assign(override ? {} : this.state.activity, activity) };
		// @ts-ignore
		until(() => this.connection).then(() => this.client.request("SET_ACTIVITY", RichPresence(this.state.activity)));
	}
	public connect(secret: string) {
		// prevent multiple connection
		if (this.connection) throw new Error();
		// connecting hearts!
		this.client.login({ clientId: secret }).then(() => this.update()).catch(() => setTimeout(() => this.connect(secret), 1000 * 60));
	}
}

const singleton = new DiscordRPC({
	state: {
		activity: {
			// lore
			details: "Starting...",
			// large image
			largeImageKey: "icon",
			largeImageText: "Made by Sombian#7940",
			// small image
			smallImageKey: "discord",
			smallImageText: "https://discord.gg/U8SRTpnwvg",
			// buttons
			primaryButton: {
				label: "Get Aishite for FREE!",
				url: "https://github.com/Any-Material/Aishite"
			},
			// time elapsed
			startTimestamp: Date.now()
		},
		token: "526951055079112724"
	}
});

export default singleton;
