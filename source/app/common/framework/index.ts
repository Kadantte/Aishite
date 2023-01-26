import Style from "app/common/styles";
import { Props, CSSPlus, CSSFlag } from "app/common/props";

import Stateful from "app/common/framework/stateful";
import Stateless from "app/common/framework/stateless";
import StyleSheet from "app/common/framework/stylesheet";

namespace CSSProps {
	export function plus(props: Props.Clear<unknown> & Props.Style) {
		const data: React.CSSProperties = {};
	
		if (props[CSSPlus.OFFSET]) {
			Object.assign(data, {
				...Style.margin(props[CSSPlus.OFFSET].margin ?? {}),
				...Style.padding(props[CSSPlus.OFFSET].padding ?? {})
			});
		}
		if (props[CSSPlus.POSITION]) {
			Object.assign(data, {
				...Style.position(props[CSSPlus.POSITION] ?? {})
			});
		}
		if (props[CSSPlus.CONSTRAINT]) {
			Object.assign(data, {
				...Style.size({
					type: true,
					...props[CSSPlus.CONSTRAINT].maximum
				}),
				...Style.size({
					type: false,
					...props[CSSPlus.CONSTRAINT].minimum
				}),
				...Style.size({
					type: undefined,
					width: props[CSSPlus.CONSTRAINT].width,
					height: props[CSSPlus.CONSTRAINT].height
				}),
			});
		}
		if (props[CSSPlus.DECORATION]) {
			Object.assign(data, {
				// handfully
				backgroundColor: props[CSSPlus.DECORATION].color,
				backgroundImage: props[CSSPlus.DECORATION].image,
				// automatic
				...Style.border(props[CSSPlus.DECORATION].border ?? {}),
				...Style.corner(props[CSSPlus.DECORATION].corner ?? {}),
				...Style.shadow(props[CSSPlus.DECORATION].shadow ?? []),
				// handfully
				opacity: props[CSSPlus.DECORATION].opacity !== undefined ? (props[CSSPlus.DECORATION].opacity.clamp(0.0, 100.0) / 100.0) : undefined
			});
		}
		return data;
	}
	export function flag(props: Props.Clear<unknown> & Props.Style) {
		const data: React.CSSProperties = {};
	
		if (props.flags?.[CSSFlag.VISIBLE] === false) {
			Object.assign(data, {
				display: "none"
			});
		}
		if (props.flags?.[CSSFlag.DRAGGABLE] !== undefined) {
			Object.assign(data, {
				WebkitAppRegion: props.flags[CSSFlag.DRAGGABLE] ? "drag" : "no-drag"
			});
		}
		return data;
	}
}

export {
	CSSProps,
	Stateful,
	Stateless,
	StyleSheet
};
