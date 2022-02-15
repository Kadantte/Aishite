// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { FlipFlop } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";

class FormProps extends FlipFlop<undefined> {
	public readonly value?: string;
	public readonly fallback?: string;
	// events
	public readonly onTyping?: (callback: string) => boolean;
	public readonly onSubmit?: (callback: string) => void;

	constructor(args: Args<FormProps>) {
		super(args);

		this.value = args.value;
		this.fallback = args.fallback;
		this.onTyping = args.onTyping;
		this.onSubmit = args.onSubmit;
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
			new EventManager(this.handler, "SHOULD_UPDATE", (props) => {
				if (this.props.toggle !== props.toggle) {
					this.node<HTMLInputElement>()?.blur();
				}
				return true;
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {
			color: Color.TEXT_000,
			width: Unit(100, "%"),
			height: Unit(100, "%")
		};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<input id={this.props.id} defaultValue={this.props.value} placeholder={this.props.fallback}
				onBlur={(event) => {
					this.setState({ ...this.state, focus: false });
				}}
				onFocus={(event) => {
					if (!this.props.toggle) {
						this.node<HTMLInputElement>()?.blur();
					}
					this.setState({ ...this.state, focus: true });
				}}
				onKeyDown={(event) => {
					if (!this.props.toggle) {
						return false;
					}
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
