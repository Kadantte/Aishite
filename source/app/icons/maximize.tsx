import Icon from "app/icons";

class I_Maximize extends Icon {
	protected build() {
		return (
			<svg id={this.props.id ?? "icon_maximize"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M.25,0A.25.25,0,0,0,0,.25v9.5A.25.25,0,0,0,.25,10h9.5A.25.25,0,0,0,10,9.75V.25A.25.25,0,0,0,9.75,0ZM8.5,8.25a.25.25,0,0,1-.25.25H1.75a.25.25,0,0,1-.25-.25V1.75a.25.25,0,0,1,.25-.25h6.5a.25.25,0,0,1,.25.25Z"/></svg>
		);
	}
}

export default I_Maximize;
