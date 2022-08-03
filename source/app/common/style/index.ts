import Size from "@/app/common/style/size";
import Border from "@/app/common/style/border";
import Corner from "@/app/common/style/corner";
import Shadow from "@/app/common/style/shadow";
import Margin from "@/app/common/style/margin";
import Padding from "@/app/common/style/padding";
import Position from "@/app/common/style/position";
import Transition from "@/app/common/style/transition";

interface CSS {
	size: Parameters<typeof Size>[0];
	border: Parameters<typeof Border>[0];
	corner: Parameters<typeof Corner>[0];
	shadow: Parameters<typeof Shadow>[0];
	margin: Parameters<typeof Margin>[0];
	padding: Parameters<typeof Padding>[0];
	position: Parameters<typeof Position>[0];
	transition: Parameters<typeof Transition>[0];
}

class CSS {
	public static get Size() {
		return Size;
	}
	public static get Border() {
		return Border;
	}
	public static get Corner() {
		return Corner;
	}
	public static get Shadow() {
		return Shadow;
	}
	public static get Margin() {
		return Margin;
	}
	public static get Padding() {
		return Padding;
	}
	public static get Position() {
		return Position;
	}
	public static get Transition() {
		return Transition;
	}
}

export default CSS;
