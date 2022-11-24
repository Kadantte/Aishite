class Color {
	constructor(
		public readonly R: number,
		public readonly G: number,
		public readonly B: number
	) {
		this.R = R.clamp(0, 255);
		this.G = G.clamp(0, 255);
		this.B = B.clamp(0, 255);
	}
	public toString() {
		return "#" + [this.R, this.G, this.B].map((value) => value.toString(16)).join("");
	}
}

class Palette {
	private readonly _cache: Map<number, Color>;
	private readonly _R: number;
	private readonly _G: number;
	private readonly _B: number;
	private readonly _minimum: Color;

	constructor(minimum: Color, maximum: Color) {
		this._cache = new Map();
		this._R = (maximum.R - minimum.R) / 10;
		this._G = (maximum.G - minimum.G) / 10;
		this._B = (maximum.B - minimum.B) / 10;
		this._minimum = minimum;
	}
	public pick(index: number) {
		if (this._cache.has(index)) return this._cache.get(index)!.toString();

		const color = new Color(Math.round(this._minimum.R + this._R * index), Math.round(this._minimum.G + this._G * index), Math.round(this._minimum.B + this._B * index));

		this._cache.set(index, color);

		return color.toString();
	}
}

export default new Palette(new Color(0x11, 0x11, 0x11), new Color(0xA0, 0xA0, 0xA0));
