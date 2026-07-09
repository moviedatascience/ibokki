/** Entry point: `npm run online`. See app.ts for the actual server wiring. */
import { createOnlineServer } from "./app.ts";

const PORT = Number(process.env.PORT ?? 7788);

const srv = createOnlineServer();
srv.http.listen(PORT, () => {
  console.log(`Ibokki online server — ws://localhost:${PORT}/ws  (health: http://localhost:${PORT}/health)`);
});

// Graceful shutdown: systemd/docker send SIGTERM on every redeploy. Notify connected
// clients, stop the timers, and close the sockets before the process is hard-killed —
// otherwise in-flight requests are severed abruptly and cleanup never runs. A hard
// timeout guarantees we still exit if a close hangs.
let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received — shutting down gracefully`);
  const kill = setTimeout(() => {
    console.error("graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000);
  kill.unref();
  try {
    await srv.shutdown();
    clearTimeout(kill);
    process.exit(0);
  } catch (err) {
    console.error("error during shutdown:", err);
    process.exit(1);
  }
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

// Last-resort process guards. Timer/message callbacks are already wrapped, so these
// should be rare; log them loudly rather than dying silently. An uncaught exception
// leaves the process in an undefined state, so drain and let the supervisor restart.
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
  void shutdown("uncaughtException");
});
