import Unit from "@/app/common/unit";
import { FlipFlop } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import Size from "@/app/common/style/size";

import ContextMenu from "@/app/layout/casacade/contextmenu";

interface FormProps extends FlipFlop<undefined> {
	readonly value?: string;
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
					this.node<HTMLInputElement>()?.blur();
				}
				return true;
			}
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...Size({ width: Unit(100, "%"), height: Unit(100, "%") })
		};
	}
	protected build() {
		return (
			<ContextMenu items={[
				{
					role: "Cut",
					toggle: this.state.highlight,
					method: async () => {
						// @ts-ignore
						this.node<HTMLInputElement>()!.value = null;
						// text/plain
						window.navigator.clipboard.writeText(window.getSelection()!.toString());
					}
				},
				{
					role: "Copy",
					toggle: this.state.highlight,
					method: async () => {
						// text/plain
						window.navigator.clipboard.writeText(window.getSelection()!.toString());
					}
				},
				{
					role: "Paste",
					toggle: true,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>()!;
						// reset
						element.value = element.value.substring(0, element.selectionStart!) + await window.navigator.clipboard.readText() + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Delete",
					toggle: this.state.highlight,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>()!;
						// reset
						element.value = element.value.substring(0, element.selectionStart!) + element.value.substring(element.selectionEnd!, element.value.length);
					}
				},
				{
					role: "Select All",
					toggle: true,
					method: async () => {
						// cache
						const element = this.node<HTMLInputElement>()!;

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
						this.props.onChange?.(event.target.value);
					}}
					onKeyDown={(event) => {
						if (!this.state.focus) return;
						// trigger
						if (event.key === "Enter") return this.props.onSubmit?.(this.node<HTMLInputElement>()?.value ?? "N/A");

						switch (event.key) {
							case "ArrowUp":
							case "ArrowDown": {
								event.preventDefault();
								break;
							}
						}
						// trigger
						return this.props.onTyping?.(event.key);
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
