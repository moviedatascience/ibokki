import { describe, expect, it } from "vitest";
import { act, createMatch, renderState } from "../src/matches.ts";

describe("MCP match loop", () => {
  it("drives a vs-bot match to completion (index 0 is always 'pass')", () => {
    const m = createMatch("Evocation", "Abjuration", 7, "0");
    let guard = 0;
    while (m.state.phase !== "gameover" && guard < 8000) {
      act(m, 0);
      guard++;
    }
    expect(m.state.phase).toBe("gameover");
    expect([0, 1, null]).toContain(m.state.winner);
  });

  it("controls='both' lets one driver play both sides", () => {
    const m = createMatch("Divination", "Evocation", 3, "both");
    let guard = 0;
    while (m.state.phase !== "gameover" && guard < 8000) {
      act(m, 0);
      guard++;
    }
    expect(m.state.phase).toBe("gameover");
  });

  it("opens in the Prepare phase with numbered prepare actions", () => {
    const m = createMatch("Evocation", "Divination", 1, "0");
    const text = renderState(m);
    expect(text).toContain("PREPARE phase");
    expect(text).toContain("Legal actions");
    expect(text).toMatch(/0: done preparing/);
    expect(text).toMatch(/\d+: prepare /); // at least one spell can be prepared
  });
});
