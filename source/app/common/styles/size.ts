interface Size {
	readonly type?: boolean;
	readonly width?: unit;
	readonly height?: unit;
}

function size(style: Size): React.CSSProperties {
	if ((style.width ?? style.height) === undefined) return {};

	switch (style.type) {
		case true: {
			return {
				maxWidth: style.width,
				maxHeight: style.height,
				flexShrink: (style.width ?? style.height) === undefined ? undefined : 0.0
			};
		}
		case false: {
			return {
				minWidth: style.width,
				minHeight: style.height,
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

export default size;
