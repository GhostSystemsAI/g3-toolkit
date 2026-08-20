/**
 * Executable twin for the "Flowchart / Activity shapes" section of
 * docs/wiring-guide.md.
 *
 * Imports ONLY from the public @g3t/core barrel the way an adopter would.
 * If StructuralNode.shape or layoutStructural stops accepting flowchart
 * graphs, this test fails CI so the guide snippet cannot rot.
 */

import { describe, it, expect } from "vitest";
import { layoutStructural } from "@g3t/core";
import type { StructuralGraphInput } from "@g3t/core";

describe("wiring guide: flowchart / activity shapes", () => {
  // A minimal flowchart: start -> action -> decision -> (yes) end / (no) loop.
  const graph: StructuralGraphInput = {
    nodes: [
      { id: "start", shape: "initial", width: 20, height: 20 },
      { id: "action", header: { name: "Do something" } },
      {
        id: "decide",
        shape: "diamond",
        header: { name: "OK?" },
        width: 120,
        height: 56,
      },
      { id: "end", shape: "final", width: 20, height: 20 },
    ],
    edges: [
      { id: "e1", source: "start", target: "action" },
      { id: "e2", source: "action", target: "decide" },
      { id: "e3", source: "decide", target: "end", label: "yes" },
      { id: "e4", source: "decide", target: "action", label: "no" },
    ],
  };

  it("shapes are a plain-node concern; the graph is well-formed", () => {
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(4);
    // Terminals and the decision carry UML activity shapes; the action
    // node stays a default rounded rectangle (no shape needed).
    expect(graph.nodes.find((n) => n.id === "start")?.shape).toBe("initial");
    expect(graph.nodes.find((n) => n.id === "decide")?.shape).toBe("diamond");
    expect(graph.nodes.find((n) => n.id === "action")?.shape).toBeUndefined();
  });

  it("routes/lays out top-to-bottom with geometry for every node", async () => {
    const geometry = await layoutStructural(graph, { direction: "DOWN" });
    for (const id of ["start", "action", "decide", "end"]) {
      expect(geometry.nodes[id], `geometry entry for ${id}`).toBeDefined();
    }
    // Obstacle-aware routing participates regardless of shape: with
    // routeEdges on (the default) every edge gets a routed polyline.
    expect(Object.keys(geometry.edges ?? {})).toHaveLength(4);
  });
});
