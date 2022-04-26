import Unit from "@/app/common/unit";
import { FlipFlop } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import Size from "@/app/common/style/size";

class FormProps extends FlipFlop<undefined> {
	public readonly value?: string;
	public readonly fallback?: string;
	public readonly controller?: Reference<HTMLInputElement>;
	// events
	public readonly onBlur?: () => void;
	public readonly onFocus?: () => void;
	public readonly onSubmit?: (callback: string) => void;
	public readonly onChange?: (callback: string) => void;
	public readonly onTyping?: (callback: string) => boolean;

	constructor(args: Args<FormProps>) {
		super(args);

		this.value = args.value;
		this.fallback = args.fallback;
		this.controller = args.controller;
		this.onBlur = args.onBlur;
		this.onFocus = args.onFocus;
		this.onSubmit = args.onSubmit;
		this.onChange = args.onChange;
		this.onTyping = args.onTyping;
	}
}

class FormState {
	public focus: boolean;

	constructor(args: Args<FormState>) {
		this.focus = args.focus;
	}
}

class Form extends Stateful<FormProps, FormState> {
	protected create() {
		return new FormState({ focus: false });
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
					if (this.state.focus) {
						switch (event.key) {
							case "Enter": {
								// trigger
								this.props.onSubmit?.(this.node<HTMLInputElement>()?.value ?? "N/A");
								break;
							}
							case "ArrowUp":
							case "ArrowDown": {
								// return false
								event.preventDefault();
								break;
							}
						}
						// trigger
						return this.props.onTyping?.(event.key);
					}
				}}
			/>
		);
	}
}

export default Form;
