import ReactDOM from "react-dom/client";

import App from "@/app";

const element = document.getElementById("app");

if (!element) throw Error();

window.addEventListener("keydown", (event) => {
	if (event.key === "F12") {
		chromium.development();
	}
});

ReactDOM.createRoot(element).render(<App></App>);
