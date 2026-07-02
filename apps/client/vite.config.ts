import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The client is a pure presentation layer: it never touches the engine directly, it talks to the
// local play server (apps/playvsclaude, :7777) over the /api contract. In dev we proxy /api there so
// the browser sees a single origin. Run `npm run play` alongside `npm run client`.
const PLAY_SERVER = process.env.IBOKKI_API ?? "http://localhost:7777";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: PLAY_SERVER, changeOrigin: true },
    },
  },
});
