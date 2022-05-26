import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

interface ElementProps extends Props<Children> {
	/** Whether to prevent event triggers from elements underneath. */
	readonly priority?: boolean;
}

class Element extends Stateless<ElementProps> {
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={this.props.id}
				onMouseUp={(event) => {
					if (this.props.priority) event.stopPropagation();
				}}
				onMouseDown={(event) => {
					if (this.props.priority) event.stopPropagation();
				}}
				onMouseEnter={(event) => {
					if (this.props.priority) event.stopPropagation();
				}}
				onMouseLeave={(event) => {
					if (this.props.priority) event.stopPropagation();
				}}
				onMouseOver={(event) => {
					if (this.props.priority) event.stopPropagation();
				}}
			>{this.props.children}</section>
		);
	}
}

export default Element;
