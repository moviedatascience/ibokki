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
  const [pinnedDef, setPinnedDef] = useState<string | null>(null);
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
      setPinnedDef(null);
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
    if (isOnline) {
      // Leaving a live PvP match forfeits the seat — make sure it's intentional.
      if (online.status === "playing" && state && !state.gameOver && !window.confirm("Leave the match? If you don't rejoin within a minute, you forfeit.")) return;
      online.leave();
    }
    setScreen("home");
  }, [isOnline, online, state]);

  // Closing the tab / navigating away mid-PvP forfeits via the disconnect grace —
  // ask the browser to confirm it. Solo bot matches aren't guarded (no one is harmed).
  const guardUnload = online.status === "playing" && !!state && !state.gameOver && state.bots.length === 0;
  useEffect(() => {
    if (!guardUnload) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [guardUnload]);

  // A fresh match (local new game or online rematch) re-arms the game-over summary.
  useEffect(() => {
    if (state && !state.gameOver) setSummaryDismissed(false);
  }, [state]);

  const updateBanner = online.updateAvailable ? (
    <div className="updatebar">
      A new version of Ibokki is live —{" "}
      <a onClick={() => location.reload()}>refresh</a> when this match is done to pick it up.
    </div>
  ) : online.notice ? (
    <div className="updatebar">{online.notice}</div>
  ) : null;

  if (screen === "home") {
    return (
      <div className="app">
        {updateBanner}
        <Home
          auth={auth}
          deckData={deckData}
          online={online}
          error={error}
          hasLocalMatch={state !== null}
          onPlayBot={(s0, s1) => {
            // Remember the matchup so a local Rematch replays it (not the side-panel defaults).
            setP0(s0);
            setP1(s1);
            setMode("bot");
            void startGame(s0, s1, "bot");
          }}
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
        {updateBanner}
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
      {updateBanner}
      <TopBar state={state} onMenu={toMenu} />
      <div className="main">
        <div className="stage">
          <div className="boardwrap">
            <Board state={state} cards={cards} onAction={act} onHover={setHoverDef} onSelection={setSelectionActive} onInspect={setPinnedDef} onReady={onReady} />
            <Prompt state={state} onAction={act} cardName={cardName} />
            <SpellbookTray state={state} cards={cards} onAction={act} onHover={setHoverDef} onInspect={setPinnedDef} />
            {!summaryDismissed && (
              <GameOverSummary state={state} onDismiss={() => setSummaryDismissed(true)} onRematch={onRematch} />
            )}
          </div>
          <ActionBar state={state} cards={cards} selectionActive={selectionActive} onAction={act} onCancel={() => boardRef.current?.clearSelection()} error={error} onlineStatus={online.status} />
        </div>
        <SidePanels
          state={state}
          cards={cards}
          hoverDef={hoverDef}
          pinnedDef={pinnedDef}
          onUnpin={() => setPinnedDef(null)}
          p0={p0}
          p1={p1}
          mode={mode}
          setP0={setP0}
          setP1={setP1}
          setMode={setMode}
          onNewGame={() => startGame(p0, p1, mode)}
          online={online}
          onLeave={toMenu}
        />
      </div>
    </div>
  );
}
