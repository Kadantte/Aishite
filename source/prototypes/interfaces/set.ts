interface Set<T> {
	isEmpty: boolean;
	isNotEmpty: boolean;
}

Object.defineProperty(Set.prototype, "isEmpty", {
	get() {
		return this.size === 0;
	}
});

Object.defineProperty(Set.prototype, "isNotEmpty", {
	get() {
		return this.size !== 0;
	}
});
