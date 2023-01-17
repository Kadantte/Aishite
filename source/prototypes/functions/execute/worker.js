const [global, available] = [this, new Set()];

for (const name of [
	// variables
	"self",
	"global",
	"available",
	// functions
	"eval",
	"console",
	"onmessage",
	"postMessage",
	// classes
	"Date",
	"Array",
	"Object",
	"Number",
	"String",
	"Boolean",
	"Function",
	"RegExp",
	// errors
	"Error",
	"URIError",
	"EvalError",
	"TypeError",
	"RangeError",
	"SyntaxError",
	"ReferenceError",
	// URI utils
	"decodeURI",
	"decodeURIComponent",
	"encodeURI",
	"encodeURIComponent",
	// type check
	"isNaN",
	"isFinite",
	// type converstion
	"parseInt",
	"parseFloat",
	// libs
	"Math",
	"JSON",
	// values
	"NaN",
	"Infinity",
	"undefined"
]) {
	available.add(name);
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
	for (const [key, value] of Object.entries(event.data.variables)) {
		Object.defineProperty(global, key, {
			get() {
				return value;
			},
			configurable: true
		});
	}
	try {
		postMessage(eval("\"use strict\";" + event.data.script));
	}
	catch (error) {
		postMessage(error);
	}
});
