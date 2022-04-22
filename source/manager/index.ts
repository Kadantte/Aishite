export class StateHandler<State> {
	private _state: State;
	private readonly _UUID: number;
	private readonly _event: EventTarget;

	constructor(args: { state: State }) {
		this._state = args.state;
		this._UUID = random(0, 6974);
		this._event = new EventTarget();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: State) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (state === this._state) throw new ReferenceError("Shallow-copy is not allowed");

		const callback = new StateCallback<State>({ before: this._state, after: state });

		this._state = state;

		print(callback);

		this._event.dispatchEvent(new CustomEvent(this._UUID.toString(), { detail: callback }));
	}
	protected create(): void {
		print("This class has default class constructor");
	}
	public handle(callback: (state: StateCallback<State>) => void) {
		this._event.addEventListener(this._UUID.toString(), (event) => (callback((event as Event & { detail: StateCallback<State> }).detail)));
	}
}

class StateCallback<State> {
	public readonly before: State;
	public readonly after: State;

	constructor(args: StateCallback<State>) {
		this.before = args.before;
		this.after = args.after;
	}
}

export class MappedStateHandler<Key, Value> {
	private _state: Map<Key, Value>;
	private readonly _UUID: number;
	private readonly _event: EventTarget;

	constructor(args: { state: Map<Key, Value> }) {
		this._state = args.state;
		this._UUID = random(0, 6974);
		this._event = new EventTarget();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: Map<Key, Value>) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state === state) throw new ReferenceError("Shallow-copy is not allowed");

		this._state = state;

		this._event.dispatchEvent(new CustomEvent(this._UUID.toString(), { detail: null }));
	}
	protected create(): void {
		print("This class has default class constructor");
	}
	public modify(key: Key, value: Nullable<Value>, extension?: (unsafe: Map<Key, Value>) => void) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state.get(key) === value) throw new ReferenceError("Shallow-copy is not allowed");

		const callback = new MappedStateCallback<Key, Value>({ key: key, value: value, state: this._state });

		if (value === null) {
			this._state.delete(key);
		} else {
			this._state.set(key, value);
		}
		extension?.(this._state);

		print(callback);

		this._event.dispatchEvent(new CustomEvent(this._UUID.toString(), { detail: callback }));
	}
	@deprecated()
	public notify(key: Key, value: Nullable<Value>) {
		//
		// nested objects may want to share same instance but still informs property changes
		//
		const callback = new MappedStateCallback<Key, Value>({ key: key, value: value, state: this._state });

		print(callback);

		this._event.dispatchEvent(new CustomEvent(this._UUID.toString(), { detail: callback }));
	}
	public handle(callback: (state: MappedStateCallback<Key, Value>) => void) {
		this._event.addEventListener(this._UUID.toString(), (event) => (callback((event as Event & { detail: MappedStateCallback<Key, Value> }).detail)));
	}
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
