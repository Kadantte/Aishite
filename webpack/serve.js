/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require("webpack");
const { init, main, preload, renderer } = require("./webpack.config.js");

let reload = 0;

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

	console.log(`${"\x1b[31m"}${key}${"\x1b[0m"} is bundled for ${compiler[key].ready} time(s)`);

	if (reload > 0) return;

	if (!Object.values(compiler).every((instance) => instance.ready)) return;

	const electron = require("child_process").spawn("npx.cmd", ["electron", "."], { args: ["--colors", "--inspect=5858"], stdio: [process.stdin, process.stdout, "pipe"] });

	electron.on("close", () => process.exit());

	reload++;
}

function instance(data) {
	return webpack({
		...data,
		mode: "development",
		watch: true,
		plugins: [
			new webpack.DefinePlugin({
				"process.env": {
					"NODE_ENV": JSON.stringify("development")
				}
			})
		],
		devtool: "eval-cheap-module-source-map"
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
