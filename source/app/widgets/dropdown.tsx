import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { FlipFlop } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import { Pair } from "@/models/pair";

import Row from "@/app/layout/row";
import Text from "@/app/layout/text";
import Form from "@/app/layout/form";
import Center from "@/app/layout/center";
import Element from "@/app/layout/element";
import Container from "@/app/layout/container";

import Scroll from "@/app/layout/casacade/scroll";

import Close from "@/app/icons/close";

import Button from "@/app/widgets/button";

interface DropdownProps extends FlipFlop<undefined> {
	readonly index?: number;
	readonly value?: string;
	readonly items: Array<Pair<string, string>>;
	readonly fallback?: string;
	readonly highlight?: string;
	readonly controller?: Reference<HTMLInputElement>;
	// events
	readonly onReset?: () => void;
	readonly onIndex?: (callback: number) => void;
	readonly onSelect?: (callback: string) => void;
	readonly onSubmit?: (callback: string) => void;
	readonly onChange?: (callback: string) => void;
	readonly onTyping?: (callback: string) => boolean;
}

interface DropdownState {
	index: number;
	hover: boolean;
	focus: boolean;
}

class Dropdown extends Stateful<DropdownProps, DropdownState> {
	protected create() {
		return ({ index: this.props.index ?? NaN, hover: false, focus: false });
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Element id="dropdown" custom={{ overflow: "visible" }}>
				{/* FORM */}
				<Container color={!this.state.hover && !this.state.focus ? Color.DARK_300 : Color.DARK_400} height={40} corner={{ all: 4.5, BL: this.state.focus && !this.props.items.isEmpty() ? 0 : undefined, BR: this.state.focus && !this.props.items.isEmpty() ? 0 : undefined }} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]}
					onMouseEnter={(style) => {
						this.setState((state) => ({ hover: true }));
					}}
					onMouseLeave={(style) => {
						this.setState((state) => ({ hover: false }));
					}}>
					<Row>
						<Form toggle={this.props.toggle} value={this.props.value} fallback={this.props.fallback} controller={this.props.controller} margin={{ left: 15, right: 15 }}
							onBlur={() => {
								this.setState((state) => ({ focus: false }));
							}}
							onFocus={() => {
								this.setState((state) => ({ focus: true }));
							}}
							onSubmit={(text) => {
								if (isNaN(this.state.index)) return this.props.onSubmit?.(text);
								if (this.props.items.isEmpty()) return this.props.onSubmit?.(text);
								// trigger
								this.props.onSelect?.(this.props.items[this.state.index].first);
								// update
								this.setState((state) => ({ index: NaN }));
							}}
							onChange={(text) => {
								this.props.onChange?.(text);
							}}
							onTyping={(text) => {
								switch (text) {
									case "ArrowUp":
									case "ArrowDown": {
										if (!this.props.items.isEmpty()) {
											this.setState((state) => ({ index: isNaN(state.index) ? 0 : (state.index + (text === "ArrowUp" ? -1 : 1)).clamp(0, this.props.items.length - 1) }), () => {
												// auto-scroll
												this.node()?.querySelector("[id=\"items\"]")?.scrollTo({ top: this.state.index * 40 });
												// event
												this.props.onIndex?.(this.state.index);
											});
										}
									}
								}
								return this.props.onTyping?.(text) ?? true;
							}}
						/>
						<Center x={true} y={true} width={50}>
							<Close color={Color.DARK_500}
								onMouseDown={(style) => {
									this.props.onReset?.();
								}}
								onMouseEnter={(style) => {
									style(Color.TEXT_000);
								}}
								onMouseLeave={(style) => {
									style(null);
								}}
							/>
						</Center>
					</Row>
				</Container>
				{/* MENU */}
				<Scroll x="hidden" y="scroll">
					<Container id="items" color={Color.DARK_400} top={Unit(100, "%")} width={Unit(100, "%")} maximum={{ height: 40 * 5 }} corner={{ all: 4.5, TL: 0, TR: 0 }} shadow={[{ x: 0, y: 0, blur: 5, spread: 0, color: Color.DARK_100 }]} visible={this.state.focus && !this.props.items.isEmpty()} custom={{ clipPath: "inset(0px -5px -5px -5px)" }}>
						{this.props.items.map((item, index) => {
							return (
								<Button key={index} color={this.state.index === index ? Color.DARK_500 : "inherit"} height={40}
									onMouseDown={(style) => {
										this.setState((state) => ({ index: NaN }), () => this.props.onSelect?.(item.first));
									}}
									onMouseEnter={(style) => {
										this.setState((state) => ({ index: index }), () => this.props.onIndex?.(index));
									}}>
									<Text left={15} children={item.first.split(this.props.highlight!).map((text, index, array) => array.length > index + 1 ? text.isEmpty() ? { text: this.props.highlight, color: Color.RGBA_000 } : [{ text: text }, { text: this.props.highlight, color: Color.RGBA_000 }] : { text: text }).flat().map((text) => ({ ...text, size: 13.5 })) as Text["props"]["children"]}/>
									<Text right={15} children={[{ text: item.second, size: 14.5, color: Color.DARK_000 }]}/>
								</Button>
							);
						})}
					</Container>
				</Scroll>
			</Element>
		);
	}
}

export default Dropdown;
