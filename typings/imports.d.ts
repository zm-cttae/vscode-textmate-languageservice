// wiring from webpack `encoded-uint8array-loader` to inline WASM buffer view
declare module '*.wasm' {
	const bufview: string;
	export = bufview;
}
