export class Tag {
	readonly namespace: string;
	readonly value: string;

	constructor(args: Args<Tag>) {
		this.namespace = args.namespace;
		this.value = args.value;
	}
	public toString() {
		return `${this.namespace}("${this.value}")`;
	}
}
