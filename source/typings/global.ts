import "@/prototypes";

import App from "@/apis/electron/app";
import Chromium from "@/apis/electron/chromium";

declare global {
	// preload.ts
	const space: "\u0020";
	const comma: "\u002C";

	const app: App;
	const chromium: Chromium;
}

export default {}
