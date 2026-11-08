import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import App from "./App.jsx";
import { store, hydrateStore } from "./app/store.js";

async function startApp() {
  try {
    // Load existing data before displaying the application.
    await hydrateStore();

    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>
    );
  } catch (error) {
    console.error("Application initialization failed:", error);

    document.getElementById("root").innerHTML =
      "<h2>Unable to load AgriFlow. Please refresh the page.</h2>";
  }
}

startApp();
