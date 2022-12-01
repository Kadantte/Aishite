const [global, available] = [this, new Set()];

for (const property of ["self", "global", "available", "eval", "console", "onmessage", "postMessage", "Array", "Boolean", "Date", "Function", "Number", "Object", "RegExp", "String", "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "isFinite", "isNaN", "parseFloat", "parseInt", "Infinity", "JSON", "Math", "NaN", "undefined"]) {
	available.add(property);
}

function secure(target, property) {
	// cache
	const descriptor = Object.getOwnPropertyDescriptor(target, property);

	if (descriptor !== undefined && !descriptor.configurable) return;

	Object.defineProperty(target, property, {
		get() {
			throw new Error(`Security Eerror: cannot access ${property}`);
		},
		configurable: false
	});
}

for (const property of Object.getOwnPropertyNames(global)) {
	if (!available.has(property)) secure(global, property);
}

for (const property of Object.getOwnPropertyNames(global.__proto__)) {
	if (!available.has(property)) secure(global.__proto__, property);
}

for (const property of ["fetch"]) {
	secure(global, property); secure(global.__proto__, property);
}

global.addEventListener("message", (event) => {
	// cache
	const { script, variables } = event.data;
	
	for (const [key, value] of Object.entries(variables)) {
		Object.defineProperty(global, key, {
			get() {
				return value;
			},
			configurable: true
		});
	}

	try {
		postMessage(eval("\"use strict\";" + script));
	}
	catch (error) {
		postMessage(error);
	}
});
