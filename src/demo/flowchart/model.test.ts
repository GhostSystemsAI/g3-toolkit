import { describe, it, expect } from "vitest";
import { layoutStructural } from "@g3t/core";
import { projectDiagram } from "../mbse/diagrams";
import { routingFlowchartModel, DEFAULT_DIAGRAM, DRILL_MAP } from "./model";

describe("routing flowchart model", () => {
  it("returns each authored activity graph verbatim, with shape glyphs", () => {
    const scene = projectDiagram(routingFlowchartModel, "dg.act.scene");
    const start = scene.nodes.find((n) => n.id === "sr.start");
    expect(start?.shape).toBe("initial");
    expect(scene.nodes.some((n) => n.shape === "diamond")).toBe(true);
    expect(scene.nodes.some((n) => n.shape === "final")).toBe(true);
    // Decision branches carry guard labels.
    const yes = scene.edges.find(
      (e) => e.source === "sr.self" && e.label === "yes",
    );
    expect(yes?.target).toBe("sr.skip");

    // The structural router flowchart is the larger authored graph.
    const st = projectDiagram(routingFlowchartModel, "dg.act.structural");
    expect(st.nodes.length).toBeGreaterThan(scene.nodes.length);
    expect(st.nodes.find((n) => n.id === "st.nudge")?.shape).toBe("ellipse");
  });

  it("opens on the interaction overview, which branches to both routers", () => {
    expect(DEFAULT_DIAGRAM).toBe("dg.act.interaction");
    const ix = projectDiagram(routingFlowchartModel, DEFAULT_DIAGRAM);
    expect(ix.nodes.find((n) => n.id === "ix.kind")?.shape).toBe("diamond");
    // yes -> structural, no -> scene (the router-selection decision).
    const yes = ix.edges.find(
      (e) => e.source === "ix.kind" && e.label === "yes",
    );
    const no = ix.edges.find((e) => e.source === "ix.kind" && e.label === "no");
    expect(yes?.target).toBe("ix.struct");
    expect(no?.target).toBe("ix.scene");
  });

  it("expands the escalation ladder into per-attempt internals", () => {
    const d = projectDiagram(routingFlowchartModel, "dg.act.structural.detail");
    const attempts = d.nodes.filter((n) => /^sd\.try\d$/.test(n.id));
    expect(attempts.length).toBe(3);
    // The honest fallback and the routed-emit are both terminals.
    expect(d.nodes.find((n) => n.id === "sd.fallback")?.shape).toBe("final");
    expect(d.nodes.find((n) => n.id === "sd.done")?.shape).toBe("final");
  });

  it("drill map targets real diagrams from nodes present on the source diagram", () => {
    for (const [fromId, byNode] of Object.entries(DRILL_MAP)) {
      const from = projectDiagram(routingFlowchartModel, fromId);
      const nodeIds = new Set(from.nodes.map((n) => n.id));
      for (const [nodeId, targetId] of Object.entries(byNode)) {
        expect(nodeIds.has(nodeId)).toBe(true);
        expect(routingFlowchartModel.diagrams[targetId]).toBeDefined();
      }
    }
    // The A45 drill: the structural router's escalation node opens the
    // internals diagram.
    expect(DRILL_MAP["dg.act.structural"]?.["st.escalate"]).toBe(
      "dg.act.structural.detail",
    );
  });

  it("projectDiagram returns empty for an unknown diagram id", () => {
    expect(projectDiagram(routingFlowchartModel, "nope")).toEqual({
      nodes: [],
      edges: [],
    });
  });

  // Every authored flowchart must be a valid layout input.
  for (const id of [
    "dg.act.interaction",
    "dg.act.scene",
    "dg.act.structural",
    "dg.act.structural.detail",
  ]) {
    it(`layout smoke: ${id} lays out DOWN and places every node`, async () => {
      const g = projectDiagram(routingFlowchartModel, id);
      const geometry = await layoutStructural(g, { direction: "DOWN" });
      for (const n of g.nodes) {
        expect(
          geometry.nodes[n.id],
          `missing geometry for ${n.id}`,
        ).toBeTruthy();
      }
    });
  }
});
