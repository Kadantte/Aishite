import Unit from "@/app/common/unit";

type Type = ("minimum" | "maximum");

interface Size {
	readonly type?: Type;
	readonly width?: Unit;
	readonly height?: Unit;
}

function Size(style: Size): React.CSSProperties {
	// check before
	if ((style.width ?? style.height) === undefined) return {};

	switch (style.type) {
		case "minimum": {
			return {
				minWidth: style.width,
				minHeight: style.height,
				flexShrink: (style.width ?? style.height) === undefined ? undefined : 0.0
			};
		}
		case "maximum": {
			return {
				maxWidth: style.width,
				maxHeight: style.height,
				flexShrink: (style.width ?? style.height) === undefined ? undefined : 0.0
			};
		}
		default: {
			return {
				width: style.width,
				height: style.height,
				flexShrink: (style.width ?? style.height)?.toString().includes("%") ? 1.0 : 0.0
			};
		}
	}
}

export default Size;
