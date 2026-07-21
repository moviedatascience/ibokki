/** Cost / component-symbol math. */
import { getComponent, type Cost, type ComponentDef } from "@ibokki/cards";
import type { PlayerState, PreparedSpell } from "./types.ts";

export function emptyCost(): Cost {
  return { V: 0, S: 0, M: 0 };
}

export function addCost(a: Cost, b: Cost): Cost {
  return { V: a.V + b.V, S: a.S + b.S, M: a.M + b.M };
}

/** Sum the symbols provided by a set of attached components. */
export function combinedSymbols(components: ComponentDef[]): Cost {
  return components.reduce<Cost>((acc, c) => addCost(acc, c.symbols), emptyCost());
}

/**
 * The symbols a prepared spell's attachments provide, honoring the owner's
 * Transmuter's Stone treat-as overrides (per component INSTANCE, until end of
 * turn). Every cost check must read attachments through this, not the printed
 * defIds, or a transmuted component silently reverts.
 */
export function attachedSymbols(owner: PlayerState, prep: PreparedSpell): Cost {
  const out = emptyCost();
  for (const a of prep.attached) {
    const ov = owner.treatAs?.find((t) => t.iid === a.iid);
    const def = getComponent(ov ? `CMP-${ov.sym}` : a.defId);
    if (def) {
      out.V += def.symbols.V;
      out.S += def.symbols.S;
      out.M += def.symbols.M;
    }
  }
  return out;
}

/** True if `provided` covers every symbol required by `cost`. */
export function meetsCost(cost: Cost, provided: Cost): boolean {
  return provided.V >= cost.V && provided.S >= cost.S && provided.M >= cost.M;
}

/** Reduce a cost's S requirement by `discount`, never below a 1-component minimum (Stone Stance). */
export function discountCostS(cost: Cost, discount: number): Cost {
  if (discount <= 0) return cost;
  let s = Math.max(0, cost.S - discount);
  if (cost.V + s + cost.M < 1) s = 1; // a Reaction still costs at least one component
  return { V: cost.V, S: s, M: cost.M };
}

/** A Reaction's effective cost: your Stone Stance discount, then the opponent's S-tax (Aetheric Lock). */
export function reactionCost(base: Cost, discountS: number, taxS: number): Cost {
  const c = discountCostS(base, discountS);
  return { V: c.V, S: c.S + Math.max(0, taxS), M: c.M };
}
