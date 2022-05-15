class MediaQuery {
	public get width() {
		return Math.round((screen.width - 30) * 0.3 + 30);
	}
	public get height() {
		return Math.round((screen.height - 230) * 0.5 + 170);
	}
}

const singleton = new MediaQuery();

export default singleton;
