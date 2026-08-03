// Upstream R-1 (round 17, 2026-07-28): a click that ends a PAN must
// not fire onElementClick. Every consumer building an interactive
// structural scene was writing this suppression itself.
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { useElementPointerEvents } from "./element-pointer-events";

function Harness({
  onElementClick,
  threshold,
}: {
  onElementClick: () => void;
  threshold?: number;
}) {
  // Model space == client space here, so pixel deltas are model units.
  const props = useElementPointerEvents<{ elementId: string }, HTMLDivElement>(
    () => ({ elementId: "box" }),
    (client) => client,
    { onElementClick },
    threshold === undefined ? undefined : { clickDragThreshold: threshold },
  );
  return (
    <div data-testid="surface" {...props} style={{ width: 100, height: 100 }} />
  );
}

describe("click suppression after a drag", () => {
  it("fires the click when the pointer barely moved", () => {
    const onElementClick = vi.fn();
    const { getByTestId } = render(<Harness onElementClick={onElementClick} />);
    const el = getByTestId("surface");
    fireEvent.pointerDown(el, { clientX: 50, clientY: 50 });
    fireEvent.click(el, { clientX: 51, clientY: 51 });
    expect(onElementClick).toHaveBeenCalledOnce();
  });

  it("SUPPRESSES the click that ends a pan", () => {
    const onElementClick = vi.fn();
    const { getByTestId } = render(<Harness onElementClick={onElementClick} />);
    const el = getByTestId("surface");
    fireEvent.pointerDown(el, { clientX: 20, clientY: 20 });
    fireEvent.click(el, { clientX: 80, clientY: 60 });
    expect(onElementClick).not.toHaveBeenCalled();
  });

  it("threshold 0 restores fire-always for consumers who want it", () => {
    const onElementClick = vi.fn();
    const { getByTestId } = render(
      <Harness onElementClick={onElementClick} threshold={0} />,
    );
    const el = getByTestId("surface");
    fireEvent.pointerDown(el, { clientX: 20, clientY: 20 });
    fireEvent.click(el, { clientX: 80, clientY: 60 });
    expect(onElementClick).toHaveBeenCalledOnce();
  });

  it("a click with no preceding pointerdown still fires (keyboard/synthetic)", () => {
    const onElementClick = vi.fn();
    const { getByTestId } = render(<Harness onElementClick={onElementClick} />);
    fireEvent.click(getByTestId("surface"), { clientX: 10, clientY: 10 });
    expect(onElementClick).toHaveBeenCalledOnce();
  });
});
