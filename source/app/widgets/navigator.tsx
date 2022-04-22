import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import Row from "@/app/layout/row";
import Text from "@/app/layout/text";
import Container from "@/app/layout/container";

import Offset from "@/app/layout/casacade/offset";
import Spacer from "@/app/layout/casacade/spacer";
import Position from "@/app/layout/casacade/position";

import Button from "@/app/widgets/button";

import Plus from "@/app/icons/plus";
import Close from "@/app/icons/close";

import navigator from "@/manager/navigator";

class NavigatorProps extends Props<undefined> {
	constructor(args: Args<NavigatorProps>) {
		super(args);
	}
}

class NavigatorState {
	constructor(args: Args<NavigatorState>) { }
}

class Navigator extends Stateful<NavigatorProps, NavigatorState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			// render
			this.forceUpdate();
		});
		return new NavigatorState({});
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Row id={"navigator"}>
				{navigator.state.pages.map((page, index) => {
					return (
						<Spacer key={index}>
							<Container size={{ minimum: { width: Unit(29.5) }, maximum: { width: Unit(250) } }} decoration={{ border: { top: [2.5, "solid", navigator.state.index === index ? Color.SPOTLIGHT : "transparent"], bottom: [2.5] }, background: { color: navigator.state.index === index ? Color.DARK_200 : Color.DARK_000 } }}
								onMouseDown={(I) => {
									if (navigator.state.index !== index) {
										I.style(null, () => {
											navigator.jump(index);
										});
									}
								}}
								onMouseEnter={(I) => {
									if (navigator.state.index !== index) {
										I.style({ border: { top: [2.5, "solid", Color.DARK_200] }, background: { color: Color.DARK_100 } });
									}
								}}
								onMouseLeave={(I) => {
									I.style(null);
								}}>
								<Position all={Unit(7.5)} left={Unit(10)} right={Unit(29.5)}>
									<Text id={"title"}>{[{ value: page.title }]}</Text>
								</Position>
								<Position all={Unit(7.5)} left={"auto"} right={Unit(5)}>
									<Button width={Unit(19.5)} height={Unit(19.5)} decoration={{ corner: { all: Unit(2.5) } }}
										onMouseDown={(I) => {
											navigator.close(index);
										}}
										onMouseEnter={(I) => {
											I.style({ background: { color: Color.SPOTLIGHT } });
										}}
										onMouseLeave={(I) => {
											I.style(null);
										}}
										children={<Close/>}
									/>
								</Position>
							</Container>
						</Spacer>
					);
				}) as never}
				<Offset type={"margin"} all={Unit(20 - 13.25)}>
					<Button width={Unit(26.5)} height={Unit(26.5)} decoration={{ corner: { all: Unit(2.5) }, background: { color: Color.DARK_100 } }}
						onMouseDown={(I) => {
							navigator.open("New Tab", "FALLBACK", {});
						}}
						onMouseEnter={(I) => {
							I.style({ background: { color: Color.DARK_300 } });
						}}
						onMouseLeave={(I) => {
							I.style(null);
						}}
						children={<Plus/>}
					/>
				</Offset>
			</Row>
		);
	}
}

export default Navigator;
