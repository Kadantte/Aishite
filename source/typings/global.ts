import "source/prototypes";

import Chromium from "apis/electron/chromium";
import Resolution from "apis/electron/resolution";

declare global {
	// preload.ts
	const space: "\u0020";
	const comma: "\u002C";

	const chromium: Chromium;
	const resolution: Resolution;
}

export default {};
