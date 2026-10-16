import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import App from "./App";
import "./styles/index.css";

// One page, so the router never changes the address: the site works from any
// path, including a GitHub Pages project URL (username.github.io/repo/).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </StrictMode>,
);
