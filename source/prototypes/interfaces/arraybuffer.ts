interface ArrayBuffer {
	isEmpty: boolean;
	isNotEmpty: boolean;
}

Object.defineProperty(ArrayBuffer.prototype, "skip", {
	value(count: number) {
		if (count <= 0) {
			return this;
		}
		else {
			return this.slice(count);
		}
	}
});

Object.defineProperty(ArrayBuffer.prototype, "take", {
	value(count: number) {
		if (count <= 0) {
			return [];
		}
		else {
			return this.slice(0, count);
		}
	}
});
