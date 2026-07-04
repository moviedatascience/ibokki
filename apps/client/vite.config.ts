import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client is a pure presentation layer: it never touches the engine directly. Local (vs bot)
// play talks to apps/playvsclaude (:7777) over /api; online play talks to apps/server (:7788)
// over the /ws WebSocket. Both are proxied so the browser sees a single origin. Run
// `npm run play` and/or `npm run online` alongside `npm run client`.
const PLAY_SERVER = process.env.IBOKKI_API ?? "http://localhost:7777";
const ONLINE_SERVER = process.env.IBOKKI_ONLINE ?? "ws://localhost:7788";
const ONLINE_HTTP = ONLINE_SERVER.replace(/^ws/, "http");

export default defineConfig({
  // "/" for standalone; IBOKKI_BASE=/play/ when built into the ibokki.com site.
  base: process.env.IBOKKI_BASE ?? "/",
  // Baked build id (git sha in Docker). The server reports its own; a mismatch
  // means this tab survived a redeploy on an old bundle → show a refresh banner.
  define: { __IBOKKI_BUILD__: JSON.stringify(process.env.IBOKKI_BUILD ?? "dev") },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Accounts + saved decks live on the online server; match-vs-bot /api stays local.
      "/api/auth": { target: ONLINE_HTTP, changeOrigin: true },
      "/api/decks": { target: ONLINE_HTTP, changeOrigin: true },
      "/api": { target: PLAY_SERVER, changeOrigin: true },
      "/ws": { target: ONLINE_SERVER, ws: true },
    },
  },
});
