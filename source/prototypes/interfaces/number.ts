interface Number {
	clamp(minimum: number, maximum: number): number;
}

Object.defineProperty(Number.prototype, "clamp", {
	value(minimum: number, maximum: number) {
		return Math.min(Math.max(this, minimum), maximum);
	}
});
