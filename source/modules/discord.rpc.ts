// @ts-ignore
import * as RPC from "discord-rpc";
// states
import { StateHandler } from "@/states";

/** @see https://discord.com/developers/docs/rich-presence/how-to */
class RichPresence {
	public state?: string;
	public details: string;
	public startTimestamp?: number;
	public endTimestamp?: number;
	public largeImageKey?: string;
	public largeImageText?: string;
	public smallImageKey?: string;
	public smallImageText?: string;
	public partyId?: string;
	public partySize?: number;
	public partyMax?: number;
	public matchSecret?: string;
	public spectateSecret?: string;
	public joinSecret?: string;
	public instance?: boolean;

	constructor(args: Args<RichPresence>) {
		this.state = args.state;
		this.details = args.details;
		this.startTimestamp = args.startTimestamp;
		this.endTimestamp = args.endTimestamp;
		this.largeImageKey = args.largeImageKey;
		this.largeImageText = args.largeImageText;
		this.smallImageKey = args.smallImageKey;
		this.smallImageText = args.smallImageText;
		this.partyId = args.partyId;
		this.partySize = args.partySize;
		this.partyMax = args.partyMax;
		this.spectateSecret = args.spectateSecret;
		this.joinSecret = args.joinSecret;
		this.instance = args.instance;
	}
}

function args(table: Record<string, any>) {
	const object: Record<string, any> = {};

	for (const key of Object.keys(table)) {
		switch (table[key]) {
			case undefined: {
				break;
			}
			default: {
				object[key] = table[key];
				break;
			}
		}
	}
	return object;
}

/** @see https://discord.com/developers/applications/{application_id}/information */
class DiscordRPC extends StateHandler<RichPresence> {
	protected available: boolean;
	protected readonly client = new RPC.Client({ transport: "ipc" });

	constructor(args: {
		state: DiscordRPC["_state"];
		secret: string;
	}) {
		super({ state: args.state });

		this.available = false;

		this.client.once("ready", () => {
			this.update();
		});
		this.connect(args.secret);
	}
	public get state() {
		return super.state;
	}
	public set state(state: DiscordRPC["_state"]) {
		super.state = state;
	}
	public update(presence: RichPresence = this.state, preserve: boolean = true) {
		if (preserve) {
			this.state = new RichPresence({ ...args(this.state), ...args(presence) } as RichPresence);
		} else {
			this.state = presence;
		}
		if (this.available) {
			this.client.setActivity(this.state);
		}
	}
	protected connect(secret: string) {
		if (this.available) {
			throw new Error();
		}
		this.client.login({ "clientId": secret }).then(() => {
			this.available = true;
		}).catch(() => {
			setTimeout(() => {
				this.connect(secret);
			}, 1000 * 60);
		});
	}
}

const singleton = new DiscordRPC({
	state: new RichPresence({
		details: "Starting...",
		startTimestamp: Date.now(),
		largeImageKey: "icon",
		largeImageText: "Sombian#7940",
		smallImageKey: "discord",
		smallImageText: "discord.gg/Gp7tWCe"
	}),
	secret: "526951055079112724"
});

export default singleton;
