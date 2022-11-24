import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

interface BracketProps extends Props.Clear, Props.Style {
	// required
	fallback: JSX.Element;
	children: JSX.Element;
}

interface BracketState {
	error: boolean;
}

class Bracket extends Stateful<BracketProps, BracketState> {
	// UWU...
	static getDerivedStateFromError() {
		return {
			error: true
		};
	}
	protected create() {
		return {
			error: false
		};
	}
	protected events() {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		if (this.state.error) {
			return (<section id={this.props.id ?? "bracket"}>{this.props.fallback}</section>);
		}
		else {
			return (<section id={this.props.id ?? "bracket"}>{this.props.children}</section>);
		}
	}
}

export default Bracket;
