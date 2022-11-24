import Container from "@/app/layout/container";

class Button extends Container {
	protected preCSS(): React.CSSProperties {
		return {
			display: "flex",
			alignItems: "center",
			justifyContent: "center"
		};
	}
	protected build() {
		return (
			<section id={this.props.id ?? "button"}>{this.props.children}</section>
		);
	}
}

export default Button;
