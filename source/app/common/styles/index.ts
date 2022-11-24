import size from "@/app/common/styles/size";
import border from "@/app/common/styles/border";
import corner from "@/app/common/styles/corner";
import shadow from "@/app/common/styles/shadow";
import margin from "@/app/common/styles/margin";
import padding from "@/app/common/styles/padding";
import position from "@/app/common/styles/position";
import transition from "@/app/common/styles/transition";

interface Style {
	size: Parameters<typeof size>[0];
	border: Parameters<typeof border>[0];
	corner: Parameters<typeof corner>[0];
	shadow: Parameters<typeof shadow>[0];
	margin: Parameters<typeof margin>[0];
	padding: Parameters<typeof padding>[0];
	position: Parameters<typeof position>[0];
	transition: Parameters<typeof transition>[0];
}

class Style {
	public static get size() {
		return size;
	}
	public static get border() {
		return border;
	}
	public static get corner() {
		return corner;
	}
	public static get shadow() {
		return shadow;
	}
	public static get margin() {
		return margin;
	}
	public static get padding() {
		return padding;
	}
	public static get position() {
		return position;
	}
	public static get transition() {
		return transition;
	}
}

export default Style;
