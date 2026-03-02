import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import { store } from "./redux/store";
import { ThemeProvider } from "./theme/ThemeProvider";

// keep initial theme attribute (prevents flash)
const saved = localStorage.getItem("fl_theme") || "light";
document.documentElement.setAttribute("data-theme", saved);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);