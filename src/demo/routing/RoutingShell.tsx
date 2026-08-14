/**
 * Routing Lab shell: an instrumentation bench for the structural
 * engine's edge routing. The sidebar lists adversarial scenarios
 * (scenarios.ts), the canvas renders the laid-out scene through the
 * SVG structural view (the geometry document drawn verbatim), and the
 * inspector grades the routed polylines live (quality.ts): routed
 * coverage, crossings, bends, orthogonality, and hard violations
 * (a route through a box it neither starts nor ends at).
 *
 * The knobs re-run the SAME scenario under different layout budgets
 * (size, direction, layer gap, routes on/off), so a reviewer can watch
 * the quality numbers move as the corridor supply changes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { StructuralSvgView, useStructuralLayout } from "@g3t/react";
import type {
  StructuralGeometry,
  StructuralGraphInput,
  StructuralLayoutOptions,
} from "@g3t/core";
import { publishScene } from "../testing/e2e-hooks";
import {
  DEFAULT_ROUTING_SCENARIO,
  ROUTING_SCENARIOS,
  type ScenarioSize,
} from "./scenarios";
import { gradeRoutes, type RouteQuality } from "./quality";
import { ROUTING_STYLES } from "./routing-styles";
import { CapabilityBubble } from "../components/CapabilityCallout";

const LAYER_GAPS = { compact: 40, default: 80, wide: 140 } as const;
type LayerGap = keyof typeof LAYER_GAPS;

/** The SVG preview fills the canvas host via a ResizeObserver on the
 *  wrapper (the MR-11 pattern from the MBSE shell; jsdom has no
 *  ResizeObserver, so the default size carries tests). */
function SizedStructuralSvg({
  scene,
  direction,
}: {
  scene: { input: StructuralGraphInput; geometry: StructuralGeometry };
  direction: "RIGHT" | "DOWN";
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
        direction={direction}
        input={scene.input}
        geometry={scene.geometry}
        width={size.w}
        height={size.h}
        data-testid="rlab-structural-svg"
      />
    </div>
  );
}

function MetricRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const toneClass =
    tone === "ok"
      ? "rlab-ok"
      : tone === "warn"
        ? "rlab-warn"
        : tone === "bad"
          ? "rlab-bad"
          : "";
  return (
    <div className="rlab-metric-row">
      <span className="rlab-metric-label">{label}</span>
      <span className={`rlab-metric-value rlab-mono ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}

export function RoutingShell({ onBack }: { onBack: () => void }) {
  const [scenarioId, setScenarioId] = useState(DEFAULT_ROUTING_SCENARIO.id);
  const scenario =
    ROUTING_SCENARIOS.find((s) => s.id === scenarioId) ??
    DEFAULT_ROUTING_SCENARIO;
  const [size, setSize] = useState<ScenarioSize>("M");
  const [direction, setDirection] = useState<"auto" | "RIGHT" | "DOWN">("auto");
  const [layerGap, setLayerGap] = useState<LayerGap>("default");
  const [routeEdges, setRouteEdges] = useState(true);

  const input: StructuralGraphInput = useMemo(
    () => scenario.build(size),
    [scenario, size],
  );
  const dir = direction === "auto" ? scenario.direction : direction;
  const options: Omit<StructuralLayoutOptions, "sketch"> = useMemo(
    () => ({
      direction: dir,
      layerSpacing: LAYER_GAPS[layerGap],
      routeEdges,
    }),
    [dir, layerGap, routeEdges],
  );

  const { structural: scene } = useStructuralLayout(input, options);
  publishScene("routing", scene);

  const quality: RouteQuality | null = useMemo(
    () => (scene ? gradeRoutes(scene.input, scene.geometry) : null),
    [scene],
  );

  return (
    <div className="rlab-shell">
      <style>{ROUTING_STYLES}</style>

      <header className="rlab-topbar">
        <button type="button" className="rlab-back" onClick={onBack}>
          {"←"} Scenarios
        </button>
        <div className="rlab-wordmark">
          <b>Routing Lab</b>
          <span>edge-routing stress bench</span>
        </div>
        <div className="rlab-title">
          <span className="rlab-badge rlab-mono">STRESS</span>
          {scenario.title}
        </div>
      </header>

      <div className="rlab-body">
        <aside className="rlab-sidebar">
          <div className="rlab-panel-head">Scenarios</div>
          {ROUTING_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              data-testid={`rlab-scenario-${s.id}`}
              className={`rlab-scenario${s.id === scenario.id ? " rlab-active" : ""}`}
              onClick={() => setScenarioId(s.id)}
            >
              <b>{s.title}</b>
              <span>{s.subtitle}</span>
            </button>
          ))}
        </aside>

        <main className="rlab-canvas-wrap">
          <div className="rlab-toolbar">
            <span>
              <label htmlFor="rlab-size">Size</label>
              <select
                id="rlab-size"
                data-testid="rlab-size-select"
                value={size}
                onChange={(e) => setSize(e.target.value as ScenarioSize)}
              >
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-direction">Flow</label>
              <select
                id="rlab-direction"
                value={direction}
                onChange={(e) =>
                  setDirection(e.target.value as "auto" | "RIGHT" | "DOWN")
                }
              >
                <option value="auto">Scenario default</option>
                <option value="RIGHT">Right</option>
                <option value="DOWN">Down</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-gap">Layer gap</label>
              <select
                id="rlab-gap"
                value={layerGap}
                onChange={(e) => setLayerGap(e.target.value as LayerGap)}
              >
                <option value="compact">Compact (40)</option>
                <option value="default">Default (80)</option>
                <option value="wide">Wide (140)</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-routes">Routes</label>
              <select
                id="rlab-routes"
                value={routeEdges ? "on" : "off"}
                onChange={(e) => setRouteEdges(e.target.value === "on")}
              >
                <option value="on">Engine-routed</option>
                <option value="off">Endpoint-only</option>
              </select>
            </span>
          </div>
          <div className="rlab-canvas-host">
            {scene ? (
              <SizedStructuralSvg scene={scene} direction={dir} />
            ) : (
              <div className="rlab-empty">
                Laying out {scenario.title}
                {"…"}
              </div>
            )}
          </div>
        </main>

        <aside className="rlab-inspector">
          <div className="rlab-panel-head">Route quality</div>
          <div className="rlab-section" data-testid="rlab-metrics">
            {quality ? (
              <>
                <MetricRow
                  label="Edges routed"
                  value={`${quality.routed} / ${quality.routed + quality.unrouted}`}
                  tone={quality.unrouted === 0 ? "ok" : "warn"}
                />
                <MetricRow
                  label="Box violations"
                  value={String(quality.violations)}
                  tone={quality.violations === 0 ? "ok" : "bad"}
                />
                <MetricRow
                  label="Diagonal segments"
                  value={String(quality.diagonalSegments)}
                  tone={quality.diagonalSegments === 0 ? "ok" : "warn"}
                />
                <MetricRow
                  label="Crossings"
                  value={String(quality.crossings)}
                />
                <MetricRow label="Bends" value={String(quality.bends)} />
                <MetricRow
                  label="Total route length"
                  value={`${Math.round(quality.totalLength)} px`}
                />
                <MetricRow
                  label="Graph"
                  value={`${input.nodes.length} n / ${input.edges.length} e`}
                />
              </>
            ) : (
              <p>Waiting for layout…</p>
            )}
          </div>

          <div className="rlab-panel-head">What this stresses</div>
          <div className="rlab-section">
            <p>{scenario.description}</p>
            <ul className="rlab-stress">
              {scenario.stresses.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <CapabilityBubble
            accent="#fb7185"
            items={[
              {
                mechanism: "layoutStructural",
                anchor: "lay-out-a-structural-uml-style-view",
                how: "lays out each stress graph and emits obstacle-aware edge routes.",
              },
              {
                mechanism: "StructuralSvgView",
                how: "draws the geometry document verbatim, routes included.",
              },
              {
                mechanism: "polylineIntersectsBoxes",
                how: "grades every route against the scene's boxes: a hit is a hard violation.",
              },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
