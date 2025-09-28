import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// IMPORTANT: match the real filename case
import "./Index.css"; // use "./index.css" if your file is lowercase

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);