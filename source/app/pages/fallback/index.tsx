import Page from "@/app/pages";

import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { EventManager } from "@/app/common/framework";

import Text from "@/app/layout/text";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";

import Stack from "@/app/layout/casacade/stack";
import Spacer from "@/app/layout/casacade/spacer";
import Offset from "@/app/layout/casacade/offset";
import Transform from "@/app/layout/casacade/transform";

import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";

import discord from "@/modules/discord";

import navigator from "@/manager/navigator";

class FallbackProps extends Props<undefined> {
	constructor(args: Args<FallbackProps>) {
		super(args);
	}
}

class FallbackState {
	public index: number;

	constructor(args: Args<FallbackState>) {
		this.index = args.index;
	}
}

class Fallback extends Page<FallbackProps, FallbackState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (this.visible()) this.discord(false);
		});
		return new FallbackState({ index: 0 });
	}
	protected events() {
		return [
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) this.discord(false);
			})
		];
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (
			<Column id={"fallback"}>
				<Spacer>
					<section>
						<Stack>
							{[
								{
									title: "Browser",
									children: <Offset type={"margin"} all={Unit(29.5)}>
										<Button width={"auto"} height={Unit(29.5)} decoration={{ corner: { all: Unit(4.5) }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: Color.DARK_400 } }}
											onMouseDown={(I) => {
												navigator.replace("language:all", "BROWSER", {});
											}}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.DARK_500 } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
											children={<Text>{[{ value: "Click to open new Browser" }]}</Text>}
										/>
									</Offset>,
									description: [
										{ value: "Browse galleries that matches your taste by providing query text to the form input." },
										"\n",
										{ value: "e.g. language:english type:doujinshi", style: "italic" }
									]
								},
								{
									title: "Viewer",
									children: undefined,
									description: [
										{ value: "Plunge down to desired content directly by providing GalleryID to the form input." },
										"\n",
										{ value: "warning: valid range is unknown", style: "italic" }
									]
								},
								{
									title: "Discord",
									children: undefined,
									description: [
										{ value: "Visit our Discord server to reach out your concern in no time." },
										"\n",
										{ value: "https://discord.gg/Gp7tWCe", style: "italic" }
									]
								}
							].map(({ title, children, description }, index) => {
								return (
									<Transform key={index} translate={[Unit((index - this.state.index) * 100, "%"), Unit(0, "%")]}>
										<Center x={true} y={true}>
											<section>
												<Offset type={"margin"} all={Unit(9.5)}>
													<Center x={true} y={true}><Text>{[{ value: title, size: Unit(24.5), weight: "bold" }]}</Text></Center>
													<Text>{description as any}</Text>
													{children}
												</Offset>
											</section>
										</Center>
									</Transform>
								);
							})}
						</Stack>
					</section>
				</Spacer>
				<Offset type={"margin"} top={Unit(29.5)} bottom={Unit(29.5)}>
					<Paging height={Unit(20)} toggle={true} index={0} length={3} overflow={3} firstShortcut={false} lastShortcut={false}
						onPaging={(index) => {
							if (!this.visible()) {
								return false;
							}
							// update
							this.setState({ ...this.state, index: index });
							// approve
							return true;
						}}
						builder={(key, index, indexing, jump) => {
							return (
								<Offset key={key} type={"margin"} left={Unit(69)} right={Unit(69)}>
									<Button width={Unit(20)} decoration={{ corner: { all: Unit(100, "%") }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: indexing ? Color.SPOTLIGHT : Color.DARK_500 } }}
										onMouseDown={(I) => {
											I.style(null, jump);
										}}
										onMouseEnter={(I) => {
											if (!indexing) {
												I.style({ background: { color: Color.TEXT_000 } });
											}
										}}
										onMouseLeave={(I) => {
											I.style(null);
										}}
									/>
								</Offset>
							);
						}}
					/>
				</Offset>
			</Column>
		);
	}
	protected discord(state: boolean) {
		switch (state) {
			case true:
			case false: {
				discord.update({
					state: "IDLE",
					details: "Beep-beep...",
					partyMax: undefined,
					partySize: undefined
				});
				break;
			}
		}
	}
}

export default Fallback;
