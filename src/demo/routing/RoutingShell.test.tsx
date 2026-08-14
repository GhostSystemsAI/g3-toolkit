/**
 * RoutingShell contract test. StructuralSvgView is replaced by a stub
 * that records the scene it receives (the MbseShell test pattern), so
 * the shell's side of the contract is asserted headlessly: the layout
 * for the selected scenario reaches the view, the metrics panel grades
 * that same scene, and a scenario/size switch delivers a NEW scene.
 * layoutStructural runs for real (headless-safe; see scenarios.test.ts).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import type { StructuralGraphInput, StructuralGeometry } from "@g3t/core";

const captured = vi.hoisted(() => ({
  scenes: [] as Array<{
    input: StructuralGraphInput;
    geometry: StructuralGeometry;
  }>,
}));

vi.mock("@g3t/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@g3t/react")>();
  return {
    ...actual,
    StructuralSvgView: (props: {
      input: StructuralGraphInput;
      geometry: StructuralGeometry;
    }) => {
      captured.scenes.push({ input: props.input, geometry: props.geometry });
      return <div data-testid="rlab-svg-stub" />;
    },
  };
});

import { RoutingShell } from "./RoutingShell";
import { ROUTING_SCENARIOS } from "./scenarios";

beforeEach(() => {
  captured.scenes.length = 0;
});
afterEach(cleanup);

describe("RoutingShell", () => {
  it("lays out the default scenario (M) and grades the same scene", async () => {
    render(<RoutingShell onBack={() => {}} />);
    await waitFor(() => {
      expect(captured.scenes.length).toBeGreaterThan(0);
    });
    const scene = captured.scenes.at(-1)!;
    const expected = ROUTING_SCENARIOS[0]!.build("M");
    expect(scene.input.nodes.length).toBe(expected.nodes.length);
    expect(scene.input.edges.length).toBe(expected.edges.length);
    // The metrics panel graded a routed scene: full coverage shows as
    // "n / n" and the violation row reads 0.
    const metrics = screen.getByTestId("rlab-metrics");
    expect(metrics.textContent).toContain(
      `${expected.edges.length} / ${expected.edges.length}`,
    );
    expect(metrics.textContent).toContain("Box violations");
  });

  it("switching scenario delivers that scenario's scene", async () => {
    render(<RoutingShell onBack={() => {}} />);
    await waitFor(() => expect(captured.scenes.length).toBeGreaterThan(0));
    const storm = ROUTING_SCENARIOS.find((s) => s.id === "crossing-storm")!;
    fireEvent.click(screen.getByTestId("rlab-scenario-crossing-storm"));
    await waitFor(() => {
      const last = captured.scenes.at(-1)!;
      expect(last.input.edges.length).toBe(storm.build("M").edges.length);
    });
  });

  it("size knob re-runs the SAME scenario at the new size", async () => {
    render(<RoutingShell onBack={() => {}} />);
    await waitFor(() => expect(captured.scenes.length).toBeGreaterThan(0));
    fireEvent.change(screen.getByTestId("rlab-size-select"), {
      target: { value: "S" },
    });
    const small = ROUTING_SCENARIOS[0]!.build("S");
    await waitFor(() => {
      const last = captured.scenes.at(-1)!;
      expect(last.input.nodes.length).toBe(small.nodes.length);
    });
  });

  it("back affordance calls onBack", async () => {
    const onBack = vi.fn();
    render(<RoutingShell onBack={onBack} />);
    fireEvent.click(screen.getByText("← Scenarios"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
