export abstract class StateHandler<S> {
	private _state: S;
	private readonly _event = new EventTarget();

	constructor(state: S) {
		this._state = state;
		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: S) {
		// prevent shallow-copy
		if (this._state === state) throw new Error("Shallow-copy is not allowed");

		const callback = new StateCallback({ pre: this._state, post: state });

		this._state = state;

		print(callback);

		this._event.dispatchEvent(new CustomEvent("handle", { detail: callback }));
	}
	public handle(handle: (event: Event & { detail: StateCallback<S> }) => void) {
		this._event.addEventListener("handle", handle as EventListener);
	}
	public unhandle(handle: (event: Event & { detail: StateCallback<S> }) => void) {
		this._event.removeEventListener("handle", handle as EventListener);
	}
	protected abstract create(): void;
}

class StateCallback<S> {
	public readonly pre: S;
	public readonly post: S;

	constructor(args: StateCallback<S>) {
		this.pre = args.pre;
		this.post = args.post;
	}
}

export abstract class MappedStateHandler<K, V> {
	private _state: Map<K, V>;
	private readonly _event: EventTarget;

	constructor(state: MappedStateHandler<K, V>["_state"]) {
		this._state = state;
		this._event = new EventTarget();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: MappedStateHandler<K, V>["_state"]) {
		// prevent shallow-copy
		if (this._state === state) throw new Error("Shallow-copy is not allowed");

		this._state = state;

		this._event.dispatchEvent(new CustomEvent("handle", { detail: null }));
	}
	public modify(key: K, value?: V, extension?: (unsafe: MappedStateHandler<K, V>["_state"]) => void) {
		// prevent shallow-copy
		if (this._state.get(key) === value) throw new Error("Shallow-copy is not allowed");

		const callback = new MappedStateCallback<K, V>({ key: key, value: value, state: this._state });

		if (value === undefined) {
			this._state.delete(key);
		}
		else {
			this._state.set(key, value);
		}
		extension?.(this._state);

		print(callback);

		this._event.dispatchEvent(new CustomEvent("handle", { detail: callback }));
	}
	@deprecated()
	public notify(key: K, value?: V) {
		//
		// nested objects may want to share same instance but still informs property changes
		//
		const callback = new MappedStateCallback<K, V>({ key: key, value: value, state: this._state });

		print(callback);

		this._event.dispatchEvent(new CustomEvent("handle", { detail: callback }));
	}
	public handle(handle: (event: Event & { detail: MappedStateCallback<K, V> }) => void) {
		this._event.addEventListener("handle", handle as EventListener);
	}
	public unhandle(handle: (event: Event & { detail: MappedStateCallback<K, V> }) => void) {
		this._event.removeEventListener("handle", handle as EventListener);
	}
	protected abstract create(): void;
}

class MappedStateCallback<K, V> {
	public readonly key: K;
	public readonly value?: V;
	public readonly state: Map<K, V>;

	constructor(args: MappedStateCallback<K, V>) {
		this.key = args.key;
		this.value = args.value;
		this.state = args.state;
	}
}

import ctm from "handles/ctm";
import tabs from "handles/tabs";
// import options from "handles/options";

function structure(namespace: "ctm"): typeof ctm;
function structure(namespace: "tabs"): typeof tabs;
// function structure(namespace: "options"): typeof options;

function structure(namespace: string) {
	switch (namespace) {
		case "ctm": {
			return ctm;
		}
		case "tabs": {
			return tabs;
		}
		// case "options": {
		// 	return options;
		// }
		default: {
			throw new Error();
		}
	}
}

export default structure;
