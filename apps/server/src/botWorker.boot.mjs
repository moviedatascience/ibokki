/**
 * Worker boot shim: plain .mjs so Node can load it under ANY parent runtime
 * (tsx CLI, node --import tsx, vitest) — the tsx loader does not propagate into
 * nested worker threads, so the worker registers it for itself and then pulls
 * in the real TS entry. Messages posted before the entry attaches its listener
 * are queued by the port, not dropped.
 */
import { register } from "tsx/esm/api";

register();
await import("./botWorker.ts");
