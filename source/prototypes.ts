// String

Object.defineProperty(String.prototype, "isEmpty", {
	value: function () {
		return (this as string).length === 0;
	}
});

// Number

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

Object.defineProperty(Set.prototype, "isEmpty", {
	value: function () {
		return (this as Set<unknown>).size === 0;
	}
})

// Array

Object.defineProperty(Array.prototype, "last", {
	get: function () {
		return (this as Array<unknown>)[(this as Array<unknown>).length - 1];
	}
});

Object.defineProperty(Array.prototype, "first", {
	get: function () {
		return (this as Array<unknown>)[0];
	}
});

Object.defineProperty(Array.prototype, "isEmpty", {
	value: function () {
		return (this as Array<unknown>).length === 0;
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
	value: function <T>(...items: Array<T>) {
		for (const item of items) {
			this[this.length] = item;
		}
		return this;
	}
});

Object.defineProperty(Array.prototype, "remove", {
	value: function <T>(...items: Array<T>) {
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

// ArrayBuffer

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

// DataView

Object.defineProperty(DataView.prototype, "getUint64", {
	value: function (offset: number, endian: boolean) {
		const first = this.getUint32(offset, endian);
		const second = this.getUint32(offset + 4, endian);
		
		return endian ? first + 2 ** 32 * second : 2 ** 32 * first + second;
	}	
});

// Global

Object.defineProperty(window, "print", {
	value: console.debug
})

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
	value: function (before: Function, after: Function) {
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

var times = 0;

Object.defineProperty(window, "nullsafe", {
	value: function (target: Record<string, unknown>) {
		times++;
		for (const [key, value] of Object.entries(target)) {
			if (value === undefined) {
				delete target[key];
			}
		}
		return target;
	}
})
