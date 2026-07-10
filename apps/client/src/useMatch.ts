import { useCallback, useEffect, useRef, useState } from "react";
import { api, type CardCatalog, type MatchState, type School } from "./api.ts";
import { OnlineClient, storedSeat, storeSeat, type DeckChoice } from "./online.ts";

export type OnlineStatus = "idle" | "connecting" | "waiting" | "playing";

export interface OnlineApi {
  status: OnlineStatus;
  /** Room join code (share with the opponent) once created/joined. */
  code: string | null;
  opponentConnected: boolean;
  /** The server was redeployed since this bundle loaded — prompt a refresh. */
  updateAvailable: boolean;
  /** A transient server notice (e.g. shutting down for a redeploy), or null. */
  notice: string | null;
  create: (deck: DeckChoice) => void;
  /** Solo match against the server-side bot (works in production, unlike local vs-bot). */
  createBot: (deck: DeckChoice) => void;
  join: (code: string, deck: DeckChoice) => void;
  leave: () => void;
  rematch: () => void;
}

export interface UseMatch {
  cards: CardCatalog;
  state: MatchState | null;
  busy: boolean;
  error: string | null;
  act: (index: number) => Promise<void>;
  newGame: (p0: School, p1: School, mode: "bot" | "agent") => Promise<void>;
  online: OnlineApi;
}

// Keep retrying at least as long as the server's disconnect grace (45s default) —
// giving up earlier strands a seat the server would still happily hand back.
const REJOIN_RETRY_MS = 3000;
const REJOIN_MAX_TRIES = 16;

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Owns the match data lifecycle in both transports.
 *
 * Local (vs bot/agent): loads the catalog once, fetches state over HTTP, and —
 * while it's not your turn and the game isn't over — polls so the bot's moves
 * stream in.
 *
 * Online: a WebSocket to the authoritative server pushes redacted, viewer-relative
 * MatchState frames (same shape as local, so the board renders both identically);
 * `act` sends the legal-action index as an intent. The seat token lives in
 * sessionStorage so a refreshed tab rejoins its match automatically.
 */
export function useMatch(): UseMatch {
  const [cards, setCards] = useState<CardCatalog>({});
  const [state, setState] = useState<MatchState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>("idle");
  const [code, setCode] = useState<string | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onlineRef = useRef<OnlineClient | null>(null);
  const statusRef = useRef<OnlineStatus>("idle");
  const stateRef = useRef<MatchState | null>(null);
  const retryRef = useRef<{ timer: ReturnType<typeof setTimeout> | null; tries: number }>({ timer: null, tries: 0 });
  statusRef.current = onlineStatus;
  stateRef.current = state;

  const clearPoll = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  };

  const clearRejoinRetry = () => {
    if (retryRef.current.timer) clearTimeout(retryRef.current.timer);
    retryRef.current = { timer: null, tries: 0 };
  };

  // ---- local (HTTP) transport ----

  // Poll again only while we're waiting on the opponent/bot.
  const schedulePoll = useCallback((s: MatchState) => {
    clearPoll();
    if (!s.yourTurn && !s.gameOver) {
      pollRef.current = setTimeout(() => {
        api
          .state()
          .then((next) => {
            setState(next);
            schedulePoll(next);
          })
          .catch(() => {
            pollRef.current = setTimeout(() => refreshInner(), 1500);
          });
      }, 900);
    }
  }, []);

  const refreshInner = useCallback(() => {
    api
      .state()
      .then((s) => {
        setState(s);
        setError(null);
        schedulePoll(s);
      })
      .catch((e) => {
        // In production only the online server exists, so this probe 404s on every
        // load/leave — that just means "no local play server", not a user-facing error.
        // Only surface the failure when a local match was actually in progress.
        if (stateRef.current) setError(errMsg(e));
      });
  }, [schedulePoll]);

  // ---- online (WebSocket) transport ----

  const onlineClient = useCallback((): OnlineClient => {
    if (onlineRef.current) return onlineRef.current;
    const client: OnlineClient = new OnlineClient({
      onLobby: (info, catalog) => {
        clearRejoinRetry();
        setCards(catalog);
        setCode(info.code);
        setError(null);
        // "waiting" until the first state frame arrives (P1 joins ⇒ immediate).
        setOnlineStatus("waiting");
      },
      onState: (s, err) => {
        setOnlineStatus("playing");
        setState(s);
        setError(err ?? null);
      },
      onPresence: (connected) => setOpponentConnected(connected),
      onStaleBuild: () => setUpdateAvailable(true),
      onNotice: (message) => setNotice(message),
      onError: (message) => {
        // A dead seat (server restarted / room swept) can't be rejoined — go idle.
        if (message.includes("no seat matches") || message.includes("no room with code")) {
          storeSeat(null);
          clearRejoinRetry();
          setOnlineStatus("idle");
        }
        setError(message);
      },
      onClose: () => {
        if (statusRef.current === "idle") return;
        const seat = storedSeat();
        if (!seat) {
          // A fresh create/join died before a seat was issued (server down, room
          // rejected). Without this reset the status machine sits on "connecting"
          // forever and the Home screen never re-enables its buttons.
          setOnlineStatus("idle");
          setError((prev) => prev ?? "could not reach the game server");
          return;
        }
        // Unexpected drop with a live seat: retry for at least the server's rejoin grace.
        setOpponentConnected(false);
        if (retryRef.current.tries >= REJOIN_MAX_TRIES) {
          setOnlineStatus("idle");
          setError("connection lost — refresh to try rejoining the match");
          clearRejoinRetry();
          return;
        }
        setOnlineStatus("connecting");
        retryRef.current.tries++;
        retryRef.current.timer = setTimeout(() => client.rejoin(seat.code, seat.token), REJOIN_RETRY_MS);
      },
    });
    onlineRef.current = client;
    return client;
  }, []);

  const goOnline = useCallback(() => {
    clearPoll();
    setState(null);
    setError(null);
    setNotice(null);
    setOpponentConnected(false);
    setOnlineStatus("connecting");
  }, []);

  const online: OnlineApi = {
    status: onlineStatus,
    code,
    opponentConnected,
    updateAvailable,
    notice,
    create: useCallback(
      (deck: DeckChoice) => {
        goOnline();
        onlineClient().create(deck);
      },
      [goOnline, onlineClient],
    ),
    createBot: useCallback(
      (deck: DeckChoice) => {
        goOnline();
        onlineClient().createBot(deck);
      },
      [goOnline, onlineClient],
    ),
    join: useCallback(
      (roomCode: string, deck: DeckChoice) => {
        goOnline();
        onlineClient().join(roomCode, deck);
      },
      [goOnline, onlineClient],
    ),
    leave: useCallback(() => {
      setOnlineStatus("idle");
      storeSeat(null);
      clearRejoinRetry();
      onlineRef.current?.close();
      setCode(null);
      setOpponentConnected(false);
      setState(null);
      setError(null); // a stale in-match error must not follow the user to the Home screen
      api.cards().then(setCards).catch(() => {});
      refreshInner();
    }, [refreshInner]),
    rematch: useCallback(() => onlineRef.current?.rematch(), []),
  };

  // ---- shared surface ----

  const act = useCallback(
    async (index: number) => {
      if (statusRef.current !== "idle") {
        onlineRef.current?.act(index);
        return;
      }
      clearPoll();
      setBusy(true);
      try {
        const s = await api.act(index);
        setState(s);
        setError(s.error ?? null);
        schedulePoll(s);
      } catch (e) {
        setError(errMsg(e));
        pollRef.current = setTimeout(() => refreshInner(), 1000);
      } finally {
        setBusy(false);
      }
    },
    [schedulePoll, refreshInner],
  );

  const newGame = useCallback(
    async (p0: School, p1: School, mode: "bot" | "agent") => {
      if (statusRef.current !== "idle") online.leave();
      clearPoll();
      setBusy(true);
      try {
        const s = await api.newGame(p0, p1, mode);
        setState(s);
        setError(null);
        schedulePoll(s);
      } catch (e) {
        setError(errMsg(e));
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedulePoll],
  );

  useEffect(() => {
    const seat = storedSeat();
    if (seat) {
      // A refreshed tab resumes its online seat instead of hitting the local server.
      setOnlineStatus("connecting");
      onlineClient().rejoin(seat.code, seat.token);
    } else {
      api.cards().then(setCards).catch(() => {});
      refreshInner();
    }
    return () => {
      clearPoll();
      clearRejoinRetry();
      onlineRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Test/debug hook: lets headless drivers read the frame and act by index.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__ibokki = { state, act, online };
  });

  return { cards, state, busy, error, act, newGame, online };
}
