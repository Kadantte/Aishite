import ReactDOM from "react-dom/client";

import App from "@/app";

import client from "@/modules/node.js/request";

const element = document.getElementById("root");

if (!element) throw Error();

(async () => {
	// release only
	if (await chromium.is_packaged()) {
		// cache
		const response = await client.GET("https://api.github.com/repos/Any-Material/Aishite/releases?per_page=100", "json");

		function parse(value: string) {
			return Number(value.match(/-?\d+/g)?.join(""));
		}
		if (parse(response.body[0]["tag_name"]) > parse(await chromium.version())) {
			// update available
			chromium.open_url(response.body[0]["html_url"]);
			// close app
			chromium.close("update");
		}
	}
})();

ReactDOM.createRoot(element).render(<App></App>);
