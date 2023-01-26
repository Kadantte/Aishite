/* eslint-disable @typescript-eslint/no-var-requires */

const package = require("../package.json");

function directory(...args) {
	return require("path").resolve(__dirname, "..", ...args);
}

function webpack() {
	return {
		module: {
			rules: [
				{
					test: [/\.tsx?$/],
					use: [{ loader: "babel-loader" }, { loader: "ts-loader" }]
				}
			]
		},
		output: {
			path: directory("build")
		},
		resolve: {
			alias: {
				"@": directory("source"),
				"app": directory("source", "app"),
				"apis": directory("source", "apis"),
				"assets": directory("source", "assets"),
				"models": directory("source", "models"),
				"modules": directory("source", "modules"),
				"handles": directory("source", "handles"),
			},
			extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
		},
		optimization: {
			minimizer: [
				new (require("terser-webpack-plugin"))({
					terserOptions: {
						output: {
							ecma: 2020,
							comments: false
						},
						compress: {
							ecma: 2020,
							module: true,
							unsafe: true
						}
					},
					parallel: true
				})
			],
			minimize: true
		},
		plugins: []
	};
}

function read(path) {
	return require("fs").readFileSync(path);
}

function write(path, content) {
	require("fs").mkdirSync(require("path").dirname(path), { recursive: true });
	require("fs").writeFileSync(path, content);
}

async function init() {
	// index.html
	write(directory("build", "index.html"), read(directory("electron", "index.html")));
	// package.json
	write(directory("build", "package.json"), JSON.stringify({ name: package.name, main: package.main, version: package.version, description: package.description }));
}

function main() {
	const settings = webpack();

	settings.entry = directory("electron", "main.ts");
	settings.target = "electron-main";
	settings.output = {
		...settings.output,
		filename: "main.js"
	};

	return settings;
}

function preload() {
	const settings = webpack();

	settings.entry = directory("electron", "preload.ts");
	settings.target = "electron-preload";
	settings.output = {
		...settings.output,
		filename: "preload.js"
	};

	return settings;
}

function renderer() {
	const settings = webpack();

	settings.entry = directory("electron", "renderer.tsx");
	settings.target = "electron-renderer";
	settings.output = {
		...settings.output,
		filename: "renderer.js"
	};

	return settings;
}

module.exports = {
	init: init,
	main: main,
	preload: preload,
	renderer: renderer
};
