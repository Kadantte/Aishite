// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Size from "@/app/layout/size";
import Text from "@/app/layout/text";
import Stack from "@/app/layout/stack";
import Spacer from "@/app/layout/spacer";
import Offset from "@/app/layout/offset";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Transform from "@/app/layout/transform";
// widgets
import Button from "@/app/widgets/button";
import Paging from "@/app/widgets/paging";
// states
import navigator from "@/states/navigator";

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

class Fallback extends Stateful<FallbackProps, FallbackState> {
	protected create() {
		return new FallbackState({ index: 0 });
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
										<Size width={"auto"} height={Unit(29.5)}>
											<Button decoration={{ corner: { all: Unit(4.5) }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: Color.DARK_400 } }}
												onMouseDown={(I) => {
													navigator.replace("language:all", "BROWSER", {});
												}}
												onMouseEnter={(I) => {
													I.style({ background: { color: Color.DARK_500 } });
												}}
												onMouseLeave={(I) => {
													I.style(null);
												}}
												children={<Text>Click to open new Browser</Text>}
											/>
										</Size>
									</Offset>,
									description: [
										"Browse galleries that matches your taste by providing query text to the form input.",
										"e.g. language:english type:doujinshi"
									]
								},
								{
									title: "Viewer",
									children: undefined,
									description: [
										"Plunge down to desired content directly by providing GalleryID to the form input.",
										"warning: valid range is unknown"
									]
								},
								{
									title: "Discord",
									children: undefined,
									description: [
										"Visit our Discord server to reach out your concern in no time.",
										"https://discord.gg/Gp7tWCe"
									]
								}
							].map(({ title, children, description }, x) => {
								return (
									<Transform key={x} translate={[Unit((x - this.state.index) * 100, "%"), Unit(0, "%")]}>
										<Center x={true} y={true}>
											<section>
												<Offset type={"margin"} all={Unit(9.5)}>
													<Center x={true} y={true}><Text size={Unit(24.5)} weight={"bold"} children={title}/></Center>
													<Text type={"normal"} children={description[0]}/>
													<Text type={"italic"} children={description[1]}/>
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
				<Size height={Unit(20)}>
					<Offset type={"margin"} top={Unit(29.5)} bottom={Unit(29.5)}>
						<Paging toggle={true} index={0} length={3} overflow={3} shortcut={{ first: false, last: false }}
							onPaging={(index) => {
								if (!this.visible()) {
									return false;
								}
								// update
								this.setState({ ...this.state, index: index });
								// approve
								return true;
							}}
							onButton={(key, index, indexing, jump) => {
								return (
									<Size key={key} width={Unit(20)}>
										<Offset type={"margin"} left={Unit(69)} right={Unit(69)}>
											<Button decoration={{ corner: { all: Unit(100, "%") }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: indexing ? Color.SPOTLIGHT : Color.DARK_500 } }}
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
									</Size>
								);
							}}
						/>
					</Offset>
				</Size>
			</Column>
		);
	}
	/**
	 * Whether the component is visible
	 */
	protected visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.node()?.closest("section[style*=\"display: block\"]") !== null;
	}
}

export default Fallback;
