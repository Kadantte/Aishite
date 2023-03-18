/** target: `method`. */
function writable(value: boolean) {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		// type checking
		if (typeof descriptor.value !== "function") throw new Error(`Could not to decorate given method. ${key} is type of ${typeof descriptor.value}.`);

		descriptor.writable = value;
	};
}

/** target: `method`. */
function enumerable(value: boolean) {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		// type checking
		if (typeof descriptor.value !== "function") throw new Error(`Could not to decorate given method. ${key} is type of ${typeof descriptor.value}.`);

		descriptor.enumerable = value;
	};
}

/** target: `method`. */
function configurable(value: boolean) {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		// type checking
		if (typeof descriptor.value !== "function") throw new Error(`Could not to decorate given method. ${key} is type of ${typeof descriptor.value}.`);

		descriptor.configurable = value;
	};
}

Object.defineProperty(window, "writable", { value: writable });
Object.defineProperty(window, "enumerable", { value: enumerable });
Object.defineProperty(window, "configurable", { value: configurable });

/** target: `method`. */
function autobind() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		// type checking
		if (typeof descriptor.value !== "function") throw new Error(`Could not to decorate given method. ${key} is type of ${typeof descriptor.value}.`);

		return {
			get() {
				const value = descriptor.value.bind(this);

				Object.defineProperty(this, key, { value: value });

				return value;
			}
		};
	};
}

/** target: `method`. */
function deprecated() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		// type checking
		if (typeof descriptor.value !== "function") throw new Error(`Could not to decorate given method. ${key} is type of ${typeof descriptor.value}.`);

		descriptor.value = inject(descriptor.value, () => print(`The method <${target.constructor.name}> ${key} is deprecated.`));
	};
}

Object.defineProperty(window, "autobind", { value: autobind });
Object.defineProperty(window, "deprecated", { value: deprecated });
