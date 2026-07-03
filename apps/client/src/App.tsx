import { useCallback, useEffect, useRef, useState } from "react";
import { useMatch } from "./useMatch.ts";
import { useAuth } from "./useAuth.ts";
import { api, type Deck, type DeckListResponse, type School } from "./api.ts";
import { Board } from "./board/Board.tsx";
import type { PixiBoard } from "./board/PixiBoard.ts";
import { TopBar } from "./components/TopBar.tsx";
import { SidePanels } from "./components/SidePanels.tsx";
import { ActionBar } from "./components/ActionBar.tsx";
import { Prompt } from "./components/Prompt.tsx";
import { SpellbookTray } from "./components/SpellbookTray.tsx";
import { GameOverSummary } from "./components/GameOverSummary.tsx";
import { Home } from "./components/Home.tsx";
import { DeckBuilder } from "./components/DeckBuilder.tsx";

type Screen = "home" | "match" | "builder";

export function App() {
  const auth = useAuth();
  const { cards, state, error, act, newGame, online } = useMatch();
  const [screen, setScreen] = useState<Screen>("home");
  const [deckData, setDeckData] = useState<DeckListResponse | null>(null);
  const [builderDeck, setBuilderDeck] = useState<Deck | null>(null);
  const [hoverDef, setHoverDef] = useState<string | null>(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [p0, setP0] = useState<School>("Evocation");
  const [p1, setP1] = useState<School>("Abjuration");
  const [mode, setMode] = useState<"bot" | "agent">("bot");
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const boardRef = useRef<PixiBoard | null>(null);

  const refreshDecks = useCallback(() => {
    api
      .decks()
      .then(setDeckData)
      .catch(() => setDeckData(null)); // online server down → presets unavailable, home still works
  }, []);
  useEffect(refreshDecks, [refreshDecks, auth.user?.id]);

  // A restored online seat (refresh mid-match) or fresh create/join lands on the board.
  useEffect(() => {
    if (online.status === "waiting" || online.status === "playing") setScreen("match");
  }, [online.status]);

  const onReady = useCallback((b: PixiBoard) => {
    boardRef.current = b;
  }, []);
  const cardName = useCallback((defId: string) => cards[defId]?.name ?? defId, [cards]);
  const startGame = useCallback(
    (s0: School, s1: School, m: "bot" | "agent") => {
      setSummaryDismissed(false);
      setScreen("match");
      return newGame(s0, s1, m);
    },
    [newGame],
  );
  const isOnline = online.status !== "idle";
  const onRematch = useCallback(() => {
    if (isOnline) online.rematch();
    else void startGame(p0, p1, mode);
  }, [isOnline, online, startGame, p0, p1, mode]);
  const toMenu = useCallback(() => {
    if (isOnline) online.leave();
    setScreen("home");
  }, [isOnline, online]);

  // A fresh match (local new game or online rematch) re-arms the game-over summary.
  useEffect(() => {
    if (state && !state.gameOver) setSummaryDismissed(false);
  }, [state]);

  if (screen === "home") {
    return (
      <div className="app">
        <Home
          auth={auth}
          deckData={deckData}
          online={online}
          hasLocalMatch={state !== null}
          onPlayBot={(s0, s1) => void startGame(s0, s1, "bot")}
          onResume={() => setScreen("match")}
          onEditDeck={(deck) => {
            // Presets open as unsaved copies; null = a blank deck.
            setBuilderDeck(
              deck === null
                ? { name: "New deck", spellbook: [], resourceDeck: [] }
                : deck.id !== undefined
                  ? deck
                  : { name: `${deck.name} copy`, spellbook: [...deck.spellbook], resourceDeck: [...deck.resourceDeck] },
            );
            setScreen("builder");
          }}
          onDeleteDeck={(id) => void api.deleteDeck(id).then(refreshDecks)}
        />
      </div>
    );
  }

  if (screen === "builder" && builderDeck && deckData) {
    return (
      <div className="app">
        <DeckBuilder
          cards={cards}
          rules={deckData.rules}
          initial={builderDeck}
          onSaved={() => {
            refreshDecks();
            setScreen("home");
          }}
          onClose={() => setScreen("home")}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar state={state} />
      <div className="main">
        <div className="stage">
          <Board state={state} cards={cards} onAction={act} onHover={setHoverDef} onSelection={setSelectionActive} onReady={onReady} />
          <Prompt state={state} onAction={act} cardName={cardName} />
          <SpellbookTray state={state} cards={cards} onAction={act} onHover={setHoverDef} />
          <ActionBar state={state} cards={cards} selectionActive={selectionActive} onAction={act} onCancel={() => boardRef.current?.clearSelection()} error={error} />
          {!summaryDismissed && (
            <GameOverSummary state={state} onDismiss={() => setSummaryDismissed(true)} onRematch={onRematch} />
          )}
          <button className="menubtn" onClick={toMenu} data-testid="to-menu">
            ‹ Menu
          </button>
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
          onNewGame={() => startGame(p0, p1, mode)}
          online={online}
        />
      </div>
    </div>
  );
}
