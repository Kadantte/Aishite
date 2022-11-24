import React from "react";
import ReactDOM from "react-dom";

import { Props } from "@/app/common/props";
import { CSSProps } from "@/app/common/framework";

abstract class Stateless<P extends Props.Clear<unknown>> extends React.PureComponent<P, {}> {
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

export default Stateless;
