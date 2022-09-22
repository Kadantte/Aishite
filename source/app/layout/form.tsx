import CSS from "@/app/common/style";
import Unit from "@/app/common/unit";
import { FlipFlop } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import ContextMenu from "@/app/layout/casacade/contextmenu";

interface FormProps extends FlipFlop<undefined> {
	readonly value?: string;
	readonly align?: React.CSSProperties["textAlign"];
	readonly fallback?: string;
	readonly controller?: Reference<HTMLInputElement>;
	// events
	readonly onBlur?: () => void;
	readonly onFocus?: () => void;
	readonly onSubmit?: (callback: string) => void;
	readonly onChange?: (callback: string) => void;
	readonly onTyping?: (callback: string) => boolean;
}

interface FormState {
	focus: boolean;
	highlight: boolean;
}

class Form extends Stateful<FormProps, FormState> {
	protected create() {
		return ({ focus: false, highlight: false });
	}
	protected events(): LifeCycle<FormProps, FormState> {
		return {
			SHOULD_UPDATE: (props, state, context) => {
				if (this.props.toggle !== props.toggle) {
					this.node<HTMLInputElement>().blur();
				}
				return true;
			}
		};
	}
	protected postCSS(): React.CSSProperties {
		return {
			textAlign: this.props.align
		};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...CSS.Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (
			<ContextMenu items={[
				{
					role: "Cut",
					toggle: this.state.highlight,
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
					toggle: this.state.highlight,
					method: async () => {
						// clipboard
						navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([window.getSelection()!.toString()], { type: "text/plain" }) })]);
					}
				},
				{
					role: "Paste",
					toggle: true,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>();
						// modify
						element.value = element.value.substring(0, element.selectionStart!) + await navigator.clipboard.readText() + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Delete",
					toggle: this.state.highlight,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>();
						// modify
						element.value = element.value.substring(0, element.selectionStart!) + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Select All",
					toggle: true,
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
				}]}>
				<input id={this.props.id} ref={this.props.controller} readOnly={!this.props.toggle} placeholder={this.props.fallback} defaultValue={this.props.value}
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
						// trigger
						if (event.key === "Enter") return this.props.onSubmit?.(this.node<HTMLInputElement>().value ?? "N/A");

						switch (event.key) {
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
				/>
			</ContextMenu>
		);
	}
}

export default Form;
