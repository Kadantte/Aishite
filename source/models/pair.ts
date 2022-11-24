export class Pair<T1, T2 = T1> {
	constructor(
		public readonly first: T1,
		public readonly second: T2
	) {
		// TODO: none
	}
	public* [Symbol.iterator]() {
		yield this.first;
		yield this.second;
	}
	public toList(): [T1, T2] {
		return [this.first, this.second];
	}
	public toString() {
		return this.toList().toString();
	}
}
