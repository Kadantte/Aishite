import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { FlipFlop } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Pair from "@/models/pair";

import Box from "@/app/layout/box";
import Row from "@/app/layout/row";
import Text from "@/app/layout/text";
import Form from "@/app/layout/form";
import Center from "@/app/layout/center";
import Container from "@/app/layout/container";

import Scroll from "@/app/layout/casacade/scroll";
import Offset from "@/app/layout/casacade/offset";
import Priority from "@/app/layout/casacade/priority";
import Position from "@/app/layout/casacade/position";

import Close from "@/app/icons/close";

class DropdownProps extends FlipFlop<undefined> {
	public readonly index?: number;
	public readonly options: Array<Pair<string, string>>;
	public readonly value?: string;
	public readonly fallback?: string;
	public readonly highlight?: string;
	public readonly controller?: Reference<HTMLInputElement>;
	// events
	public readonly onReset?: () => void;
	public readonly onIndex?: (callback: number) => void;
	public readonly onSelect?: (callback: string) => void;
	public readonly onSubmit?: (callback: string) => void;
	public readonly onChange?: (callback: string) => void;
	public readonly onTyping?: (callback: string) => boolean;

	constructor(args: Args<DropdownProps>) {
		super(args);

		this.index = args.index;
		this.options = args.options;
		this.value = args.value;
		this.fallback = args.fallback;
		this.highlight = args.highlight;
		this.controller = args.controller;
		this.onReset = args.onReset;
		this.onIndex = args.onIndex;
		this.onSelect = args.onSelect;
		this.onSubmit = args.onSubmit;
		this.onChange = args.onChange;
		this.onTyping = args.onTyping;
	}
}

class DropdownState {
	public index: number;
	public entered: boolean;
	public focused: boolean;

	constructor(args: Args<DropdownState>) {
		this.index = args.index;
		this.entered = args.entered;
		this.focused = args.focused;
	}
}

class Dropdown extends Stateful<DropdownProps, DropdownState> {
	protected create() {
		return new DropdownState({ index: this.props.index ?? NaN, entered: false, focused: false });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Box id={"dropdown"}>
				{/* QUERY */}
				<Container height={Unit(40)} decoration={{ shadow: [[Color.DARK_100, 0, 0, 5, 0]], corner: { all: Unit(4.5), BL: this.state.focused && !this.props.options.isEmpty() ? Unit(0) : undefined, BR: this.state.focused && !this.props.options.isEmpty() ? Unit(0) : undefined }, background: { color: this.state.entered || this.state.focused ? Color.DARK_400 : Color.DARK_300 } }}
					onMouseEnter={(I) => {
						this.setState({ ...this.state, entered: true });
					}}
					onMouseLeave={(I) => {
						this.setState({ ...this.state, entered: false });
					}}>
					<Row>
						<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
							<Form toggle={this.props.toggle} value={this.props.value} fallback={this.props.fallback} controller={this.props.controller}
								onBlur={() => {
									this.setState({ ...this.state, focused: false });
								}}
								onFocus={() => {
									this.setState({ ...this.state, focused: true });
								}}
								onSubmit={(text) => {
									if (isNaN(this.state.index)) {
										this.props.onSubmit?.(text);
									} else if (this.props.options.isEmpty()) {
										this.props.onSubmit?.(text);
									} else {
										this.props.onSelect?.(this.props.options[this.state.index].first);
										// reset index
										this.setState({ ...this.state, index: NaN });
									}
								}}
								onChange={(text) => {
									this.props.onChange?.(text);
								}}
								onTyping={(text) => {
									switch (text) {
										case "ArrowUp":
										case "ArrowDown": {
											if (!this.props.options.isEmpty()) {
												// update index
												this.setState({ ...this.state, index: ((isNaN(this.state.index) ? -1 : this.state.index) + (text === "ArrowUp" ? -1 : 1)).clamp(0, this.props.options.length - 1) }, () => {
													// auto-scroll
													this.node()?.querySelector("[id=\"options\"]")?.scrollTo({ top: this.state.index * 40 });
													// event
													this.props.onIndex?.(this.state.index);
												});
											}
										}
									}
									return this.props.onTyping?.(text) ?? true;
								}}
							/>
						</Offset>
						<Center width={Unit(50)} x={true} y={true}>
							<Close color={Color.DARK_500}
								onMouseDown={(I) => {
									this.props.onReset?.();
								}}
								onMouseEnter={(I) => {
									I.style(Color.TEXT_000);
								}}
								onMouseLeave={(I) => {
									I.style(null);
								}}
							/>
						</Center>
					</Row>
				</Container>
				{/* MENU */}
				<Scroll x={"hidden"} y={"scroll"}>
					<Priority level={69}>
						<Position top={Unit(100, "%")}>
							<Container id={"options"} width={Unit(100, "%")} size={{ maximum: { height: Unit(40 * 5) } }} visible={this.state.focused && !this.props.options.isEmpty()} override={{ clipPath: "inset(0px -5px -5px -5px)" }} decoration={{ shadow: [[Color.DARK_100, 0, 0, 5, 0]], corner: { all: Unit(4.5), TL: Unit(0), TR: Unit(0) }, background: { color: Color.DARK_400 } }}>
								{this.props.options.map((option, index) => {
									return (
										<Container id={index.toString()} key={index} height={Unit(40)} decoration={{ background: { color: this.state.index === index ? Color.DARK_500 : undefined } }}
											onMouseDown={() => {
												this.setState({ ...this.state, index: NaN }, () => this.props.onSelect?.(option.first));
											}}
											onMouseEnter={(I) => {
												this.setState({ ...this.state, index: index }, () => this.props.onIndex?.(index));
											}}
											onMouseLeave={(I) => {
												// this.setState({ ...this.state, index: NaN });
											}}>
											<Center x={false} y={true}>
												<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
													{/* @ts-ignore */}
													<Text>
														{option.first.split(this.props.highlight!).map((value, index, array) => array.length > index + 1 ? value.isEmpty() ? { value: this.props.highlight, color: Color.SPOTLIGHT } : [{ value: value }, { value: this.props.highlight, color: Color.SPOTLIGHT }] : { value: value }).flat().map((text) => ({ ...text, size: Unit(14.0) }))}
													</Text>
													{/* SECOND */}
													<Position right={Unit(10)}>
														<Text>{[{ value: option.second, size: Unit(14.0), color: Color.DARK_200 }]}</Text>
													</Position>
												</Offset>
											</Center>
										</Container>
									);
								})}
							</Container>
						</Position>
					</Priority>
				</Scroll>
			</Box>
		);
	}
}

export default Dropdown;
