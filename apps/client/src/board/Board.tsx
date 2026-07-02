import { useEffect, useRef } from "react";
import { PixiBoard } from "./PixiBoard.ts";
import type { CardCatalog, MatchState } from "../api.ts";

interface BoardProps {
  state: MatchState | null;
  cards: CardCatalog;
  onAction: (index: number) => void;
  onHover: (defId: string | null) => void;
  onSelection: (active: boolean) => void;
  onReady: (board: PixiBoard) => void;
}

/**
 * Mounts the PixiBoard once into a host div and feeds it state. React re-renders never touch the
 * scene graph directly — they just call `board.sync(state, cards)`, which diffs and tweens. Callbacks
 * are read through refs so the single long-lived board always calls the latest handlers.
 */
export function Board({ state, cards, onAction, onHover, onSelection, onReady }: BoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<PixiBoard | null>(null);
  const cbs = useRef({ onAction, onHover, onSelection, onReady });
  cbs.current = { onAction, onHover, onSelection, onReady };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const board = new PixiBoard(host, {
      onAction: (i) => cbs.current.onAction(i),
      onHover: (d) => cbs.current.onHover(d),
      onSelection: (a) => cbs.current.onSelection(a),
    });
    board.mount().then(() => {
      if (disposed) {
        board.destroy();
        return;
      }
      boardRef.current = board;
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
