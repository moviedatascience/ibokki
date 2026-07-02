import { useCallback, useEffect, useRef, useState } from "react";
import { api, type CardCatalog, type MatchState, type School } from "./api.ts";

export interface UseMatch {
  cards: CardCatalog;
  state: MatchState | null;
  busy: boolean;
  error: string | null;
  act: (index: number) => Promise<void>;
  newGame: (p0: School, p1: School, mode: "bot" | "agent") => Promise<void>;
}

/**
 * Owns the match data lifecycle: loads the card catalog once, fetches state, and — while it's not
 * your turn and the game isn't over — polls so the bot's moves stream in. Mirrors the poll/act loop
 * of the old zero-dep board, but as a hook the Pixi board + React shell both read from.
 */
export function useMatch(): UseMatch {
  const [cards, setCards] = useState<CardCatalog>({});
  const [state, setState] = useState<MatchState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPoll = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  };

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
      .catch((e) => setError(String(e)));
  }, [schedulePoll]);

  const act = useCallback(
    async (index: number) => {
      clearPoll();
      setBusy(true);
      try {
        const s = await api.act(index);
        setState(s);
        setError(s.error ?? null);
        schedulePoll(s);
      } catch (e) {
        setError(String(e));
        pollRef.current = setTimeout(() => refreshInner(), 1000);
      } finally {
        setBusy(false);
      }
    },
    [schedulePoll, refreshInner],
  );

  const newGame = useCallback(
    async (p0: School, p1: School, mode: "bot" | "agent") => {
      clearPoll();
      setBusy(true);
      try {
        const s = await api.newGame(p0, p1, mode);
        setState(s);
        setError(null);
        schedulePoll(s);
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
    },
    [schedulePoll],
  );

  useEffect(() => {
    api.cards().then(setCards).catch(() => {});
    refreshInner();
    return clearPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cards, state, busy, error, act, newGame };
}
