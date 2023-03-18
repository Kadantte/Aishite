import "@/prototypes";
import "@/decorators";

import "apis/electron/chromium";
import "@/apis/electron/resolution";

Object.defineProperty(window, "space", {
	value: "\u0020"
});

Object.defineProperty(window, "comma", {
	value: "\u002C"
});

Object.defineProperty(window, "__dirname", {
	value: __dirname.split("app.asar")[0]
});
