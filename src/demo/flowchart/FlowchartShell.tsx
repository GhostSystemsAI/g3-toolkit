/**
 * Flowchart workbench shell: the routing-engine activity diagrams on their own
 * capability card. It reuses the structural engine, the mbse ContainmentTree
 * browser, and the mbse shell CSS, but is scoped to activity (act) diagrams
 * and uses a node -> sub-diagram DRILL_MAP (flowchart-to-flowchart) instead of
 * the mbse block-context drill.
 *
 * This is the reusable "build a flowchart" surface: an author supplies a
 * StructuralGraphInput with activity `shape` glyphs plus a drill map, and the
 * same layoutStructural + StructuralSvgView pipeline renders it. Here it
 * documents the toolkit's own two edge routers and the structural router's
 * escalation-ladder internals.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StructuralSvgView,
  useStructuralLayout,
  type StructuralSvgViewProps,
} from "@g3t/react";
import { publishScene } from "../testing/e2e-hooks";
import type { StructuralGraphInput, StructuralGeometry } from "@g3t/core";
import { projectDiagram } from "../mbse/diagrams";
import { ContainmentTree } from "../mbse/ContainmentTree";
import { MBSE_STYLES } from "../mbse/styles";
import { CapabilityBubble } from "../components/CapabilityCallout";
import { routingFlowchartModel, DEFAULT_DIAGRAM, DRILL_MAP } from "./model";

/** MR-11 sizing helper (mirrors MbseShell): the SVG preview fills the canvas
 *  host via a ResizeObserver; jsdom has none, so the default size carries
 *  tests. */
function SizedStructuralSvg({
  scene,
  glyphs,
  onElementClick,
}: {
  scene: { input: StructuralGraphInput; geometry: StructuralGeometry };
  glyphs?: StructuralSvgViewProps["glyphs"];
  onElementClick?: StructuralSvgViewProps["onElementClick"];
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: 960,
    h: 560,
  });
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) {
        setSize({ w: Math.round(r.width), h: Math.round(r.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%" }}>
      <StructuralSvgView
        direction="DOWN"
        input={scene.input}
        geometry={scene.geometry}
        width={size.w}
        height={size.h}
        glyphs={glyphs}
        onElementClick={onElementClick}
        data-testid="flowchart-structural-svg"
      />
    </div>
  );
}

const NOTATION = {
  title: "Activity Diagram",
  blurb:
    "A control-flow flowchart built from UML activity shapes. These document the library's own edge routers: control flows down from the initial node, decisions branch on guard-labelled arrows, and a ▶ glyph on a stage drills into its sub-diagram.",
  legend: [
    { mark: "●", text: "initial / final node" },
    { mark: "◇", text: "decision (guarded branch)" },
    { mark: "─▶", text: "control flow" },
    { mark: "▶", text: "drill into sub-diagram" },
  ],
};

export function FlowchartShell({ onBack }: { onBack: () => void }) {
  const [diagramId, setDiagramId] = useState(DEFAULT_DIAGRAM);
  const diagram = routingFlowchartModel.diagrams[diagramId];

  const input: StructuralGraphInput = useMemo(
    () => projectDiagram(routingFlowchartModel, diagramId),
    [diagramId],
  );

  // Node -> sub-diagram drill for the current diagram. A ▶ glyph marks each
  // node that owns a sub-diagram; clicking the glyph opens it.
  const drill = useMemo(() => DRILL_MAP[diagramId] ?? {}, [diagramId]);

  const glyphs = useMemo(() => {
    const g = new Map<
      string,
      { slot: "top-right"; text: string; title?: string }
    >();
    for (const n of input.nodes) {
      const target = drill[n.id];
      if (target !== undefined) {
        g.set(n.id, {
          slot: "top-right",
          text: "▶",
          title: `Open ${routingFlowchartModel.diagrams[target]?.name ?? target}`,
        });
      }
    }
    return g;
  }, [input, drill]);

  const onDrillClick = useCallback<
    NonNullable<StructuralSvgViewProps["onElementClick"]>
  >(
    (info) => {
      if (info.hit.zone !== "glyph") return;
      const target = drill[info.hit.elementId];
      if (target !== undefined) setDiagramId(target);
    },
    [drill],
  );

  const { structural: scene } = useStructuralLayout(input, {
    direction: "DOWN",
  });
  publishScene("flowchart", scene);

  return (
    <div className="mbse-shell">
      <style>{MBSE_STYLES}</style>

      <header className="mbse-topbar">
        <button type="button" className="mbse-back" onClick={onBack}>
          {"←"} Scenarios
        </button>
        <div className="mbse-wordmark">
          <b>Flowchart Workbench</b>
          <span>routing engine</span>
        </div>
        <div className="mbse-diagram-title">
          <span className="mbse-diagram-badge mbse-badge-act">ACT</span>
          {diagram?.name ?? ""}
        </div>
      </header>

      <div className="mbse-body">
        <aside className="mbse-browser">
          <div className="mbse-panel-head">Diagrams</div>
          <ContainmentTree
            model={routingFlowchartModel}
            activeDiagramId={diagramId}
            onOpenDiagram={setDiagramId}
          />
        </aside>

        <main className="mbse-canvas-wrap">
          <div className="mbse-canvas-host">
            {scene ? (
              <SizedStructuralSvg
                scene={scene}
                glyphs={glyphs}
                onElementClick={onDrillClick}
              />
            ) : (
              <div className="mbse-empty">
                Laying out {diagram?.name ?? "diagram"}
                {"…"}
              </div>
            )}
          </div>
        </main>

        <aside className="mbse-inspector">
          <div className="mbse-panel-head">Diagram</div>
          <div className="mbse-insp-section">
            <div className="mbse-insp-title">{NOTATION.title}</div>
            <div className="mbse-insp-text">{NOTATION.blurb}</div>
          </div>
          <div className="mbse-panel-head">Notation</div>
          <div className="mbse-insp-section">
            {NOTATION.legend.map((l) => (
              <div className="mbse-legend-row" key={l.text}>
                <span className="mbse-legend-mark mbse-mono">{l.mark}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
          <div className="mbse-panel-head">Contents</div>
          <div className="mbse-insp-section mbse-insp-text">
            <div>
              <span className="mbse-count">{input.nodes.length}</span> nodes
            </div>
            <div>
              <span className="mbse-count">{input.edges.length}</span> flows
            </div>
          </div>
          <CapabilityBubble
            accent="#a3e635"
            items={[
              {
                mechanism: "StructuralNode.shape",
                how: "diamond / initial / final / ellipse glyphs render UML activity nodes.",
              },
              {
                mechanism: "layoutStructural",
                anchor: "lay-out-a-structural-uml-style-view",
                how: "lays out each flowchart top-down with obstacle-aware edge routes.",
              },
              {
                mechanism: "projectDiagram (pure)",
                how: "returns the authored activity graph verbatim; a drill map wires node ▶ glyphs to sub-diagrams.",
              },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
