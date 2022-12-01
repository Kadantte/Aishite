export function _inject(before: Function, after: Function) {
	return function reforge() {
		// @ts-ignore
		after.apply(this, arguments);
		// @ts-ignore
		return before.apply(this, arguments);
	}
}

Object.defineProperty(window, "inject", { value: _inject });
