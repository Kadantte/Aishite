export const _print = console.debug;

Object.defineProperty(window, "print", { value: _print });
