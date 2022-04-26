// method
function final() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		descriptor.writable = false;
		descriptor.configurable = false;
		
		print(`The method <${target.constructor.name}> ${key} is now sealed.`);
	};
}
// property
function required(target: any, key: string) {
	function getter() {
		return target[key];
	}
	function setter(value: unknown) {
		target[key] = value;
	}
	Object.defineProperty(target, key, {
		get: getter,
		set: setter,
		enumerable: true,
		configurable: true
	});
}
// method
function deprecated() {
	return function (target: any, key: string, descriptor: PropertyDescriptor) {
		descriptor.value = inject(descriptor.value, () => print(`The method <${target.constructor.name}> ${key} is deprecated.`));
	};
}

Object.defineProperty(window, "final", { value: final });
Object.defineProperty(window, "required", { value: required });
Object.defineProperty(window, "deprecated", { value: deprecated });
