import node_events from "events";

import React from "react";
import ReactDOM from "react-dom";

import Size from "@/app/common/size";
import { Props, Casacade } from "@/app/common/props";

export class EventManager<T extends (node_events.EventEmitter & any) | EventTarget | (Stateful<Props<any>, {}>["handler"])> {
	constructor(
		public readonly self: T,
		public readonly event: T extends node_events.EventEmitter ? string : T extends { addEventListener(type: infer K, listener: (...args: Array<unknown>) => any, options?: unknown): void } ? K : keyof T,
		public readonly handler: T extends node_events.EventEmitter ? Method : T extends EventTarget ? Method : T[keyof T]
	) {
		// TODO: none
	}
}

export abstract class Stateful<P extends Props<any>, S> extends React.Component<P, S> {
	/** DO NOT MODIFY THIS DIRECTLY. */
	public state: S;
	/** Storage of `React.Component` events. */
	public readonly handler: {
		"DID_MOUNT": Method,
		"WILL_UPDATE": Method,
		"WILL_UNMOUNT": Method,
		"SHOULD_UPDATE": (props: P, state: S, context: any) => boolean;
	};
	/** Cache listener functions to automatically added / removed upon (mount) state change. */
	private readonly bindings: Array<EventManager<(node_events.EventEmitter & any) | EventTarget | (Stateful<Props<any>, {}>["handler"])>>;

	constructor(public props: P) {
		super(props);

		this.state = this.create();

		this.handler = {
			"DID_MOUNT": () => { },
			"WILL_UPDATE": () => { },
			"WILL_UNMOUNT": () => { },
			"SHOULD_UPDATE": () => { return true; }
		};
		this.bindings = this.events();
	}
	/** @deprecated */
	public componentDidMount() {
		// attach bindings
		this.attach();
		// lifecycle
		this.handler["DID_MOUNT"]();
	}
	/** @deprecated */
	public componentDidUpdate() {
		// lifecycle
		this.handler["WILL_UPDATE"]();
	}
	/** @deprecated */
	public componentWillUnmount() {
		// remove bindings
		this.unattach();
		// lifecycle
		this.handler["WILL_UNMOUNT"]();
	}
	/** @deprecated */
	public shouldComponentUpdate(props: P, state: S, context: any) {
		// lifecycle
		return this.handler["SHOULD_UPDATE"](props, state, context) ?? true;
	}
	/** Called upon constructor is created */
	protected abstract create(): S;
	/**
	 * Upon an `Element` gets destroyed, all its `EventListener` are removed as well.
	 * But some may attached to different `EventTarget` such as `Window`.
	 * When the `EventListener` stays, it causes performance issue.
	 * 
	 * Binding `EventListener` through this very method will automatically add / remove `EventListener.`
	 */
	protected events(): Stateful<P, S>["bindings"] {
		return [];
	}
	private attach() {
		for (const cache of this.bindings) {
			if (cache.self instanceof node_events.EventEmitter) {
				cache.self.addListener(cache.event as string, cache.handler);
			} else if (cache.self instanceof EventTarget) {
				cache.self.addEventListener(cache.event as string, cache.handler as Method);
			} else if (cache.self === this.handler) {
				this.handler[cache.event as keyof Stateful<P, S>["handler"]] = cache.handler as any;
			}
		}
	}
	private unattach() {
		for (const cache of this.bindings) {
			if (cache.self instanceof node_events.EventEmitter) {
				cache.self.removeListener(cache.event as string, cache.handler);
			} else if (cache.self instanceof EventTarget) {
				cache.self.removeEventListener(cache.event as string, cache.handler as Method);
			} else if (cache.self === this.handler) {
				this.handler[cache.event as keyof Stateful<P, S>["handler"]] = (() => { }) as any;
			}
		}
	}
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** Automatically define width & height. */
	protected constraint(): React.CSSProperties {
		return {
			...new Size({ type: undefined, width: this.props.width, height: this.props.height }).toStyle(),
			...(this.props.size?.minimum ? new Size({ ...this.props.size.minimum, type: "minimum" }).toStyle() : {}),
			...(this.props.size?.maximum ? new Size({ ...this.props.size.maximum, type: "maximum" }).toStyle() : {})
		};
	}
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected modify(): Casacade["modify"] {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): Child;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return <Mirror style={{ ...this.preCSS(), ...this.props.style, ...this.constraint(), ...this.postCSS(), ...this.props.override, ...(this.props.visible === true || this.props.visible === undefined ? {} : { display: "none" }) }} modify={this.modify()}>{this.build()}</Mirror>;
	}
	/** Built-in macro to retrieve self `HTMLElement`. */
	public node<T extends Element = HTMLElement>() {
		try {
			return ReactDOM.findDOMNode(this as React.Component<P, S>) as Nullable<T>;
		} catch {
			return null;
		}
	}
}

export abstract class Stateless<P extends Props<any>> extends React.PureComponent<P, {}> {
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** Automatically define width & height. */
	protected constraint(): React.CSSProperties {
		return {
			...new Size({ type: undefined, width: this.props.width, height: this.props.height }).toStyle(),
			...(this.props.size?.minimum ? new Size({ ...this.props.size.minimum, type: "minimum" }).toStyle() : {}),
			...(this.props.size?.maximum ? new Size({ ...this.props.size.maximum, type: "maximum" }).toStyle() : {})
		};
	}
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected modify(): Casacade["modify"] {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): Child;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return <Mirror style={{ ...this.preCSS(), ...this.props.style, ...this.constraint(), ...this.postCSS(), ...this.props.override, ...(this.props.visible === true || this.props.visible === undefined ? {} : { display: "none" }) }} modify={this.modify()} children={this.build()}/>;
	}
	/** Built-in macro to retrieve self `HTMLElement`. */
	public node<T extends Element = HTMLElement>() {
		try {
			return ReactDOM.findDOMNode(this as React.PureComponent<P, {}>) as Nullable<T>;
		} catch {
			return null;
		}
	}
}

export abstract class StyleSheet<P extends Casacade> extends React.PureComponent<P, {}> {
	constructor(public props: P) {
		super(props);
	}
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return [this.props.children].flat().map((children, index) => {
			if (children === undefined) {
				return children;
			}
			return React.cloneElement(children as JSX.Element, { key: index, style: { ...this.preCSS(), ...this.props.style, ...this.postCSS() }, ...this.props.modify });
		});
	}
}

/** Inheirt CSS */
const Mirror = React.memo(class Exotic extends StyleSheet<Casacade> {
	protected postCSS(): React.CSSProperties {
		return {}
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
});
