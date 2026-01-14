import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Add body styles
document.body.className = "m-0 p-0 overflow-x-hidden w-full font-sans flex flex-col items-center p-8 bg-gray-50";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
