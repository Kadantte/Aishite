export class Tag {
	readonly key: string;
	readonly value: any;

	constructor(args: Args<Tag>) {
		this.key = args.key;
		this.value = args.value;
	}
	public toString() {
		return `${this.key} = ${typeof this.value === "string" ? "\"" + this.value + "\"" : this.value}`;
	}
}
