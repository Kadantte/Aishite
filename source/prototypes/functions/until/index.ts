export function _until(condition: () => boolean, duration: number = 100) {
	return new Promise<void>((resolve, reject) => {
		(function recursive() {
			if (condition()) {
				return resolve();
			}
			setTimeout(() => recursive(), duration);
		})();
	});
}

Object.defineProperty(window, "until", { value: _until });
