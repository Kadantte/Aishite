// common
import Unit from "@/app/common/unit";
import Size from "@/app/common/size";
import { FlipFlop } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";

class FormProps extends FlipFlop<undefined> {
	public readonly value?: string;
	public readonly fallback?: string;
	public readonly controller?: React.RefObject<HTMLInputElement>;
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
	protected events() {
		return [
			// @ts-ignore
			new EventManager(this.handler, "SHOULD_UPDATE", (props) => {
				if (this.props.toggle !== props.toggle) {
					this.node<HTMLInputElement>()?.blur();
				}
				return true;
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {
			...new Size({ width: Unit(100, "%"), height: Unit(100, "%") }).toStyle()
		};
	}
	protected build() {
		return (
			<input id={this.props.id} ref={this.props.controller} readOnly={!this.props.toggle} placeholder={this.props.fallback} defaultValue={this.props.value}
				onBlur={(event) => {
					this.setState({ ...this.state, focus: false }, () => this.props.onBlur?.());
				}}
				onFocus={(event) => {
					if (!this.props.toggle) {
						this.node<HTMLInputElement>()?.blur();
					}
					this.setState({ ...this.state, focus: true }, () => this.props.onFocus?.());
				}}
				onChange={(event) => {
					this.props.onChange?.(event.target.value);
				}}
				onKeyDown={(event) => {
					// if (!this.props.toggle) {
					// 	return false;
					// }
					if (this.state.focus) {
						switch (event.key) {
							case "Enter": {
								// cache
								const node = this.node<HTMLInputElement>();
								// check if not null
								if (node) {
									// trigger
									this.props.onSubmit?.(node.value);
								}
								break;
							}
							default: {
								// trigger
								return this.props.onTyping?.(event.key);
							}
						}
					}
				}}
			/>
		);
	}
}

export default Form;
