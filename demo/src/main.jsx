import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

document.body.className = "m-0 min-h-screen w-full overflow-x-hidden bg-slate-50";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
