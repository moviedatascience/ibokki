/**
 * DOM deckbuilder: spellbook picker on the left (click to toggle, singleton),
 * resource deck on the right (+/- steppers per component / trainer). Live
 * counters mirror the server's validator via the rules object it serves; the
 * server remains the authority on save (its structured errors are shown as-is).
 */
import { useMemo, useState } from "react";
import { api, ApiError, type CardCatalog, type Deck, type DeckError, type DeckRules } from "../api.ts";
import { Pips, SchoolCrest, TypeIcon } from "./Pips.tsx";

interface Props {
  cards: CardCatalog;
  rules: DeckRules;
  /** Deck being edited; presets arrive stripped of id (saved as a copy). */
  initial: Deck;
  onSaved: () => void;
  onClose: () => void;
}

const SCHOOL_TABS = ["All", "Evocation", "Abjuration", "Divination"] as const;
const COMPONENT_ORDER = ["CMP-V", "CMP-S", "CMP-M", "CMP-VV", "CMP-SS", "CMP-MM", "CMP-VS", "CMP-VM", "CMP-SM", "CMP-VSM"];
const SAME_SYMBOL = new Set(["CMP-VV", "CMP-SS", "CMP-MM"]);

function counts(list: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of list) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
}

export function DeckBuilder({ cards, rules, initial, onSaved, onClose }: Props) {
  const [name, setName] = useState(initial.name);
  const [spellbook, setSpellbook] = useState<Set<string>>(new Set(initial.spellbook));
  const [resources, setResources] = useState<Map<string, number>>(counts(initial.resourceDeck));
  const [tab, setTab] = useState<(typeof SCHOOL_TABS)[number]>("All");
  const [errors, setErrors] = useState<DeckError[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const spells = useMemo(
    () =>
      Object.entries(cards)
        .filter(([, c]) => c.type === "Spell" || c.type === "Reaction")
        .filter(([, c]) => tab === "All" || c.school === tab)
        .sort((a, b) => a[1].school.localeCompare(b[1].school) || (a[1].level ?? 0) - (b[1].level ?? 0) || a[1].name.localeCompare(b[1].name)),
    [cards, tab],
  );
  const trainers = useMemo(
    () => Object.entries(cards).filter(([, c]) => c.type === "Item" || c.type === "Gambit").sort((a, b) => a[1].name.localeCompare(b[1].name)),
    [cards],
  );

  const resourceList = [...resources.entries()].flatMap(([id, n]) => Array<string>(n).fill(id));
  const resourceTotal = resourceList.length;
  const trainerTotal = resourceList.filter((id) => !id.startsWith("CMP-")).length;
  const rampTotal = resourceList.filter((id) => SAME_SYMBOL.has(id)).length;
  const triTotal = resources.get("CMP-VSM") ?? 0;
  const level1 = [...spellbook].filter((id) => cards[id]?.level === 1).length;

  const bump = (id: string, delta: number, max?: number) => {
    setResources((prev) => {
      const next = new Map(prev);
      const n = Math.max(0, Math.min(max ?? 99, (next.get(id) ?? 0) + delta));
      if (n === 0) next.delete(id);
      else next.set(id, n);
      return next;
    });
  };

  const toggleSpell = (id: string) =>
    setSpellbook((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    setBusy(true);
    setErrors([]);
    setSaveError(null);
    try {
      await api.saveDeck({ id: initial.id, name, spellbook: [...spellbook], resourceDeck: resourceList });
      onSaved();
    } catch (e) {
      if (e instanceof ApiError) {
        setSaveError(e.message);
        setErrors(e.errors ?? []);
      } else setSaveError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const counter = (label: string, value: number, limit: number, kind: "max" | "exact" | "min") => {
    const bad = kind === "max" ? value > limit : kind === "exact" ? value !== limit : value < limit;
    return (
      <span className={`counter${bad ? " bad" : ""}`} key={label}>
        {label} {value}/{limit}
      </span>
    );
  };

  return (
    <div className="builder">
      <div className="builderbar">
        <button onClick={onClose} data-testid="builder-close">
          ‹ Back
        </button>
        <input className="deckname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Deck name" data-testid="builder-name" />
        <div className="counters">
          {counter("Spells", spellbook.size, rules.spellbookMax, "max")}
          {counter("L1", level1, rules.minLevel1Spells, "min")}
          {counter("Resources", resourceTotal, rules.resourceDeckSize, "exact")}
          {counter("Trainers", trainerTotal, rules.maxTrainers, "max")}
          {counter("Ramp", rampTotal, rules.maxSameSymbolDuals, "max")}
          {counter("Tri", triTotal, rules.maxTriComponents, "max")}
        </div>
        <button className="primary" disabled={busy} onClick={() => void save()} data-testid="builder-save">
          Save deck
        </button>
      </div>
      {(saveError || errors.length > 0) && (
        <div className="buildererrors" data-testid="builder-errors">
          {saveError}
          {errors.map((e, i) => (
            <div key={i}>• {e.message}</div>
          ))}
        </div>
      )}

      <div className="buildercols">
        <div className="buildercol">
          <div className="tabs">
            {SCHOOL_TABS.map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                <SchoolCrest school={t} size={12} /> {t}
              </button>
            ))}
          </div>
          <div className="cardgrid">
            {spells.map(([id, c]) => (
              <button
                key={id}
                className={`pickcard s-${c.school.toLowerCase()}${spellbook.has(id) ? " picked" : ""}`}
                onClick={() => toggleSpell(id)}
                title={c.text}
                data-testid={`pick-${id}`}
              >
                <span className="pickname">{c.name}</span>
                <span className="pickmeta">
                  {c.level ? `L${c.level} · ` : ""}
                  {c.cost ? <Pips cost={c.cost} /> : "—"} · {c.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="buildercol resources">
          <h3>Components</h3>
          {COMPONENT_ORDER.map((id) => (
            <div className="stepper" key={id}>
              <span className="pickname">{cards[id]?.name ?? id}</span>
              <span className="stepbtns">
                <button onClick={() => bump(id, -1)}>−</button>
                <span className="stepn" data-testid={`count-${id}`}>
                  {resources.get(id) ?? 0}
                </span>
                <button onClick={() => bump(id, +1)} data-testid={`add-${id}`}>
                  +
                </button>
              </span>
            </div>
          ))}
          <h3>Trainers</h3>
          {trainers.map(([id, c]) => (
            <div className="stepper" key={id}>
              <span className="pickname" title={c.text}>
                <TypeIcon type={c.type} /> {c.name}
              </span>
              <span className="stepbtns">
                <button onClick={() => bump(id, -1)}>−</button>
                <span className="stepn">{resources.get(id) ?? 0}</span>
                <button onClick={() => bump(id, +1, rules.maxTrainerCopies)}>+</button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
