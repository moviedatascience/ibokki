import { useCallback, useRef, useState } from "react";
import { useMatch } from "./useMatch.ts";
import type { School } from "./api.ts";
import { Board } from "./board/Board.tsx";
import type { PixiBoard } from "./board/PixiBoard.ts";
import { TopBar } from "./components/TopBar.tsx";
import { SidePanels } from "./components/SidePanels.tsx";
import { ActionBar } from "./components/ActionBar.tsx";
import { Prompt } from "./components/Prompt.tsx";
import { SpellbookTray } from "./components/SpellbookTray.tsx";

export function App() {
  const { cards, state, error, act, newGame } = useMatch();
  const [hoverDef, setHoverDef] = useState<string | null>(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [p0, setP0] = useState<School>("Evocation");
  const [p1, setP1] = useState<School>("Abjuration");
  const [mode, setMode] = useState<"bot" | "agent">("bot");
  const boardRef = useRef<PixiBoard | null>(null);

  const onReady = useCallback((b: PixiBoard) => {
    boardRef.current = b;
  }, []);
  const cardName = useCallback((defId: string) => cards[defId]?.name ?? defId, [cards]);

  return (
    <div className="app">
      <TopBar state={state} />
      <div className="main">
        <div className="stage">
          <Board state={state} cards={cards} onAction={act} onHover={setHoverDef} onSelection={setSelectionActive} onReady={onReady} />
          <Prompt state={state} onAction={act} cardName={cardName} />
          <SpellbookTray state={state} cards={cards} onAction={act} onHover={setHoverDef} />
          <ActionBar state={state} selectionActive={selectionActive} onAction={act} onCancel={() => boardRef.current?.clearSelection()} error={error} />
        </div>
        <SidePanels
          state={state}
          cards={cards}
          hoverDef={hoverDef}
          p0={p0}
          p1={p1}
          mode={mode}
          setP0={setP0}
          setP1={setP1}
          setMode={setMode}
          onNewGame={() => newGame(p0, p1, mode)}
        />
      </div>
    </div>
  );
}
