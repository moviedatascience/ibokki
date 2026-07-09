/**
 * WebSocket transport for online matches (apps/server, proxied at /ws in dev).
 * Mirrors the wire protocol in @ibokki/protocol without importing it — the client
 * stays a pure view layer. The server pushes full MatchState frames (already
 * redacted and viewer-relative, so 0 = "you" just like local mode); we send
 * action intents by legal-action index.
 *
 * The seat's {code, token} lives in sessionStorage — per-tab, so two tabs on one
 * machine hold two different seats — letting a refreshed tab rejoin its match.
 */
import type { CardCatalog, MatchState } from "./api.ts";

/** Which deck to bring: a preset by name or a saved deck by id. */
export interface DeckChoice {
  preset?: string;
  deckId?: number;
}

export interface LobbyInfo {
  code: string;
  side: number;
  token: string;
}

export interface OnlineCallbacks {
  onLobby: (info: LobbyInfo, catalog: CardCatalog) => void;
  onState: (state: MatchState, error?: string) => void;
  onPresence: (opponentConnected: boolean) => void;
  onError: (message: string) => void;
  onClose: () => void;
  /** The server runs a newer build than this bundle — prompt a refresh. */
  onStaleBuild: () => void;
  /** An out-of-band server notice (e.g. the server is shutting down for a redeploy). */
  onNotice: (message: string) => void;
}

const SESSION_KEY = "ibokki.online.seat";

export function storedSeat(): { code: string; token: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as { code: string; token: string }) : null;
  } catch {
    return null;
  }
}

export function storeSeat(seat: { code: string; token: string } | null): void {
  try {
    if (seat) sessionStorage.setItem(SESSION_KEY, JSON.stringify(seat));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — reconnection just won't survive a refresh */
  }
}

export class OnlineClient {
  private ws: WebSocket | null = null;
  private cb: OnlineCallbacks;

  constructor(cb: OnlineCallbacks) {
    this.cb = cb;
  }

  /** Open the socket and send `hello` once connected. */
  private open(hello: object): void {
    this.close();
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    // BASE_URL is "/" in dev, "/play/" when mounted inside the site.
    const ws = new WebSocket(`${proto}//${location.host}${import.meta.env.BASE_URL}ws`);
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify(hello));
    ws.onmessage = (ev) => this.onMessage(String(ev.data));
    ws.onclose = () => {
      if (this.ws === ws) {
        this.ws = null;
        this.cb.onClose();
      }
    };
    ws.onerror = () => {
      if (this.ws === ws) this.cb.onError("connection error");
    };
  }

  private onMessage(raw: string): void {
    let msg: { t: string; [k: string]: unknown };
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    switch (msg.t) {
      case "created":
      case "joined": {
        const info = { code: msg.code as string, side: msg.side as number, token: msg.token as string };
        storeSeat({ code: info.code, token: info.token });
        this.cb.onLobby(info, msg.catalog as CardCatalog);
        // A tab that outlived a redeploy reconnects here on the OLD bundle —
        // it keeps working, but stale UI code causes ghost bugs. Flag it.
        if (typeof msg.build === "string" && msg.build !== "dev" && msg.build !== __IBOKKI_BUILD__) {
          this.cb.onStaleBuild();
        }
        return;
      }
      case "state":
        this.cb.onState(msg.state as MatchState, msg.error as string | undefined);
        return;
      case "presence":
        this.cb.onPresence(Boolean(msg.opponentConnected));
        return;
      case "notice":
        this.cb.onNotice(String(msg.message));
        return;
      case "error":
        this.cb.onError(String(msg.message));
        return;
    }
  }

  create(deck: DeckChoice): void {
    this.open({ t: "create", deck });
  }

  /** Solo room: the server seats a heuristic bot opposite you (random preset). */
  createBot(deck: DeckChoice): void {
    this.open({ t: "create", deck, bot: true });
  }

  join(code: string, deck: DeckChoice): void {
    this.open({ t: "join", code: code.toUpperCase().trim(), deck });
  }

  rejoin(code: string, token: string): void {
    this.open({ t: "rejoin", code, token });
  }

  act(index: number): void {
    this.ws?.send(JSON.stringify({ t: "act", indices: [index] }));
  }

  rematch(): void {
    this.ws?.send(JSON.stringify({ t: "rematch" }));
  }

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  close(): void {
    const ws = this.ws;
    this.ws = null; // silence onclose callback for a deliberate close
    ws?.close();
  }
}
