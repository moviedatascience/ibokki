/**
 * Per-card telemetry aggregated across a batch of games. The engine already
 * narrates every game as GameEvents — this taps that stream (previously
 * discarded by the match runner) and answers the balance questions win rates
 * can't: WHICH cards get cast, resolve, get cancelled, and correlate with
 * winning. Deltas of these numbers across paired A/B runs are the real signal.
 */
import { getCard } from "@ibokki/cards";
import type { GameEvent, PlayerId } from "@ibokki/engine";

export interface CardAgg {
  prepares: number;
  casts: number;
  reactionCasts: number;
  trainerPlays: number;
  resolves: number;
  cancels: number;
  /** Per-game-per-player usage: (game, player) pairs in which this card was cast/played... */
  gamesUsed: number;
  /** ...and that player won. gamesWon/gamesUsed = win rate when used. */
  gamesWon: number;
}

const emptyAgg = (): CardAgg => ({
  prepares: 0,
  casts: 0,
  reactionCasts: 0,
  trainerPlays: 0,
  resolves: 0,
  cancels: 0,
  gamesUsed: 0,
  gamesWon: 0,
});

export class CardStatsCollector {
  private agg = new Map<string, CardAgg>();
  /** defId -> players who used it in the game currently being ingested. */
  private current = new Map<string, Set<PlayerId>>();
  games = 0;

  private bump(defId: string): CardAgg {
    let a = this.agg.get(defId);
    if (!a) this.agg.set(defId, (a = emptyAgg()));
    return a;
  }

  private mark(defId: string, player: PlayerId): void {
    let set = this.current.get(defId);
    if (!set) this.current.set(defId, (set = new Set()));
    set.add(player);
  }

  onEvents(events: GameEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case "spellPrepared":
          this.bump(e.spellDefId).prepares++;
          break;
        case "cast":
          this.bump(e.spellDefId).casts++;
          this.mark(e.spellDefId, e.player);
          break;
        case "reactionCast":
          this.bump(e.spellDefId).reactionCasts++;
          this.mark(e.spellDefId, e.player);
          break;
        case "trainerPlayed":
          this.bump(e.defId).trainerPlays++;
          this.mark(e.defId, e.player);
          break;
        case "spellResolved":
          this.bump(e.spellDefId).resolves++;
          break;
        case "spellCancelled":
          this.bump(e.spellDefId).cancels++;
          break;
      }
    }
  }

  /** Fold the current game's usage into win correlation. Call once per finished game. */
  endGame(winner: PlayerId | null): void {
    this.games++;
    for (const [defId, players] of this.current) {
      const a = this.bump(defId);
      for (const p of players) {
        a.gamesUsed++;
        if (winner === p) a.gamesWon++;
      }
    }
    this.current.clear();
  }

  toJSON(): Record<string, CardAgg & { name: string }> {
    const out: Record<string, CardAgg & { name: string }> = {};
    for (const [defId, a] of [...this.agg.entries()].sort(([x], [y]) => x.localeCompare(y))) {
      out[defId] = { name: getCard(defId)?.name ?? defId, ...a };
    }
    return out;
  }

  /** Expression audit (blind-spot plan 1a, 2026-07-29): surface the cards the
   *  bots are NOT expressing, so valuation gaps find us instead of hiding in a
   *  40-row table. "Slotted but mute" = prepped in most games, almost never
   *  cast (the Stone Stance / Reckoning / Cut-the-Thread signature). "Never
   *  seen" = in a spellbook, castable at this matchup's level ceiling, yet
   *  never prepped/cast/played (the Omen signature — id-order prep starvation).
   *  A flag means CHECK VALUATION, not "the card is dead" — five ledger
   *  entries say the bot is the suspect first. */
  audit(spellbookDefIds: string[], maxSpellLevel: number): string {
    const label = (id: string): string => `${getCard(id)?.name ?? id} [${id}]`;
    const mute: string[] = [];
    for (const [defId, a] of [...this.agg.entries()].sort(([x], [y]) => x.localeCompare(y))) {
      const uses = a.casts + a.reactionCasts + a.trainerPlays;
      if (a.prepares >= this.games / 2 && uses <= this.games / 10) {
        mute.push(`${label(defId)} (${a.prepares} preps, ${uses} uses)`);
      }
    }
    const seen = new Set(this.agg.keys());
    const unseen = [...new Set(spellbookDefIds)]
      .filter((id) => !seen.has(id) && (getCard(id)?.level ?? 1) <= maxSpellLevel)
      .sort();
    // Name only the L1 unseen — that's where id-order prep starvation (ledger
    // #3, Omen) bites; higher-level absences are usually normal slot
    // competition, so a count keeps them from drowning the signal.
    const unseenL1 = unseen.filter((id) => (getCard(id)?.level ?? 1) <= 1).map(label);
    const unseenRest = unseen.length - unseenL1.length;
    return [
      `expression audit (spells castable at this matchup's level ceiling ≤ L${maxSpellLevel}):`,
      `  slotted but mute: ${mute.length ? mute.join(", ") : "none"}`,
      `  L1 never seen at all: ${unseenL1.length ? unseenL1.join(", ") : "none"}${unseenRest > 0 ? ` (+${unseenRest} L2+ spells unseen)` : ""}`,
      "  (a flag = check bot valuation BEFORE any card verdict — see playtests/2026-07-29-blindspot-plan.md)",
    ].join("\n");
  }

  /** Fixed-width table sorted by win-rate-when-used (most suspicious cards on top). */
  table(): string {
    const pct = (num: number, den: number): string => (den > 0 ? ((num / den) * 100).toFixed(0) + "%" : "—");
    const rows = [...this.agg.entries()]
      .map(([defId, a]) => ({ defId, name: getCard(defId)?.name ?? defId, a }))
      .sort((x, y) => {
        const wx = x.a.gamesUsed > 0 ? x.a.gamesWon / x.a.gamesUsed : -1;
        const wy = y.a.gamesUsed > 0 ? y.a.gamesWon / y.a.gamesUsed : -1;
        return wy - wx || x.defId.localeCompare(y.defId);
      });
    const lines = [
      "card                                  prep  cast react train  res% canc%  used  WR-used",
      "--------------------------------------------------------------------------------------",
    ];
    for (const { defId, name, a } of rows) {
      const uses = a.casts + a.reactionCasts;
      lines.push(
        `${(name + " [" + defId + "]").padEnd(38)}` +
          `${String(a.prepares).padStart(5)} ${String(a.casts).padStart(5)} ${String(a.reactionCasts).padStart(5)} ${String(a.trainerPlays).padStart(5)}` +
          ` ${pct(a.resolves, uses).padStart(5)} ${pct(a.cancels, uses).padStart(5)}` +
          ` ${String(a.gamesUsed).padStart(5)}  ${pct(a.gamesWon, a.gamesUsed).padStart(7)}`,
      );
    }
    lines.push(`(${this.games} games; WR-used = win rate of the player who cast/played the card that game)`);
    return lines.join("\n");
  }
}
