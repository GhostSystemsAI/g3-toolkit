/**
 * DemoLanding test. The landing is the storefront; this pins it to what
 * actually ships: exactly one card per shell the router maps, card copy
 * that describes the current MBSE workbench (the old block-only demo's
 * copy regressed here once already), and the select wiring.
 *
 * The routable id set is DERIVED from Demo.tsx's SHELL_MAP, never
 * restated here: a hardcoded id list made every correctly wired new
 * surface fail this file as if it were a regression.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DemoLanding, SCENARIOS, CAPABILITY_SURFACES } from "./DemoLanding";
import { SHELL_MAP } from "./Demo";

afterEach(cleanup);

describe("DemoLanding", () => {
  it("ships exactly one card per routed shell, and no unrouted card", () => {
    const cardIds = [...SCENARIOS, ...CAPABILITY_SURFACES].map((s) => s.id);
    // No id is offered twice (within or across the two sections).
    expect(new Set(cardIds).size).toBe(cardIds.length);
    // Two-way match against the router: a card with no shell bounces
    // the visitor back to the landing; a shell with no card is dead.
    expect([...cardIds].sort()).toEqual(Object.keys(SHELL_MAP).sort());
  });

  it("keeps the four domain stories in the scenario section", () => {
    // Removal pin, not a closed list: a fifth story is an addition,
    // not a regression, and is covered by the router match above.
    expect(SCENARIOS.map((s) => s.id)).toEqual(
      expect.arrayContaining(["auditor", "biomedical", "mbse", "supply-chain"]),
    );
  });

  it("renders a card per scenario with its tags", () => {
    const { container } = render(<DemoLanding onSelect={() => {}} />);
    for (const s of SCENARIOS) {
      expect(screen.getByText(s.title)).toBeDefined();
      for (const tag of s.tags) {
        expect(container.textContent).toContain(tag);
      }
    }
  });

  it("describes the MBSE workbench that actually opens (not the retired block demo)", () => {
    const mbse = SCENARIOS.find((s) => s.id === "mbse");
    expect(mbse?.description).toContain("containment tree");
    expect(mbse?.description).toContain("IBD");
    // Retired-demo phrases must not resurface on the card.
    expect(mbse?.description).not.toContain("context-menu");
  });

  it("lists the capability surfaces beneath the scenarios (P1.4)", () => {
    // Membership is the router match above; here, the gated ids the
    // visibility assertions below depend on must still be surfaces.
    expect(CAPABILITY_SURFACES.map((s) => s.id)).toEqual(
      expect.arrayContaining(["analytics-dashboard", "scale", "style-lab"]),
    );
    const { container } = render(<DemoLanding onSelect={() => {}} />);
    // LR-1: the section header was removed; the cards themselves
    // are the contract now.
    expect(container.textContent).not.toContain("Capability surfaces");
    expect(container.textContent).toContain("Analytics Dashboard");
    expect(container.textContent).toContain("Ontology Workbench");
    // LR-7/LR-8 gating oracle: vitest runs with DEV=true, so the
    // dev set applies: Style Lab visible, Scale hidden.
    expect(screen.getByText("Style Lab")).toBeDefined();
    expect(screen.queryByText("Scale")).toBeNull();
  });

  it("hands a clicked capability surface to onSelect like any scenario", () => {
    const onSelect = vi.fn();
    render(<DemoLanding onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Analytics Dashboard"));
    expect(onSelect.mock.calls[0]?.[0]?.id).toBe("analytics-dashboard");
  });

  it("links the adopter and AI-agent guides in the footer (A33)", () => {
    render(<DemoLanding onSelect={() => {}} />);
    const links: [string, string][] = [
      ["landing-wiring-guide-link", "docs/wiring-guide.md"],
      ["landing-llms-link", "llms.txt"],
      ["landing-agents-link", "AGENTS.md"],
    ];
    for (const [testid, path] of links) {
      const a = screen.getByTestId(testid);
      expect(a.getAttribute("href")).toContain(path);
    }
  });

  it("hands the clicked scenario to onSelect", () => {
    const onSelect = vi.fn();
    render(<DemoLanding onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Provenance Auditor"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]?.id).toBe("auditor");
  });
});
