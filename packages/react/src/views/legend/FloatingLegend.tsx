/**
 * FloatingLegend: SpecLegend in a compact floating card anchored to a
 * corner of a graph view. Promoted from a demo-local component in the
 * ontology workbench when the supply shell became its second consumer
 * (review 12.16; same fold rule as FloatingPanel: repetition is the
 * signal). All four offsets are set inline (auto for the unused
 * sides) so host containers that stretch children via `inset: 0`
 * cannot deform it.
 */
import type { UGM } from "@g3t/core";
import { SpecLegend } from "../../interaction/encoding/SpecLegend";
import type { EncodingSpec } from "../../interaction/encoding/encoding-spec";

export function FloatingLegend({
  ugm,
  spec,
  labelFor,
  title = "Legend",
  corner = "bottom-left",
  testId = "g3t-floating-legend",
}: {
  ugm: UGM;
  spec: EncodingSpec;
  labelFor?: (value: string) => string;
  title?: string;
  corner?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  testId?: string;
}) {
  // LR-26 (owner review 2026-07-22): top corners added so shells can
  // keep the legend clear of bottom status bars.
  const horizontal = corner.endsWith("left")
    ? { left: 8, right: "auto" as const }
    : { right: 8, left: "auto" as const };
  const vertical = corner.startsWith("top")
    ? { top: 8, bottom: "auto" as const }
    : { bottom: 8, top: "auto" as const };
  return (
    <div
      data-testid={testId}
      style={{
        position: "absolute",
        ...vertical,
        ...horizontal,
        maxWidth: 240,
        maxHeight: 240,
        overflow: "auto",
        background: "var(--g3t-bg-primary, rgba(255,255,255,0.94))",
        border: "1px solid var(--g3t-border, #dee2e6)",
        borderRadius: 6,
        padding: 6,
        fontSize: 12, // LR-26: legibility bump
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        zIndex: 20,
      }}
    >
      <SpecLegend
        ugm={ugm}
        spec={spec}
        collapsible
        title={title}
        labelFor={labelFor}
      />
    </div>
  );
}
