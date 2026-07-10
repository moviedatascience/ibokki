import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { loadCardArtManifest } from "./cardArtManifest.ts";
// Self-hosted webfonts (style bible §10): IM Fell English (+SC) display, Alegreya rules
// text; UI utility text stays on the system stack. Vite bundles the woff2 under BASE.
import "@fontsource/im-fell-english/400.css";
import "@fontsource/im-fell-english-sc/400.css";
import "@fontsource/alegreya/400.css";
import "@fontsource/alegreya/500.css";
import "@fontsource/alegreya/700.css";
import "@fontsource/alegreya/400-italic.css";
import "./styles.css";

void loadCardArtManifest(); // which card illustrations ship — resolved before any match starts

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
