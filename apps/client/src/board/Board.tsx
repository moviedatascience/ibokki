import { useEffect, useRef } from "react";
import { PixiBoard } from "./PixiBoard.ts";
import type { CardCatalog, MatchState } from "../api.ts";

interface BoardProps {
  state: MatchState | null;
  cards: CardCatalog;
  onAction: (index: number) => void;
  onHover: (defId: string | null) => void;
  onStatusHover: (text: string | null) => void;
  onSelection: (active: boolean) => void;
  onInspect: (defId: string) => void;
  onReady: (board: PixiBoard) => void;
}

/**
 * Mounts the PixiBoard once into a host div and feeds it state. React re-renders never touch the
 * scene graph directly — they just call `board.sync(state, cards)`, which diffs and tweens. Callbacks
 * are read through refs so the single long-lived board always calls the latest handlers.
 */
export function Board({ state, cards, onAction, onHover, onStatusHover, onSelection, onInspect, onReady }: BoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<PixiBoard | null>(null);
  const cbs = useRef({ onAction, onHover, onStatusHover, onSelection, onInspect, onReady });
  cbs.current = { onAction, onHover, onStatusHover, onSelection, onInspect, onReady };
  const latest = useRef({ state, cards });
  latest.current = { state, cards };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const board = new PixiBoard(host, {
      onAction: (i) => cbs.current.onAction(i),
      onHover: (d) => cbs.current.onHover(d),
      onStatusHover: (t) => cbs.current.onStatusHover(t),
      onSelection: (a) => cbs.current.onSelection(a),
      onInspect: (d) => cbs.current.onInspect(d),
    });
    board.mount().then(() => {
      if (disposed) {
        board.destroy();
        return;
      }
      boardRef.current = board;
      // Debug handle for headless verification scripts (same spirit as window.__ibokki).
      (window as unknown as Record<string, unknown>).__ibokkiBoard = board;
      // State that arrived while mount() was loading assets hit the [state, cards]
      // effect against a null boardRef and was dropped — replay it, or a board with
      // no follow-up push (e.g. local play on your turn) stays blank forever.
      if (latest.current.state) board.sync(latest.current.state, latest.current.cards);
      cbs.current.onReady(board);
    });
    return () => {
      disposed = true;
      boardRef.current?.destroy();
      boardRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (state) boardRef.current?.sync(state, cards);
  }, [state, cards]);

  return <div className="canvas-host" ref={hostRef} />;
}
