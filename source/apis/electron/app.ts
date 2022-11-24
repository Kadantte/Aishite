class App {
	public get width() {
		return window.innerWidth;
	}
	public get height() {
		return window.innerHeight;
	}
	public get min_width() {
		return Math.round(this.max_width * 0.3);
	}
	public get min_height() {
		return Math.round((this.max_height - 180.0 - (/* GALLERY GAP */ 20.0)) * 0.5 + 180.0);
	}
	public get max_width() {
		return screen.width;
	}
	public get max_height() {
		return screen.height - (/* WIN11 TASKBAR HEIGHT */ 48.0);
	}
}

Object.defineProperty(window, "app", {
	value: new App()
});

export default App;
