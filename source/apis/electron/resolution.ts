class Resolution {
	public get width() {
		const maximum = screen.width;

		return { value: window.innerWidth, minimum: Math.round(maximum * 0.3), maximum: maximum };
	}
	public get height() {
		const maximum = screen.height - (/* WIN11 TASKBAR HEIGHT */ 48.0);

		return { value: window.innerHeight, minimum: Math.round((maximum - 180.0 - (/* GALLERY GAP */ 20.0)) * 0.5 + 180.0), maximum: maximum };
	}
}

Object.defineProperty(window, "resolution", {
	value: new Resolution()
});

export default Resolution;
