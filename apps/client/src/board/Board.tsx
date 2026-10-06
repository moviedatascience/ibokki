import { useEffect, useRef } from "react";
import { PixiBoard } from "./PixiBoard.ts";
import type { FramePlayer } from "../framePlayer.ts";
import type { CardCatalog, MatchState } from "../api.ts";

interface BoardProps {
  /** The frame to show. With a `player`, this is the player's shown frame (display only —
   *  the player drives the board); without one (replay viewer) each change is presented. */
  state: MatchState | null;
  cards: CardCatalog;
  /** Live play: the FramePlayer that owns pacing attaches to the board as its presenter. */
  player?: FramePlayer | null;
  onAction: (index: number) => void;
  onHover: (defId: string | null) => void;
  onStatusHover: (text: string | null) => void;
  onSelection: (active: boolean) => void;
  onInspect: (defId: string) => void;
  onBrowseDiscard: (side: 0 | 1) => void;
  onReady: (board: PixiBoard) => void;
}

/**
 * Mounts the PixiBoard once into a host div and feeds it frames. React re-renders never
 * touch the scene graph directly: in live play the FramePlayer calls `board.present()`
 * one frame at a time; in the replay viewer each `state` change is presented directly.
 * Callbacks are read through refs so the single long-lived board always calls the
 * latest handlers.
 */
export function Board({ state, cards, player, onAction, onHover, onStatusHover, onSelection, onInspect, onBrowseDiscard, onReady }: BoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<PixiBoard | null>(null);
  const cbs = useRef({ onAction, onHover, onStatusHover, onSelection, onInspect, onBrowseDiscard, onReady });
  cbs.current = { onAction, onHover, onStatusHover, onSelection, onInspect, onBrowseDiscard, onReady };
  const latest = useRef({ state, cards, player });
  latest.current = { state, cards, player };

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
      onBrowseDiscard: (s) => cbs.current.onBrowseDiscard(s),
    });
    let attached: FramePlayer | null = null;
    board.mount().then(() => {
      if (disposed) {
        board.destroy();
        return;
      }
      boardRef.current = board;
      // Debug handle for headless verification scripts (same spirit as window.__ibokki).
      (window as unknown as Record<string, unknown>).__ibokkiBoard = board;
      board.setCards(latest.current.cards);
      const p = latest.current.player;
      if (p) {
        // The player paints its shown frame on attach and drives every frame after.
        attached = p;
        p.attach(board);
      } else if (latest.current.state) {
        // State that arrived while mount() was loading assets hit the [state, cards]
        // effect against a null boardRef and was dropped — replay it, or a board with
        // no follow-up push stays blank forever.
        board.sync(latest.current.state, latest.current.cards);
      }
      cbs.current.onReady(board);
    });
    return () => {
      disposed = true;
      if (attached && boardRef.current) attached.detach(boardRef.current);
      boardRef.current?.destroy();
      boardRef.current = null;
    };
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    if (player) board.setCards(cards);
    else if (state) board.sync(state, cards);
  }, [state, cards, player]);

  return <div className="canvas-host" ref={hostRef} />;
}
