import Icon from "app/icons";

class I_Minimize extends Icon {
	protected build() {
		return (
			<svg id={this.props.id ?? "icon_minimize"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 1.5"><rect width="10" height="1.5" rx="0.5"/></svg>
		);
	}
}

export default I_Minimize;
