import Icon from "@/app/icons";

class I_Bookmark extends Icon {
	protected build() {
		return (
			<svg id={this.props.id ?? "icon_bookmark"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 9.78"><path d="M8.5,0A.51.51,0,0,1,9,.5v9c0,.27-.18.36-.4.2L5.4,7.3a.73.73,0,0,0-.8,0L1.4,9.7c-.22.16-.4.07-.4-.2V.5A.51.51,0,0,1,1.5,0Z" transform="translate(-1)"/></svg>
		);
	}
}

export default I_Bookmark;
