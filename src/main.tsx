import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Bootstrap global styles (layout, buttons, forms, utilities).
// This import makes Bootstrap classes like `btn btn-primary` available across the app.
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
