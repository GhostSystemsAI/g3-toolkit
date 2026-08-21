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
        expect(nodeIds.has(nodeId), `node ${nodeId} not in ${fromId}`).toBe(
          true,
        );
        expect(
          routingFlowchartModel.diagrams[targetId],
          `diagram ${targetId} not registered`,
        ).toBeDefined();
      }
    }
    // Existing escalation drill.
    expect(DRILL_MAP["dg.act.structural"]?.["st.escalate"]).toBe(
      "dg.act.structural.detail",
    );
    // New drills: Scene → A*, Structural → fan/nudge, detail attempts → A*.
    expect(DRILL_MAP["dg.act.scene"]?.["sr.ortho"]).toBe("dg.act.ortho");
    expect(DRILL_MAP["dg.act.structural"]?.["st.fan"]).toBe("dg.act.fan");
    expect(DRILL_MAP["dg.act.structural"]?.["st.nudge"]).toBe("dg.act.nudge");
    expect(DRILL_MAP["dg.act.structural.detail"]?.["sd.try1"]).toBe(
      "dg.act.ortho",
    );
    expect(DRILL_MAP["dg.act.structural.detail"]?.["sd.try2"]).toBe(
      "dg.act.ortho",
    );
    expect(DRILL_MAP["dg.act.structural.detail"]?.["sd.try3"]).toBe(
      "dg.act.ortho",
    );
  });

  it("projectDiagram returns empty for an unknown diagram id", () => {
    expect(projectDiagram(routingFlowchartModel, "nope")).toEqual({
      nodes: [],
      edges: [],
    });
  });

  it("routeOrthogonal A* diagram has prune decision, A* node, and both terminals", () => {
    const d = projectDiagram(routingFlowchartModel, "dg.act.ortho");
    expect(d.nodes.find((n) => n.id === "or.prune")?.shape).toBe("diamond");
    expect(d.nodes.find((n) => n.id === "or.astar")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "or.emit")?.shape).toBe("final");
    expect(d.nodes.find((n) => n.id === "or.null")?.shape).toBe("final");
    // stub ladder node is present and readable.
    expect(d.nodes.find((n) => n.id === "or.stub")).toBeTruthy();
  });

  it("nudging two-pass diagram has pass-1 and pass-2 nodes", () => {
    const d = projectDiagram(routingFlowchartModel, "dg.act.nudge");
    expect(d.nodes.find((n) => n.id === "nu.p1norm")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "nu.p1group")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "nu.p1commit")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "nu.p2")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "nu.emit")?.shape).toBe("final");
  });

  it("fan/anchor diagram has fanKey, sidesFor, pitch decision, and anchorOf nodes", () => {
    const d = projectDiagram(routingFlowchartModel, "dg.act.fan");
    expect(d.nodes.find((n) => n.id === "fa.key")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "fa.sides")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "fa.pitch")?.shape).toBe("diamond");
    expect(d.nodes.find((n) => n.id === "fa.anchor")?.shape).toBe("ellipse");
    expect(d.nodes.find((n) => n.id === "fa.emit")?.shape).toBe("final");
  });

  // Every authored flowchart must be a valid layout input.
  for (const id of [
    "dg.act.interaction",
    "dg.act.scene",
    "dg.act.structural",
    "dg.act.structural.detail",
    "dg.act.ortho",
    "dg.act.nudge",
    "dg.act.fan",
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
