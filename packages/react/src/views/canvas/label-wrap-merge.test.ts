/**
 * labelWrapRule through the REAL canvas merge (gotcha ce7ee559).
 *
 * Two parallel sessions shipped two wrap mechanisms four minutes apart:
 * an unconditional 110px `text-wrap: wrap` on the base node rule
 * (e7509d9) and an opt-in labelWrapRule whose OFF state appended
 * nothing (7e9e1bd). Composed, OFF silently fell back to the base
 * wrap. The shape-only tests (wiring example, BioShell) cannot see
 * that interaction, so this resolves the computed style on a headless
 * cytoscape built from composeCanvasStylesheet, the same assembly the
 * canvas uses at init and on every restyle.
 */
import { describe, it, expect } from "vitest";
import cytoscape from "cytoscape";
import {
  composeCanvasStylesheet,
  labelWrapRule,
  type CyStylesheet,
} from "./CytoscapeCanvas";
import { LIGHT_THEME } from "../../theme/ThemeManager";

function computedWrap(userStylesheet?: CyStylesheet[]) {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: [
      { group: "nodes", data: { id: "n", label: "a long biomedical label" } },
    ],
    style: composeCanvasStylesheet(LIGHT_THEME, { userStylesheet }) as never,
  });
  const n = cy.getElementById("n");
  const out = {
    wrap: n.style("text-wrap") as string,
    maxWidth: n.style("text-max-width") as string,
  };
  cy.destroy();
  return out;
}

describe("labelWrapRule composed with the base node rule", () => {
  it("base rule wraps by default, so OFF must emit an explicit rule", () => {
    expect(computedWrap()).toEqual({ wrap: "wrap", maxWidth: "110px" });
    // The pre-fix OFF state (an empty user stylesheet) therefore wraps:
    // the switch cannot be expressed by omitting the rule.
    expect(computedWrap([]).wrap).toBe("wrap");
  });

  it("labelWrapRule(false) disables wrap on the merged canvas", () => {
    expect(computedWrap([labelWrapRule(false)]).wrap).toBe("none");
  });

  it("labelWrapRule(n) re-widths the default wrap", () => {
    expect(computedWrap([labelWrapRule(90)])).toEqual({
      wrap: "wrap",
      maxWidth: "90px",
    });
  });
});
