import React from "react";

import { Props } from "app/common/props";

abstract class StyleSheet<P extends Props.Casacade> extends React.PureComponent<P, {}> {
	constructor(public props: P) {
		super(props);
	}
	/** Return value will be applied before `this.props.style`. */
	protected abstract preCSS(): React.CSSProperties;
	/** Return value will be applied after `this.props.style`. */
	protected abstract postCSS(): React.CSSProperties;
	/** **UNSAFE**: Directly pass `HTMLElement` attributes to children. */
	protected override(): Record<string, unknown> {
		return {};
	}
	@writable(false)
	@configurable(false)
	public render() {
		return [this.props.children].flat().map((children, index) => {
			switch (children) {
				case undefined: {
					return undefined;
				}
				default: {
					// print(this.constructor.name, children.type.name, children.type.prototype instanceof StyleSheet);
					return React.cloneElement(children, {
						// identifier
						key: index,
						// UWU...
						hidden: {
							// 1st
							...this.props.hidden,
							// 2nd
							style: {
								...this.preCSS(),
								...this.props.hidden?.style ?? {},
								...this.postCSS()
							},
							// 3rd
							...this.override()
						}
					});
				}
			}
		});
	}
}

export default StyleSheet;
