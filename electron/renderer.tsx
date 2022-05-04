import ReactDOM from "react-dom/client";

import "@/apis/electron/bridge";
import "@/apis/electron/command";

import App from "@/app";

const element = document.getElementById("app");

if (element) {
	ReactDOM.createRoot(element).render(<App></App>);
}
