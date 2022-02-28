/* Array */

Object.defineProperty(Array.prototype, "last", {
	get: function () {
		return (this as Array<any>)[(this as Array<any>).length - 1];
	}
});

Object.defineProperty(Array.prototype, "first", {
	get: function () {
		return (this as Array<any>)[0];
	}
});

Object.defineProperty(Array.prototype, "isEmpty", {
	value: function () {
		return (this as Array<any>).length === 0;
	}
});

Object.defineProperty(Array.prototype, "skip", {
	value: function (count: number) {
		if (count <= 0) {
			return this;
		}
		return this.slice(count);
	}
});

Object.defineProperty(Array.prototype, "take", {
	value: function (count: number) {
		if (count <= 0) {
			return [];
		}
		return this.slice(0, count);
	}
});

Object.defineProperty(Array.prototype, "add", {
	value: function <T>(...items: T[]) {
		for (const item of items) {
			this[this.length] = item;
		}
		return this;
	}
});

Object.defineProperty(Array.prototype, "remove", {
	value: function <T>(...items: T[]) {
		for (const item of items) {
			for (let index = 0; index < this.length; index++) {
				if (this[index] === item) {
					delete this[index];
				}
			}
		}
		return this;
	}
});

/* ArrayBuffer */

Object.defineProperty(ArrayBuffer.prototype, "skip", {
	value: function (count: number) {
		if (count <= 0) {
			return this;
		}
		return this.slice(count);
	}
});

Object.defineProperty(ArrayBuffer.prototype, "take", {
	value: function (count: number) {
		if (count <= 0) {
			return [];
		}
		return this.slice(0, count);
	}
});

/* Number */

Object.defineProperty(Number.prototype, "clamp", {
	value: function (minimum: number, maximum: number) {
		return Math.min(Math.max(this as number, minimum), maximum);
	}
});

Object.defineProperty(Number.prototype, "truncate", {
	value: function () {
		return Math.trunc(this as number);
	}
});

Object.defineProperty(Number.prototype, "absolute", {
	value: function () {
		return Math.abs(this as number);
	}
});

/* RegExp */

Object.defineProperty(RegExp.prototype, "match", {
	value: function (string: string) {
		if (this.test(string)) {
			return new (class RegExpCapture {
				protected readonly collection: Nullable<Array<string>>;
	
				constructor(args: RegExp) {
					this.collection = args.exec(string);
				}
				public group(index: number) {
					if (this.collection) {
						return this.collection[index] ?? null;
					}
					return null;
				}
			})(this);
		}
		return null;
	}
});

/* Global */

Object.defineProperty(window, "until", {
	value: function (condition: () => boolean, duration: number = 100) {
		return new Promise<void>(async (resolve, reject) => {
			(function recursive() {
				if (condition()) {
					return resolve();
				}
				setTimeout(() => {
					return recursive();
				}, duration);
			})();
		});
	}
});

Object.defineProperty(window, "inject", {
	value: function (before: Method, after: Method) {
		return function () {
			// @ts-ignore
			after.apply(this, arguments);
			// @ts-ignore
			return before.apply(this, arguments);
		}
	}
});

Object.defineProperty(window, "random", {
	value: function (minimum: number, maximum: number) {
		return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
	}
});

Object.defineProperty(window, "calculate", {
	value: function (expression: string) {
		return "calc(" + expression + ")";
	}
});
