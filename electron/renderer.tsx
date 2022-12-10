import ReactDOM from "react-dom/client";

import App from "app/index";

const element = document.getElementById("root");

if (!element) throw Error();

ReactDOM.createRoot(element).render(<App></App>);
