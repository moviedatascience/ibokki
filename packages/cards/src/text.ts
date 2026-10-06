/**
 * Card-text tokens (issue "Card text tokens", 2026-10-06). Card rules text is
 * authored with inline tokens instead of being keyword-bolded by regex:
 *
 *   {id}            a keyword from keywords.json, displayed as its label
 *   {id|display}    the same keyword with authored display text ("{cancel|cancelled}")
 *   {V} {S} {M}     a component pip (display defaults to the letter)
 *   {card:DEFID}    a reference to another card (display defaults to its name)
 *
 * Everything else is literal text. One left-to-right pass, no nesting; a `{` or
 * `}` that does not form a valid token is an error. Validation needs to know the
 * real keyword/card ids, which the caller passes in (or registers once with
 * `configureText`) — this file has NO imports so the client can carry a verbatim
 * copy (apps/client/src/textTokens.ts; a cards test asserts the two are
 * byte-identical).
 */

export type TextToken =
  | { kind: "text"; text: string }
  | { kind: "keyword"; id: string; display: string }
  | { kind: "pip"; sym: "V" | "S" | "M"; display: string }
  | { kind: "card"; defId: string; display: string };

export interface TextOptions {
  /** Valid keyword ids; when absent any lower-case id is accepted lexically. */
  keywordIds?: ReadonlySet<string>;
  /** Valid card ids for `{card:…}`; when absent any card id is accepted. */
  cardIds?: ReadonlySet<string>;
  /** Display for a bare `{card:ID}` (defaults to the id). */
  cardName?: (id: string) => string | undefined;
  /** Keyword id → label, the display for a bare `{id}` (defaults to the id). */
  labels?: ReadonlyMap<string, string>;
}

export class TextTokenError extends Error {
  /** The offending token as written (or the stray brace). */
  readonly token: string;
  /** Character offset of the token in the text. */
  readonly index: number;
  constructor(message: string, token: string, index: number) {
    super(message);
    this.name = "TextTokenError";
    this.token = token;
    this.index = index;
  }
}

let defaults: TextOptions = {};

/** Register the default options (real keyword labels/ids, card names) used when a call passes none. */
export function configureText(opts: TextOptions): void {
  defaults = { ...opts };
}

const KEYWORD_ID = /^[a-z][a-z0-9-]*$/;
const CARD_ID = /^[A-Z]+-\d+$/;

/** Split card text into tokens, throwing TextTokenError on the first malformed or unknown token. */
export function tokenizeText(text: string, opts?: TextOptions): TextToken[] {
  const o = opts ? { ...defaults, ...opts } : defaults;
  const out: TextToken[] = [];
  let lit = "";
  let i = 0;
  const flush = () => {
    if (lit) out.push({ kind: "text", text: lit });
    lit = "";
  };
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === "}") throw new TextTokenError(`stray "}" at ${i}`, "}", i);
    if (ch !== "{") {
      lit += ch;
      i++;
      continue;
    }
    const end = text.indexOf("}", i + 1);
    const nextOpen = text.indexOf("{", i + 1);
    if (end < 0 || (nextOpen >= 0 && nextOpen < end)) {
      const shown = text.slice(i, end < 0 ? Math.min(text.length, i + 24) : nextOpen);
      throw new TextTokenError(`unterminated token "${shown}" at ${i}`, shown, i);
    }
    const raw = text.slice(i, end + 1);
    const body = text.slice(i + 1, end);
    const bar = body.indexOf("|");
    const id = bar < 0 ? body : body.slice(0, bar);
    const display = bar < 0 ? undefined : body.slice(bar + 1);
    if (display !== undefined && display.length === 0) throw new TextTokenError(`empty display in "${raw}" at ${i}`, raw, i);
    if (id === "V" || id === "S" || id === "M") {
      flush();
      out.push({ kind: "pip", sym: id, display: display ?? id });
    } else if (id.startsWith("card:")) {
      const defId = id.slice(5);
      if (!CARD_ID.test(defId) || (o.cardIds && !o.cardIds.has(defId))) {
        throw new TextTokenError(`unknown card reference "${raw}" at ${i}`, raw, i);
      }
      flush();
      out.push({ kind: "card", defId, display: display ?? o.cardName?.(defId) ?? defId });
    } else {
      if (!id) throw new TextTokenError(`empty token "${raw}" at ${i}`, raw, i);
      if (!KEYWORD_ID.test(id) || (o.keywordIds && !o.keywordIds.has(id))) {
        throw new TextTokenError(`unknown keyword "${raw}" at ${i}`, raw, i);
      }
      flush();
      out.push({ kind: "keyword", id, display: display ?? o.labels?.get(id) ?? id });
    }
    i = end + 1;
  }
  flush();
  return out;
}

/** Tokens back to the plain string a player reads (displays substituted, braces gone). */
export function tokensToPlain(tokens: readonly TextToken[]): string {
  return tokens.map((t) => (t.kind === "text" ? t.text : t.display)).join("");
}

/** The rendered plain string of tokenized card text — for terminals, logs and text-parsing heuristics. */
export function plainText(text: string, opts?: TextOptions): string {
  return tokensToPlain(tokenizeText(text, opts));
}

/** Keyword ids the text mentions, in order of first appearance. */
export function keywordsInText(text: string, opts?: TextOptions): string[] {
  const seen: string[] = [];
  for (const t of tokenizeText(text, opts)) if (t.kind === "keyword" && !seen.includes(t.id)) seen.push(t.id);
  return seen;
}
