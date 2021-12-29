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
class DiscordRPC extends StateHandler<{ rpc: RichPresence, secret: string; }> {
	protected connection: boolean = false;
	protected readonly client = new RPC.Client({ transport: "ipc" });

	protected create() {
		// attach function before connecting
		this.client.once("ready", this.update());
		// connect
		this.connect(this.state.secret);
	}
	public get state() {
		return super.state;
	}
	public set state(state: DiscordRPC["_state"]) {
		super.state = state;
	}
	public update(rpc: RichPresence = this.state.rpc, override: boolean = false) {
		if (override) {
			this.state = { ...this.state, rpc: rpc };
		} else {
			this.state = { ...this.state, rpc: new RichPresence({ ...args(this.state), ...args(rpc) } as Args<RichPresence>) };
		}
		// await until
		until(() => this.connection).then(() => this.client.setActivity(this.state));
	}
	public connect(secret: string) {
		// prevent multiple connection
		if (this.connection) throw new Error();
		// connecting hearts!
		this.client.login({ clientId: secret }).then(() => this.connection = true).catch(() => setTimeout(() => this.connect(secret), 1000 * 60));
	}
}

const singleton = new DiscordRPC({
	state: {
		rpc: new RichPresence({
			// lore
			details: "Starting...",
			// large image
			largeImageKey: "icon",
			largeImageText: "Sombian#7940",
			// small image
			smallImageKey: "discord",
			smallImageText: "discord.gg/Gp7tWCe",
			// time elapsed
			startTimestamp: Date.now()
		}),
		secret: "526951055079112724"
	}
});

export default singleton;
