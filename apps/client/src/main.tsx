import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { ReplayViewer } from "./components/ReplayViewer.tsx";
import type { ReplaySource } from "./api.ts";
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

// Replay links open a standalone viewer instead of the app: ?replay=<share token>
// (public) or ?rewatch=<match id> (the signed-in viewer's own history). Read once at
// module scope, and left in the URL so a browser refresh reloads the same replay.
const params = new URLSearchParams(location.search);
const token = params.get("replay");
const rewatch = params.get("rewatch");
const replaySource: ReplaySource | null = token ? { token } : rewatch && /^\d+$/.test(rewatch) ? { matchId: Number(rewatch) } : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>{replaySource ? <ReplayViewer source={replaySource} /> : <App />}</StrictMode>,
);
