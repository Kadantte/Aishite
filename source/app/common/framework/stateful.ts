import React from "react";
import ReactDOM from "react-dom";

import { Props } from "app/common/props";
import { CSSProps } from "app/common/framework";

interface LifeCycle<P extends Props.Clear<unknown>, S> {
	readonly DID_MOUNT?: VoidFunction;
	readonly DID_UPDATE?: VoidFunction;
	readonly WILL_UNMOUNT?: VoidFunction;
	readonly SHOULD_UPDATE?: (props: Readonly<P>, state: Readonly<S>, context: unknown) => boolean;
}

abstract class Stateful<P extends Props.Clear<unknown>, S> extends React.Component<P, S> {
	public state: S;

	constructor(public props: P) {
		super(props);

		this.state = this.create();
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
	public shouldComponentUpdate(props: Readonly<P>, state: Readonly<S>, context: unknown) {
		return this.events().SHOULD_UPDATE?.(props, state, context) ?? true;
	}
	/** called upon constructor is created. */
	protected abstract create(): S;
	/** event management. */
	protected abstract events(): LifeCycle<P, S>;
	/** return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** **UNSAFE**: directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	/** this is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): JSX.Element;
	/** consider using `this.build` instead. */
	@writable(false)
	@configurable(false)
	public render() {
		return React.cloneElement(this.build(), {
			// automatic
			...this.override(),
			...this.props.hidden,
			// decoration
			style: {
				...this.preCSS(),
				...this.props.hidden?.style,
				...CSSProps.plus(this.props),
				...this.postCSS(),
				...CSSProps.flag(this.props)
			},
			// manually
			hidden: undefined
		});
	}
	protected node<T extends Element = HTMLElement>() {
		// eslint-disable-next-line react/no-find-dom-node
		return ReactDOM.findDOMNode(this as React.Component) as T;
	}
}

export default Stateful;
