import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";
import { ThemeProvider } from "./theme/ThemeProvider";


// keep initial theme attribute (prevents flash)
const savedMode = localStorage.getItem("fl_theme") || "light";
const savedAccent = localStorage.getItem("fl_accent_theme") || "blue";

document.documentElement.setAttribute("data-theme", savedMode);
document.documentElement.setAttribute("data-accent-theme", savedAccent);

registerSW({
  immediate: true
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);