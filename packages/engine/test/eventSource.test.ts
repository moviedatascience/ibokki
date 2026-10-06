/**
 * Event causes (2026-10-06, issue #80): every event emitted while a card's effect
 * runs carries `src`, resolutions are bracketed by `resolveBegin`, and ward events
 * carry the ward's id so soak can be credited to the card that made the ward.
 * Random self-play is the oracle — these are structural properties of the stream.
 */
import { describe, expect, it } from "vitest";
import { apply, createGame, deckFor, isTerminal, legalActions, rngInt, type Action, type GameEvent, type GameState } from "../src/index.ts";

function newGame(seed: number): GameState {
  const decks = [deckFor("Evocation"), deckFor("Abjuration"), deckFor("Divination")] as const;
  return createGame({ seed, players: [decks[seed % 3]!, decks[(seed + 1) % 3]!] });
}

/** Play a whole game with a seeded picker, collecting every action's events (biased toward casts). */
function playOut(seed: number): GameEvent[][] {
  let state = newGame(seed);
  let s = (seed * 31 + 7) | 0;
  const batches: GameEvent[][] = [];
  let guard = 0;
  while (!isTerminal(state) && guard++ < 60_000) {
    const legal = legalActions(state, state.priorityPlayer);
    const preferred = legal.filter((a) => a.type === "cast" || a.type === "castReaction" || a.type === "playTrainer" || a.type === "choose");
    const pool = preferred.length > 0 && guard % 3 !== 0 ? preferred : legal;
    let idx: number;
    [idx, s] = rngInt(s, pool.length);
    const r = apply(state, pool[idx] as Action);
    state = r.state;
    batches.push(r.events);
  }
  return batches;
}

const CLOSERS = new Set(["spellResolved", "spellCancelled", "targetImmune"]);

describe("event sources", () => {
  const games = Array.from({ length: 24 }, (_, i) => playOut(300 + i));

  it("every damage event names its cause", () => {
    let damages = 0;
    for (const batches of games)
      for (const events of batches)
        for (const e of events) {
          if (e.type !== "damage") continue;
          damages++;
          expect(e.src, `damage without src: ${JSON.stringify(e)}`).toBeDefined();
        }
    expect(damages).toBeGreaterThan(50);
  });

  it("everything inside a resolution bracket is stamped with that spell", () => {
    let brackets = 0;
    for (const batches of games)
      for (const events of batches) {
        let open: Extract<GameEvent, { type: "resolveBegin" }> | null = null;
        for (const e of events) {
          if (e.type === "resolveBegin") {
            expect(open, "nested resolveBegin").toBeNull();
            open = e;
            brackets++;
            continue;
          }
          if (!open) continue;
          // Inner causes (ward triggers, exhaustion, a nested choice) may override, but
          // whatever the cause is, the event is attributed to SOMETHING.
          expect(e.src, `unstamped event inside ${open.spellDefId}: ${JSON.stringify(e)}`).toBeDefined();
          if (e.src!.kind === "spell") {
            expect(e.src!.defId).toBe(open.spellDefId);
            expect(e.src!.sid).toBe(open.sid);
          }
          if (CLOSERS.has(e.type)) open = null;
        }
        expect(open, "resolution bracket never closed").toBeNull();
      }
    expect(brackets).toBeGreaterThan(50);
  });

  it("brackets pair one-to-one with spell-caused closers (traps close without opening)", () => {
    for (const batches of games) {
      let opens = 0;
      let spellClosers = 0;
      for (const events of batches)
        for (const e of events) {
          if (e.type === "resolveBegin") opens++;
          else if (CLOSERS.has(e.type) && e.src?.kind === "spell") spellClosers++;
          else if (CLOSERS.has(e.type)) expect(e.src?.kind).toBe("trap");
        }
      expect(spellClosers).toBe(opens);
    }
  });

  it("ward events carry the ward id, and soak maps back to the ward's creator", () => {
    let soaks = 0;
    for (const batches of games) {
      const creator = new Map<number, string | null>();
      for (const events of batches)
        for (const e of events) {
          if (e.type === "wardCreated") {
            expect(typeof e.wid).toBe("number");
            const src = e.src;
            creator.set(e.wid, src && "defId" in src ? src.defId : null);
          } else if (e.type === "wardDamaged" || e.type === "wardDestroyed") {
            expect(typeof e.wid).toBe("number");
            expect(creator.has(e.wid), `ward ${e.wid} was never created in-stream`).toBe(true);
            if (e.type === "wardDamaged") soaks++;
          }
        }
    }
    expect(soaks).toBeGreaterThan(0);
  });

  it("turn-start ticks are attributed to burn / prophecy, trainers to themselves", () => {
    const kinds = new Set<string>();
    for (const batches of games)
      for (const events of batches) {
        let trainer: string | null = null;
        for (const e of events) {
          if (e.src) kinds.add(e.src.kind);
          if (e.type === "burnTick") expect(e.src?.kind).toBe("burn");
          if (e.type === "prophecyFired") expect(e.src?.kind).toBe("prophecy");
          if (e.type === "trainerPlayed") trainer = e.defId;
          else if (trainer && e.type !== "chose" && e.src?.kind === "trainer") expect(e.src.defId).toBe(trainer);
        }
      }
    for (const k of ["spell", "burn", "trainer"]) expect(kinds, `no event ever caused by ${k}`).toContain(k);
  });
});
