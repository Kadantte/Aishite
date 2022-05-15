export class Pair<T1, T2> {
	constructor(
		public readonly first: T1,
		public readonly second: T2
	) {
		// TODO: none
	}
	public toList() {
		return [this.first, this.second];
	}
	public toString() {
		return this.toList().toString();
	}
}
