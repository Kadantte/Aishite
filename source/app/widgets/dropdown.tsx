import Color from "app/common/color";
import { Props } from "app/common/props";
import { Stateful } from "app/common/framework";

import Row from "app/layout/row";
import Text from "app/layout/text";
import Form from "app/layout/form";
import Center from "app/layout/center";
import Container from "app/layout/container";

import Scroll from "app/layout/casacade/scroll";

import Close from "app/icons/close";

import Button from "app/widgets/button";

interface DropdownProps extends Props.Clear<undefined>, Props.Style, Props.Toggle {
	// required
	readonly items: Array<[string, string]>;
	// optional
	readonly index?: number;
	readonly value?: string;
	readonly fallback?: string;
	readonly highlight?: string;
	// events
	readonly onReset?: VoidFunction;
	readonly onHover?: (callback: number) => void;
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
		return {
			index: this.props.index ?? NaN,
			hover: false,
			focus: false
		};
	}
	protected events() {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {
			// manually
			overflow: "visible"
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<section id={this.props.id ?? "dropdown"}>
				<Container constraint={{ height: 40.0 }} decoration={{ color: !this.props.enable ? undefined : !this.state.hover && !this.state.focus ? undefined : Color.pick(3.0), border: { all: { width: 1.5, style: "solid", color: !this.props.enable ? Color.pick(3.0) : !this.state.hover && !this.state.focus ? Color.pick(3.0) : Color.pick(5.0) }, bottom: this.state.focus && !this.props.items.isEmpty ? { color: "transparent" } : undefined }, corner: this.state.focus && !this.props.items.isEmpty ? { TL: 5.0, TR: 5.0 } : { all: 5.0 }, shadow: !this.props.enable ? undefined : !this.state.hover && !this.state.focus ? undefined : [{ x: 0.0, y: 0.0, blur: 5.0, spread: 0.0, color: Color.pick(1.0) }] }}
					onMouseEnter={(setStyle) => {
						this.setState((state) => ({ hover: true }));
					}}
					onMouseLeave={(setStyle) => {
						this.setState((state) => ({ hover: false }));
					}}>
					<Row>
						<Form enable={this.props.enable} value={this.props.value} fallback={this.props.fallback} offset={{ margin: { left: 15.0, right: 15.0 } }}
							onBlur={() => {
								this.setState((state) => ({ focus: false }));
							}}
							onFocus={() => {
								this.setState((state) => ({ focus: true }));
							}}
							onSubmit={(text) => {
								if (isNaN(this.state.index)) return this.props.onSubmit?.(text);
								if (this.props.items.isEmpty) return this.props.onSubmit?.(text);
								else this.props.onSelect?.(this.props.items[this.state.index][0]);

								this.setState((state) => ({ index: NaN }));
							}}
							onChange={(text) => {
								this.props.onChange?.(text);
							}}
							onTyping={(text) => {
								if (this.props.items.isEmpty) return this.props.onTyping?.(text) ?? true;

								switch (text) {
									case "ArrowUp": {
										if (isNaN(this.state.index)) this.state.index = 0; else this.state.index--;
										break;
									}
									case "ArrowDown": {
										if (isNaN(this.state.index)) this.state.index = 0; else this.state.index++;
										break;
									}
								}
								this.setState((state) => ({ index: state.index.clamp(0, this.props.items.length - 1) }), () => {
									// auto-scroll
									this.node().querySelector("[id=\"items\"]")?.scrollTo({ top: this.state.index * (40.0 + 5.0) });

									this.props.onHover?.(this.state.index);
								});

								return this.props.onTyping?.(text) ?? true;
							}}
						/>
						<Center x={true} y={true} constraint={{ width: 50.0 }}>
							<Close color={Color.pick(5.0)}
								onMouseDown={(setStyle) => {
									if (!this.props.enable) return;

									this.props.onReset?.();
								}}
								onMouseEnter={(setStyle) => {
									if (!this.props.enable) return;

									setStyle("#AAAAAA");
								}}
								onMouseLeave={(setStyle) => {
									if (!this.props.enable) return;
									
									setStyle(undefined);
								}}
							/>
						</Center>
					</Row>
				</Container>
				<Scroll x="hidden" y="scroll">
					<Container id="items" position={{ top: 100.0 + "%" }} constraint={{ width: 100.0 + "%", maximum: { height: (40.0 * 5) + (5.0 * 6) } }} decoration={{ color: Color.pick(3.0), border: { all: { width: 1.5, style: "solid", color: Color.pick(5.0) }, top: { color: "transparent" } }, corner: { BL: 5.0, BR: 5.0 }, shadow: [{ x: -5.0, y: 0.0, blur: 5.0, spread: -5.0, color: Color.pick(1.0) }, { x: 5.0, y: 0.0, blur: 5.0, spread: -5.0, color: Color.pick(1.0) }, { x: 0.0, y: 5.0, blur: 5.0, spread: -5.0, color: Color.pick(1.0) }] }} flags={{ visible: this.state.focus && !this.props.items.isEmpty }}>
						{this.props.items.map((item, index) => {
							// cache
							const [buffer, fragment] = [[] as Text["props"]["children"], this.props.highlight ? item.first.split(this.props.highlight) : [item.first]];

							for (let index = 0; index < fragment.length; index++) {
								if (fragment.length > index + 1) {
									if (fragment[index].isEmpty) {
										buffer?.push({ value: this.props.highlight as string, color: "aquamarine" });
									}
									else {
										buffer?.push({ value: fragment[index] }, { value: this.props.highlight as string, color: "aquamarine" });
									}
								}
								else {
									buffer?.push({ value: fragment[index] });
								}
							}

							return (
								<Button key={index} offset={{ margin: { all: 5.0 } }} constraint={{ height: 40.0 }} decoration={{ color: this.state.index === index ? Color.pick(4.5) : Color.pick(3.5), corner: { all: 5.0 } }}
									onMouseDown={(setStyle) => {
										this.setState((state) => ({ index: NaN }), () => this.props.onSelect?.(item.first));
									}}
									onMouseEnter={(setStyle) => {
										this.setState((state) => ({ index: index }), () => this.props.onHover?.(index));
									}}>
									<Text position={{ left: 15.0 }}>{buffer}</Text>
									<Text position={{ right: 15.0 }}>{[{ value: item.last, color: Color.pick(5.0) }]}</Text>
								</Button>
							);
						})}
					</Container>
				</Scroll>
			</section>
		);
	}
}

export default Dropdown;
