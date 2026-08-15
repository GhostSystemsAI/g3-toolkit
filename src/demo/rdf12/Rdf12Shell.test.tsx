/**
 * Rdf12Shell interaction contract. CytoscapeCanvas is stubbed to record
 * the UGM it is handed each render; everything else is real. Asserted
 * headlessly: `buildStatementInterior` extracts a self-contained
 * interior sub-graph for a hyperarc (a statement IS a graph); clicking a
 * hyperarc diamond surfaces the inspector + "Enter interior" affordance;
 * entering swaps the canvas to that statement's interior and shows the
 * drill breadcrumb; selecting an edge inspects it.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import type { UGM } from "@g3t/core";

const canvasCalls = vi.hoisted(() => ({
  ugms: [] as UGM[],
}));

vi.mock("@g3t/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@g3t/react")>();
  return {
    ...actual,
    CytoscapeCanvas: (props: { ugm: UGM }) => {
      canvasCalls.ugms.push(props.ugm);
      return <div data-testid="canvas-stub" />;
    },
  };
});

import { Rdf12Shell, buildStatementInterior } from "./Rdf12Shell";
import { useSelectionStore } from "@g3t/react";
import { projectTripleTermsAsHyperarcs, RDF_STATEMENT_FLAG } from "@g3t/core";
import { RDF12_ROWS } from "./rdf12";

function firstStatementId(ugm: UGM): string {
  let found = "";
  ugm.forEachNode((id, attrs) => {
    if (!found && attrs.properties[RDF_STATEMENT_FLAG] === true) found = id;
  });
  return found;
}

afterEach(() => {
  useSelectionStore.getState().clearSelection();
  canvasCalls.ugms.length = 0;
  cleanup();
});

describe("buildStatementInterior", () => {
  it("returns a self-contained interior for a hyperarc statement", () => {
    const full = projectTripleTermsAsHyperarcs(RDF12_ROWS);
    const stmtId = firstStatementId(full);
    expect(stmtId).not.toBe("");

    const interior = buildStatementInterior(full, stmtId);

    // The statement node is present, is smaller than the full graph,
    // and every interior node is a term reachable from the statement.
    expect(interior.hasNode(stmtId)).toBe(true);
    expect(interior.nodeCount).toBeLessThan(full.nodeCount);
    expect(interior.nodeCount).toBeGreaterThan(1);
    // Every interior edge originates at the statement (pure interior).
    interior.forEachEdge((_id, _a, source) => {
      expect(source).toBe(stmtId);
    });
  });
});

describe("Rdf12Shell click-to-inspect + holon drill", () => {
  it("inspects a selected edge", () => {
    render(<Rdf12Shell onBack={() => {}} />);
    const full = canvasCalls.ugms[0]!;
    let edgeId = "";
    full.forEachEdge((id) => {
      if (!edgeId) edgeId = id;
    });
    act(() => useSelectionStore.getState().selectEdges([edgeId]));
    expect(screen.getByTestId("detail-inspector").textContent).toContain(
      "Edge:",
    );
  });

  it("enters a hyperarc interior and shows the drill breadcrumb", () => {
    render(<Rdf12Shell onBack={() => {}} />);
    const full = canvasCalls.ugms[0]!;
    const stmtId = firstStatementId(full);
    const fullCount = full.nodeCount;

    act(() => useSelectionStore.getState().selectNodes([stmtId]));
    const enter = screen.getByTestId("rdf12-enter-interior");
    fireEvent.click(enter);

    // Breadcrumb appears and the canvas now renders the interior graph.
    expect(screen.getByTestId("rdf12-breadcrumb")).toBeTruthy();
    const shown = canvasCalls.ugms[canvasCalls.ugms.length - 1]!;
    expect(shown.nodeCount).toBeLessThan(fullCount);
    expect(shown.hasNode(stmtId)).toBe(true);

    // Backing out to the full graph restores the node set.
    fireEvent.click(screen.getByTestId("rdf12-breadcrumb-root"));
    const back = canvasCalls.ugms[canvasCalls.ugms.length - 1]!;
    expect(back.nodeCount).toBe(fullCount);
  });
});
