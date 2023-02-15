/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require("webpack");
const builder = require("electron-builder");
const { init, main, preload, renderer } = require("./webpack.config.js");

const compiler = {
	"main": {
		ready: 0,
		instance: undefined
	},
	"preload": {
		ready: 0,
		instance: undefined
	},
	"renderer": {
		ready: 0,
		instance: undefined
	}
};

function bundle(key) {
	// update
	compiler[key].ready++;

	console.log(`${"\x1b[31m"}${key}${"\x1b[0m"} is bundled`);

	if (!Object.values(compiler).every((instance) => instance.ready)) return;

	builder.build({
		targets: builder.Platform.WINDOWS.createTarget("zip"),
		config: {
			nsis: {
				oneClick: false,
				perMachine: true,
				installerIcon: "../source/assets/icon.ico",
				uninstallerIcon: "../source/assets/icon.ico"
			},
			files: [
				"build/*.js",
				"build/*.json",
				"build/*.html",
			],
			directories: {
				output: "releases"
			},
			icon: "../source/assets/icon.ico"
		}
	});

	Object.values(compiler).every((instance) => instance.close());
}

function instance(data) {
	return webpack({
		...data,
		mode: "development",
		watch: false,
		plugins: [
			new webpack.DefinePlugin({
				"process.env": {
					"NODE_ENV": JSON.stringify("production")
				}
			})
		],
		devtool: "inline-nosources-cheap-module-source-map"
	}, () => {
		// TODO: none
	});
}

init().then(() => {
	compiler["main"].instance = instance(main());
	compiler["preload"].instance = instance(preload());
	compiler["renderer"].instance = instance(renderer());
	
	compiler["main"].instance.hooks.done.tap("done", () => bundle("main"));
	compiler["preload"].instance.hooks.done.tap("done", () => bundle("preload"));
	compiler["renderer"].instance.hooks.done.tap("done", () => bundle("renderer"));
});
