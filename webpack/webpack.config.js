const path = require("path");

function resolve_path(...args) {
	return path.resolve(__dirname, "..", ...args);
}

const boilerplate = {
	module: {
		rules: [
			{
				test: [/\.tsx?$/],
				use: [{ loader: "ts-loader" }]
			}
		]
	},
	output: {
		path: resolve_path("build")
	},
	resolve: {
		alias: {
			"@": resolve_path("source"),
			"app": resolve_path("source", "app"),
			"apis": resolve_path("source", "apis"),
			"assets": resolve_path("source", "assets"),
			"models": resolve_path("source", "models"),
			"modules": resolve_path("source", "modules"),
			"handles": resolve_path("source", "handles"),
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
	plugins: new Array()
};

const main = {
	...boilerplate,
	target: "electron-main",
	entry: resolve_path("electron", "main.ts"),
	output: {
		...boilerplate.output,
		filename: "main.js"
	}
};

const preload = {
	...boilerplate,
	target: "electron-preload",
	entry: resolve_path("electron", "preload.ts"),
	output: {
		...boilerplate.output,
		filename: "preload.js"
	}
};

const renderer = {
	...boilerplate,
	target: "electron-renderer",
	entry: resolve_path("electron", "renderer.tsx"),
	output: {
		...boilerplate.output,
		filename: "renderer.js"
	},
	plugins: [
		new (require("html-webpack-plugin"))({
			filename: "index.html",
			template: resolve_path("electron", "index.html")
		})
	]
};

module.exports = {
	main: main,
	preload: preload,
	renderer: renderer
};
