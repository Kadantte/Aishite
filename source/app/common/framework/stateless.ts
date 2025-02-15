import React from "react";
import ReactDOM from "react-dom";

import { Props } from "app/common/props";
import { CSSProps } from "app/common/framework";

abstract class Stateless<P extends Props.Clear<unknown>> extends React.PureComponent<P, object> {
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
	public node<T extends Element = HTMLElement>() {
		// eslint-disable-next-line react/no-find-dom-node
		return ReactDOM.findDOMNode(this as React.Component) as T;
	}
}

export default Stateless;
