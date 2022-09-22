export abstract class StateHandler<State> {
	private _state: State;
	private readonly _event = new EventTarget();

	constructor(state: State) {
		// init
		this._state = state;

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: State) {
		// prevent shallow-copy
		if (this._state === state) throw new Error("Shallow-copy is not allowed");

		const callback = new StateCallback({ before: this._state, after: state });

		this._state = state;

		print(callback);

		this._event.dispatchEvent(new CustomEvent("handle", { detail: callback }));
	}
	public handle(handle: (event: Event & { detail: StateCallback<State> }) => void) {
		this._event.addEventListener("handle", handle as EventListener);
	}
	public unhandle(handle: (event: Event & { detail: StateCallback<State> }) => void) {
		this._event.removeEventListener("handle", handle as EventListener);
	}
	protected abstract create(): void;
}

class StateCallback<State> {
	public readonly before: State;
	public readonly after: State;

	constructor(args: StateCallback<State>) {
		this.before = args.before;
		this.after = args.after;
	}
}

export abstract class MappedStateHandler<Key, Value> {
	private _state: Map<Key, Value>;
	private readonly _event: EventTarget;

	constructor(state: Map<Key, Value>) {
		this._state = state;
		this._event = new EventTarget();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: Map<Key, Value>) {
		// prevent shallow-copy
		if (this._state === state) throw new Error("Shallow-copy is not allowed");

		this._state = state;

		this._event.dispatchEvent(new CustomEvent("handle", { detail: null }));
	}
	public modify(key: Key, value: Nullable<Value>, extension?: (unsafe: Map<Key, Value>) => void) {
		// prevent shallow-copy
		if (this._state.get(key) === value) throw new Error("Shallow-copy is not allowed");

		const callback = new MappedStateCallback<Key, Value>({ key: key, value: value, state: this._state });

		if (value === null) {
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
	public notify(key: Key, value: Nullable<Value>) {
		//
		// nested objects may want to share same instance but still informs property changes
		//
		const callback = new MappedStateCallback<Key, Value>({ key: key, value: value, state: this._state });

		print(callback);

		this._event.dispatchEvent(new CustomEvent("handle", { detail: callback }));
	}
	public handle(handle: (event: Event & { detail: MappedStateCallback<Key, Value> }) => void) {
		this._event.addEventListener("handle", handle as EventListener);
	}
	public unhandle(handle: (event: Event & { detail: MappedStateCallback<Key, Value> }) => void) {
		this._event.removeEventListener("handle", handle as EventListener);
	}
	protected abstract create(): void;
}

class MappedStateCallback<Key, Value> {
	public readonly key: Key;
	public readonly value: Nullable<Value>;
	public readonly state: Map<Key, Value>;

	constructor(args: MappedStateCallback<Key, Value>) {
		this.key = args.key;
		this.value = args.value;
		this.state = args.state;
	}
}
