export namespace Endian {
	export const BIG = false;
	export const LITTLE = true;
}
export type Endian = (typeof Endian)[keyof typeof Endian];
