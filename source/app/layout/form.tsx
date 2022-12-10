import Style from "app/common/styles";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import structure from "handles/index";

interface FormProps extends Props.Clear<undefined>, Props.Style, Props.Toggle {
	// optional
	readonly value?: string;
	readonly fallback?: string;
	// events
	readonly onBlur?: VoidFunction;
	readonly onFocus?: VoidFunction;
	readonly onSubmit?: (callback: string) => void;
	readonly onChange?: (callback: string) => void;
	readonly onTyping?: (callback: string) => boolean;
}

interface FormState {
	id: string;
	focus: boolean;
	highlight: boolean;
}

class Form extends Stateful<FormProps, FormState> {
	protected create() {
		return {
			id: "???",
			focus: false,
			highlight: false
		};
	}
	protected events() {
		return {
			DID_UPDATE: () => {
				// skip
				if (this.state.id === "???") return;

				switch (structure("ctm").state.id) {
					case this.state.id: {
						this.contextmenu(structure("ctm").state.x, structure("ctm").state.y);
						break;
					}
				}
			}
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Style.size({ width: 100.0 + "%", height: 100.0 + "%" })
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<input id={this.props.id ?? "form"} readOnly={!this.props.enable} placeholder={this.props.fallback} defaultValue={this.props.value}
				onBlur={(event) => {
					this.setState((state) => ({ focus: false }), () => this.props.onBlur?.());
				}}
				onFocus={(event) => {
					this.setState((state) => ({ focus: true }), () => this.props.onFocus?.());
				}}
				onChange={(event) => {
					event.target.value = this.props.onChange?.(event.target.value) ?? event.target.value;
				}}
				onKeyDown={(event) => {
					// check ahead
					if (!this.state.focus) return event.preventDefault();
					// trigger
					if (!this.props.onTyping?.(event.key) ?? false) event.preventDefault();

					switch (event.key) {
						case "Enter": {
							this.props.onSubmit?.(this.node<HTMLInputElement>().value ?? "N/A");
							break;
						}
						case "ArrowUp":
						case "ArrowDown": {
							event.preventDefault();
							break;
						}
					}
				}}
				onMouseUp={(event) => {
					this.setState((state) => ({ highlight: window.getSelection()!.toString().length > 0 }));
				}}
				onContextMenu={(event) => {
					if (this.state.id === "???") {
						// silent update
						this.state.id = new Date().toISOString();
					}
					this.contextmenu(event.pageX, event.pageY);
				}}
			/>
		);
	}
	protected contextmenu(x: number, y: number) {
		structure("ctm").state = {
			id: this.state.id,
			x: x,
			y: y,
			items: [
				{
					role: "Cut",
					toggle: this.props.enable && this.state.highlight,
					method: async () => {
						// clipboard
						navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([window.getSelection()!.toString()], { type: "text/plain" }) })]);
						// cache
						const element = this.node<HTMLInputElement>();
						// modify
						element.value = element.value.substring(0, element.selectionStart!) + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Copy",
					toggle: this.props.enable && this.state.highlight,
					method: async () => {
						// clipboard
						navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([window.getSelection()!.toString()], { type: "text/plain" }) })]);
					}
				},
				{
					role: "Paste",
					toggle: this.props.enable,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>();
						// modify
						element.value = element.value.substring(0, element.selectionStart!) + await navigator.clipboard.readText() + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Delete",
					toggle: this.props.enable && this.state.highlight,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>();
						// modify
						element.value = element.value.substring(0, element.selectionStart!) + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Select All",
					toggle: this.props.enable,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>();

						setTimeout(() => {
							// focus
							element.focus();
							// select
							element.select();
						});
					}
				}
			]
		}
	}
}

export default Form;
