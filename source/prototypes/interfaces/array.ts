interface Array<T> {
	first: T; last: T;

	skip(count: number): Array<T>;
	take(count: number): Array<T>;

	isEmpty: boolean;
	isNotEmpty: boolean;
}

Object.defineProperty(Array.prototype, "first", {
	get() {
		return this[0];
	}
});

Object.defineProperty(Array.prototype, "last", {
	get() {
		return this[this.length - 1];
	}
});

Object.defineProperty(Array.prototype, "skip", {
	value(count: number) {
		if (count <= 0) {
			return this;
		}
		else {
			return this.slice(count);
		}
	}
});

Object.defineProperty(Array.prototype, "take", {
	value(count: number) {
		if (count <= 0) {
			return [];
		}
		else {
			return this.slice(0, count);
		}
	}
});

Object.defineProperty(Array.prototype, "isEmpty", {
	get() {
		return this.length === 0;
	}
});

Object.defineProperty(Array.prototype, "isNotEmpty", {
	get() {
		return this.length !== 0;
	}
});
