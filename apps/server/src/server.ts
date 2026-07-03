/** Entry point: `npm run online`. See app.ts for the actual server wiring. */
import { createOnlineServer } from "./app.ts";

const PORT = Number(process.env.PORT ?? 7788);

createOnlineServer().http.listen(PORT, () => {
  console.log(`Ibokki online server — ws://localhost:${PORT}/ws  (health: http://localhost:${PORT}/health)`);
});
