import Icon from "@/app/icons";

class I_Plus extends Icon {
	protected build() {
		return (
			<svg id={this.props.id ?? "icon_plus"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect x="4.25" width="1.5" height="10" rx="0.5"/><rect y="4.25" width="10" height="1.5" rx="0.5"/></svg>
		);
	}
}

export default I_Plus;
