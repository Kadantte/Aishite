import React from "react";
import ReactDOM from "react-dom";

import { Props } from "@/app/common/props";
import { CSSProps } from "@/app/common/framework";

interface LifeCycle<P extends Props.Clear<unknown>, S> {
	readonly DID_MOUNT?: () => void;
	readonly DID_UPDATE?: () => void;
	readonly WILL_UNMOUNT?: () => void;
	readonly SHOULD_UPDATE?: (props: P, state: S, context: unknown) => boolean;
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
	public shouldComponentUpdate(props: P, state: S, context: unknown) {
		if (this.events().SHOULD_UPDATE) {
			return this.events().SHOULD_UPDATE!(props, state, context);
		}
		else {
			return true;
		}
	}
	/** Called upon constructor is created. */
	protected abstract create(): S;
	/** Event management. */
	protected abstract events(): LifeCycle<P, S>;
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	/** This is a wrapper to inheirt `this.props.style` automation. */
	protected abstract build(): JSX.Element;
	/** Consider using `this.build` instead. */
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
				// @ts-ignore
				...this.props.hidden?.style,
				...CSSProps.plus(this.props),
				...this.postCSS(),
				...CSSProps.flag(this.props)
			},
			// manually
			hidden: undefined
		});
	}
	public node<T extends Element = HTMLElement>() {
		return ReactDOM.findDOMNode(this as React.Component) as T;
	}
}

export default Stateful;
