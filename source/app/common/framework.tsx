import React from "react";
import ReactDOM from "react-dom";

import { Clear, Props, Casacade } from "@/app/common/props";

import Size from "@/app/common/style/size";
import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";
import Position from "@/app/common/style/position";

export interface LifeCycle<P extends Props<any>, S> {
	DID_MOUNT?: () => void;
	DID_UPDATE?: () => void
	WILL_UNMOUNT?: () => void
	SHOULD_UPDATE?: (props: P, state: S, context: unknown) => boolean;
}

export abstract class Stateful<P extends Clear<any>, S> extends React.Component<P, S> {
	/** DO NOT MODIFY THIS DIRECTLY. */
	public state: S;

	constructor(public props: P) {
		super(props);

		this.state = this.create();
	}
	protected events(): LifeCycle<P, S> {
		return {};
	}
	/** @deprecated */
	public componentDidMount() {
		this.events().DID_MOUNT?.();
	}
	/** @deprecated */
	public componentDidUpdate() {
		this.events().DID_UPDATE?.();
	}
	/** @deprecated */
	public componentWillUnmount() {
		this.events().WILL_UNMOUNT?.();
	}
	/** @deprecated */
	public shouldComponentUpdate(props: P, state: S, context: unknown) {
		return this.events().SHOULD_UPDATE?.(props, state, context) ?? true;
	}
	/** Called upon constructor is created */
	protected abstract create(): S;
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): JSX.Element;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return React.cloneElement(this.build(), {
			style: {
				...nullsafe(this.preCSS()),
				...this.props.style,
				...nullsafe(position(this.props)),
				...nullsafe(constraint(this.props)),
				...nullsafe(decoration(this.props)),
				...nullsafe(offset(this.props)),
				...nullsafe(this.postCSS()),
				...nullsafe(behaviour(this.props)),
				...this.props.custom
			},
			...inherit(this.props),
			...this.override()
		});
	}
	/** Built-in macro to retrieve self `HTMLElement`. */
	public node<T extends Element = HTMLElement>() {
		try {
			return ReactDOM.findDOMNode(this as React.Component) as Nullable<T>;
		}
		catch {
			return null;
		}
	}
}

export abstract class Stateless<P extends Clear<any>> extends React.PureComponent<P, {}> {
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): JSX.Element;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return React.cloneElement(this.build(), {
			style: {
				...nullsafe(this.preCSS()),
				...this.props.style,
				...nullsafe(position(this.props)),
				...nullsafe(constraint(this.props)),
				...nullsafe(decoration(this.props)),
				...nullsafe(offset(this.props)),
				...nullsafe(this.postCSS()),
				...nullsafe(behaviour(this.props)),
				...this.props.custom
			},
			...inherit(this.props),
			...this.override()
		});
	}
	/** Built-in macro to retrieve self `HTMLElement`. */
	public node<T extends Element = HTMLElement>() {
		try {
			return ReactDOM.findDOMNode(this as React.Component) as Nullable<T>;
		}
		catch {
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
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	@final()
	public render() {
		return [this.props.children].flat().map((children, index) => {
			switch (children) {
				case undefined: {
					return undefined;
				}
				default: {
					// print(this.constructor.name, children.type?.name ?? children.type);
					return React.cloneElement(children, {
						key: index,
						style: {
							...this.preCSS(),
							...this.props.style,
							...this.postCSS()
						},
						...inherit(this.props),
						...this.override()
					});
				}
			}
		});
	}
}

function inherit(object: Record<string, any>) {
	const cache: Record<string, any> = {};

	for (const [key, value] of Object.entries(object)) {
		switch (/^data-([a-z]+)$/.test(key)) {
			case true: {
				cache[key] = value;
				break;
			}
		}
	}
	return cache;
}

function nullsafe(object: React.CSSProperties) {
	for (const [key, value] of Object.entries(object)) {
		if (value === undefined) {
			delete object[key as keyof typeof object];
		}
	}
	return object;
}

function position(props: Props<any>): React.CSSProperties {
	return {
		...Position({ all: props.all, top: props.top, left: props.left, right: props.right, bottom: props.bottom })
	};
}

function constraint(props: Props<any>): React.CSSProperties {
	return {
		...Size({ width: props.width, height: props.height, type: undefined }),
		...Size({ ...props.minimum, type: "minimum" }),
		...Size({ ...props.maximum, type: "maximum" })
	};
}

function decoration(props: Props<any>): React.CSSProperties {
	return {
		// handfully
		backgroundColor: props.color,
		backgroundImage: props.image,
		// automatic
		...Border(props.border ?? {}),
		...Corner(props.corner ?? {}),
		...Shadow(props.shadow ?? []),
		// handfully...
		opacity: props?.opacity ? (props.opacity.clamp(0, 100) / 100) : undefined
	};
}

function offset(props: Props<any>): React.CSSProperties {
	return {
		...Margin(props.margin ?? {}),
		...Padding(props.padding ?? {})
	};
}

function behaviour(props: Props<any>): React.CSSProperties {
	return {
		display: props.visible === false ? "none" : undefined,
		WebkitAppRegion: props.draggable === true ? "drag" : props.draggable === false ? "no-drag" : undefined
	};
}
