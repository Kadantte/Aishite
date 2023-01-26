interface Buffer {
	isEmpty: boolean;
	isNotEmpty: boolean;
}

Object.defineProperty(Buffer.prototype, "skip", {
	value(count: number) {
		if (count <= 0) {
			return this;
		}
		else {
			return this.slice(count);
		}
	}
});

Object.defineProperty(Buffer.prototype, "take", {
	value(count: number) {
		if (count <= 0) {
			return [];
		}
		else {
			return this.slice(0, count);
		}
	}
});
