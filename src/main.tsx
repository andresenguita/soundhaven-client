import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SpotifyProvider } from "./context/SpotifyContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SpotifyProvider>
        <App />
      </SpotifyProvider>
    </BrowserRouter>
  </React.StrictMode>
);
