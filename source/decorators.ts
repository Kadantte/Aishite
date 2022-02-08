function final() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		descriptor.writable = false;
		descriptor.configurable = false;
		console.debug(`The method <${target.constructor.name}> ${key} is now sealed.`);
	};
}

function deprecated() {
	function inject(before: Method, after: Method) {
		return function () {
			// @ts-ignore
			after.apply(this, arguments);
			// @ts-ignore
			return before.apply(this, arguments);
		}
	}
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		descriptor.value = inject(descriptor.value, () => console.warn(`The method <${target.constructor.name}> ${key} is deprecated.`));
	};
}

Object.defineProperty(window, "final", { value: final });
Object.defineProperty(window, "deprecated", { value: deprecated });
