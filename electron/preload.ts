import "@/prototypes";
import "@/decorators";

Object.defineProperty(window, "space", {
	value: "\u0020"
});

Object.defineProperty(window, "comma", {
	value: "\u002C"
});

Object.defineProperty(window, "__dirname", {
	value: __dirname.split("app.asar").first
});

Object.defineProperty(window, "responsive", {
	value: {
		width: Math.round((screen.width - 30) * 0.3 + 30),
		height: Math.round((screen.height - 230) * 0.5 + 170)
	}
});
