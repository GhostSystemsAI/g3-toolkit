/**
 * Routing Lab scenario tests: the generators are deterministic and
 * well-formed, and the structural engine's routing survives every
 * adversarial scenario with its core promises intact. These are the
 * pinned invariants an engine regression would break first:
 * - every input edge gets a routed polyline (full coverage),
 * - every routed segment is axis-parallel (orthogonality),
 * - no route passes through a box it neither starts nor ends at.
 * Crossings and bends are NOT pinned to exact numbers (they may shift
 * with engine tuning); only their structural floors are asserted.
 */
import { describe, it, expect } from "vitest";
import { layoutStructural } from "@g3t/core";
import { ROUTING_SCENARIOS, type ScenarioSize } from "./scenarios";
import { gradeRoutes } from "./quality";

const SIZES: ScenarioSize[] = ["S", "M", "L"];

describe("routing scenarios: generator well-formedness", () => {
  for (const sc of ROUTING_SCENARIOS) {
    it(`${sc.id}: unique ids, resolvable endpoints, monotone sizes`, () => {
      let prevNodes = 0;
      for (const size of SIZES) {
        const input = sc.build(size);
        const nodeIds = new Set(input.nodes.map((n) => n.id));
        expect(nodeIds.size).toBe(input.nodes.length);
        const edgeIds = new Set(input.edges.map((e) => e.id));
        expect(edgeIds.size).toBe(input.edges.length);
        const portIds = new Set(
          input.nodes.flatMap((n) => (n.ports ?? []).map((p) => p.id)),
        );
        for (const e of input.edges) {
          expect(nodeIds.has(e.source), `${sc.id}: ${e.id} source`).toBe(true);
          expect(nodeIds.has(e.target), `${sc.id}: ${e.id} target`).toBe(true);
          if (e.sourcePort) expect(portIds.has(e.sourcePort)).toBe(true);
          if (e.targetPort) expect(portIds.has(e.targetPort)).toBe(true);
        }
        expect(input.nodes.length).toBeGreaterThanOrEqual(prevNodes);
        prevNodes = input.nodes.length;
      }
    });

    it(`${sc.id}: deterministic (same size builds identical graphs)`, () => {
      expect(sc.build("M")).toEqual(sc.build("M"));
    });
  }
});

describe("routing scenarios: engine survives the gauntlet", () => {
  for (const sc of ROUTING_SCENARIOS) {
    it(`${sc.id} (M): full coverage, orthogonal, no box violations`, async () => {
      const input = sc.build("M");
      const geometry = await layoutStructural(input, {
        direction: sc.direction,
      });

      // Every top-level node placed with a finite, positive box.
      for (const n of input.nodes) {
        const g = geometry.nodes[n.id];
        expect(g, `${sc.id}: ${n.id} placed`).toBeDefined();
        expect(Number.isFinite(g!.x) && Number.isFinite(g!.y)).toBe(true);
        expect(g!.width).toBeGreaterThan(0);
        expect(g!.height).toBeGreaterThan(0);
      }

      const q = gradeRoutes(input, geometry);
      expect(q.unrouted, `${sc.id}: unrouted edges`).toBe(0);
      expect(q.routed).toBe(input.edges.length);
      expect(q.diagonalSegments, `${sc.id}: diagonal segments`).toBe(0);
      expect(
        q.violations,
        `${sc.id}: routes through boxes: ${q.violatingEdges.join(", ")}`,
      ).toBe(0);
      expect(q.totalLength).toBeGreaterThan(0);
    });
  }

  it("crossing-storm: crossings are unavoidable and detected", async () => {
    const sc = ROUTING_SCENARIOS.find((s) => s.id === "crossing-storm")!;
    const input = sc.build("M");
    const geometry = await layoutStructural(input, { direction: sc.direction });
    const q = gradeRoutes(input, geometry);
    // K(6,6) has crossings by Turán-type counting no matter the order;
    // a zero here means the oracle went blind, not that routing won.
    expect(q.crossings).toBeGreaterThan(0);
  });

  it("routeEdges: false omits routes and the oracle reports the fallback", async () => {
    const sc = ROUTING_SCENARIOS.find((s) => s.id === "fan-bus")!;
    const input = sc.build("S");
    const geometry = await layoutStructural(input, {
      direction: sc.direction,
      routeEdges: false,
    });
    const q = gradeRoutes(input, geometry);
    expect(q.routed).toBe(0);
    expect(q.unrouted).toBe(input.edges.length);
  });
});
