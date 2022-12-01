interface DataView {
	getUint64(offset: number, endian: boolean): number;
}

Object.defineProperty(DataView.prototype, "getUint64", {
	value(offset: number, endian: boolean) {
		const first = this.getUint32(offset, endian);
		const second = this.getUint32(offset + 4, endian);
		
		return endian ? first + 2 ** 32 * second : 2 ** 32 * first + second;
	}	
});
