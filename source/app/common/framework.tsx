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
	protected override(): Casacade["override"] {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): Child;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return (
			<Mirror
				{...this.props}
				style={{
					...this.preCSS(),
					...this.props.style,
					...position(this.props),
					...constraint(this.props),
					...decoration(this.props),
					...offset(this.props),
					...this.postCSS(),
					...behaviour(this.props),
					...this.props.override
				}}
				children={this.build()}
				override={this.override()}
			/>
		);
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

export abstract class Stateless<P extends Clear<any>> extends React.PureComponent<P, {}> {
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Casacade["override"] {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): Child;
	/** Consider using `this.build` instead. */
	@final()
	public render() {
		return (
			<Mirror
				{...this.props}
				style={{
					...this.preCSS(),
					...this.props.style,
					...position(this.props),
					...constraint(this.props),
					...decoration(this.props),
					...offset(this.props),
					...this.postCSS(),
					...behaviour(this.props),
					...this.props.override
				}}
				children={this.build()}
				override={this.override()}
			/>
		);
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
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Casacade["override"] {
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
					// cache
					const unique: Record<string, any> = {};
					
					for (const [key, value] of Object.entries(this.props ?? {})) {
						if (/^data-([a-z]+)$/.test(key)) {
							unique[key] = value;
						}
					}
					return React.cloneElement((children), { ...unique, key: index, style: { ...this.preCSS(), ...this.props.style, ...this.postCSS() }, ...this.override(), ...this.props.override });
				}
			}
		});
	}
}

const Mirror = React.memo(class Mirror extends StyleSheet<Casacade> {
	protected postCSS(): React.CSSProperties {
		return {}
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
});

function position(props: Props<any>): React.CSSProperties {
	return nullsafe({
		...Position({ all: props.all, top: props.top, left: props.left, right: props.right, bottom: props.bottom })
	});
}

function constraint(props: Props<any>): React.CSSProperties {
	return nullsafe({
		...Size({ width: props.width, height: props.height, type: undefined }),
		...Size({ ...props.minimum, type: "minimum" }),
		...Size({ ...props.maximum, type: "maximum" })
	});
}

function decoration(props: Props<any>): React.CSSProperties {
	return nullsafe({
		// handfully
		backgroundColor: props.color,
		backgroundImage: props.image,
		// automatic
		...Border(props.border ?? {}),
		...Corner(props.corner ?? {}),
		...Shadow(props.shadow ?? []),
		// handfully...
		opacity: props?.opacity ? (props.opacity.clamp(0, 100) / 100) : undefined
	});
}

function offset(props: Props<any>): React.CSSProperties {
	return nullsafe({
		...Margin(props.margin ?? {}),
		...Padding(props.padding ?? {})
	});
}

function behaviour(props: Props<any>): React.CSSProperties {
	return nullsafe({
		display: props.visible === false ? "none" : undefined,
		WebkitAppRegion: props.draggable === true ? "drag" : props.draggable === false ? "no-drag" : undefined
	});
}
