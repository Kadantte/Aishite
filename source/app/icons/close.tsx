import Icon from "@/app/icons";

class I_Close extends Icon {
	protected build() {
		return (
			<svg id={this.props.id ?? "icon_close"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8.65 8.65"><rect x="4.25" y="-0.66" width="1.5" height="11.31" rx="0.5" transform="translate(-2.75 4.32) rotate(-45)"/><rect x="-0.66" y="4.25" width="11.31" height="1.5" rx="0.5" transform="translate(-2.75 4.32) rotate(-45)"/></svg>
		);
	}
}

export default I_Close;
