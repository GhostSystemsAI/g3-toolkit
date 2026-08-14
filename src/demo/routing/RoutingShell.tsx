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
 * the quality numbers move as the corridor supply changes. The Engine
 * row exposes every live routing switch (owner ask 2026-08-14): nudge
 * (default ON here so separation is evaluable), the long-edge
 * perimeter threshold, router anchor, placement/layering strategies,
 * and an effort preset over the phase time budgets.
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

/** Long-edge perimeter policy threshold (longEdgeNear): how many
 *  near-obstacle boxes make an edge prefer the outside perimeter.
 *  "off" maps to Infinity (the documented rollback value). */
const LONG_EDGE = {
  off: Number.POSITIVE_INFINITY,
  eager: 8,
  default: 12,
  conservative: 20,
} as const;
type LongEdge = keyof typeof LONG_EDGE;

/** Effort presets over the engine's anytime phase budgets (PRF-001
 *  allocation is the default; high trades latency for quality). */
const EFFORTS = {
  low: {
    layeringBudgetMs: 40,
    orderingBudgetMs: 30,
    routingBudgetMs: 40,
    maxSweeps: 4,
  },
  default: {},
  high: {
    layeringBudgetMs: 400,
    orderingBudgetMs: 300,
    routingBudgetMs: 400,
    maxSweeps: 24,
  },
} as const;
type Effort = keyof typeof EFFORTS;

type Placement = "brandes-koepf" | "median";
type Layering = "network-simplex" | "coffman-graham" | "tight-tree";

/** Categorical palette for per-edge coloring (A9: same-gray edges made
 *  crossings untraceable). Hues picked for pairwise contrast on the
 *  near-black canvas; assignment cycles by edge index, deterministic
 *  because scenario generators are. */
const EDGE_PALETTE = [
  "#38bdf8",
  "#f472b6",
  "#4ade80",
  "#fbbf24",
  "#a78bfa",
  "#fb7185",
  "#34d399",
  "#fb923c",
  "#e879f9",
  "#22d3ee",
  "#facc15",
  "#818cf8",
  "#f87171",
  "#a3e635",
] as const;
type ColorMode = "rainbow" | "mono";

/** The SVG preview fills the canvas host via a ResizeObserver on the
 *  wrapper (the MR-11 pattern from the MBSE shell; jsdom has no
 *  ResizeObserver, so the default size carries tests). */
function SizedStructuralSvg({
  scene,
  direction,
  onEdgeClick,
}: {
  scene: { input: StructuralGraphInput; geometry: StructuralGeometry };
  direction: "RIGHT" | "DOWN";
  /** An edge click reports its id; any other click reports null so
   *  the shell can clear a pinned trace. */
  onEdgeClick: (edgeId: string | null) => void;
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
        onElementClick={(info) => {
          const h = info.hit;
          onEdgeClick(h !== null && h.kind === "edge" ? h.elementId : null);
        }}
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
  // Nudge defaults ON in the lab (owner ruling A35, 2026-08-14) even
  // though the library default is still false: the bench exists to
  // evaluate separation, so the post-pass must be visible by default.
  const [nudge, setNudge] = useState(true);
  const [longEdge, setLongEdge] = useState<LongEdge>("default");
  const [anchor, setAnchor] = useState<"source" | "target">("source");
  const [placement, setPlacement] = useState<Placement>("brandes-koepf");
  const [layering, setLayering] = useState<Layering>("network-simplex");
  const [effort, setEffort] = useState<Effort>("default");
  const [colorMode, setColorMode] = useState<ColorMode>("rainbow");
  // A9 (owner: "line crossovers are hard to tail"): a clicked edge
  // pins a trace (everything else dims); clicking anything that is
  // not an edge clears it. Hover tracing is pure CSS (ROUTING_STYLES).
  const [tracedEdge, setTracedEdge] = useState<string | null>(null);

  const input: StructuralGraphInput = useMemo(
    () => scenario.build(size),
    [scenario, size],
  );
  // A new graph invalidates a pinned edge id; drop the trace (the
  // documented adjust-state-during-render pattern, as in the SVG
  // view's fit reset).
  const [lastInput, setLastInput] = useState(input);
  if (lastInput !== input) {
    setLastInput(input);
    setTracedEdge(null);
  }
  const dir = direction === "auto" ? scenario.direction : direction;
  const options: Omit<StructuralLayoutOptions, "sketch"> = useMemo(
    () => ({
      direction: dir,
      layerSpacing: LAYER_GAPS[layerGap],
      routeEdges,
      nudge,
      longEdgeNear: LONG_EDGE[longEdge],
      anchor,
      placement,
      layering,
      ...EFFORTS[effort],
    }),
    [
      dir,
      layerGap,
      routeEdges,
      nudge,
      longEdge,
      anchor,
      placement,
      layering,
      effort,
    ],
  );

  const { structural: scene } = useStructuralLayout(input, options);
  publishScene("routing", scene);

  const quality: RouteQuality | null = useMemo(
    () => (scene ? gradeRoutes(scene.input, scene.geometry) : null),
    [scene],
  );

  // Per-edge stroke colors + pinned-trace emphasis as generated CSS.
  // CSS rules beat SVG presentation attributes, so the demo restyles
  // the view's data-ssv-* contract without a library change. Arrow
  // heads take stroke only (a fill rule would solidify hollow heads).
  const edgeCss = useMemo(() => {
    const rules: string[] = [];
    if (scene && colorMode === "rainbow") {
      scene.input.edges.forEach((e, i) => {
        const c = EDGE_PALETTE[i % EDGE_PALETTE.length];
        rules.push(
          `.rlab-canvas-host [data-ssv-edge-path="${e.id}"],` +
            `.rlab-canvas-host [data-ssv-arrow^="${e.id}:"]` +
            `{ stroke: ${c}; }`,
        );
      });
    }
    if (tracedEdge !== null) {
      rules.push(
        `.rlab-canvas-host g[data-ssv-edge]:not([data-ssv-edge="${tracedEdge}"])` +
          ` path { opacity: 0.1; }`,
      );
      rules.push(
        `.rlab-canvas-host [data-ssv-edge-path="${tracedEdge}"]` +
          `{ stroke-width: 3.5; }`,
      );
    }
    return rules.join("\n");
  }, [scene, colorMode, tracedEdge]);

  const tracedMeta = useMemo(
    () =>
      tracedEdge !== null
        ? input.edges.find((e) => e.id === tracedEdge)
        : undefined,
    [tracedEdge, input.edges],
  );

  return (
    <div className="rlab-shell">
      <style>{ROUTING_STYLES}</style>
      {edgeCss.length > 0 && (
        <style data-testid="rlab-edge-css">{edgeCss}</style>
      )}

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
            <span>
              <label htmlFor="rlab-colors">Colors</label>
              <select
                id="rlab-colors"
                data-testid="rlab-colors-select"
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
              >
                <option value="rainbow">Per-edge</option>
                <option value="mono">Monochrome</option>
              </select>
            </span>
          </div>
          <div className="rlab-toolbar rlab-toolbar-engine">
            <span className="rlab-toolbar-tag rlab-mono">ENGINE</span>
            <span>
              <label htmlFor="rlab-nudge">Nudge</label>
              <input
                id="rlab-nudge"
                type="checkbox"
                data-testid="rlab-nudge-toggle"
                checked={nudge}
                onChange={(e) => setNudge(e.target.checked)}
              />
            </span>
            <span>
              <label htmlFor="rlab-longedge">Perimeter</label>
              <select
                id="rlab-longedge"
                data-testid="rlab-longedge-select"
                value={longEdge}
                onChange={(e) => setLongEdge(e.target.value as LongEdge)}
              >
                <option value="off">Off</option>
                <option value="eager">Eager (8)</option>
                <option value="default">Default (12)</option>
                <option value="conservative">Conservative (20)</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-anchor">Anchor</label>
              <select
                id="rlab-anchor"
                data-testid="rlab-anchor-select"
                value={anchor}
                onChange={(e) =>
                  setAnchor(e.target.value as "source" | "target")
                }
              >
                <option value="source">Source</option>
                <option value="target">Target</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-placement">Placement</label>
              <select
                id="rlab-placement"
                data-testid="rlab-placement-select"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as Placement)}
              >
                <option value="brandes-koepf">Brandes-Koepf</option>
                <option value="median">Median</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-layering">Layering</label>
              <select
                id="rlab-layering"
                data-testid="rlab-layering-select"
                value={layering}
                onChange={(e) => setLayering(e.target.value as Layering)}
              >
                <option value="network-simplex">Network simplex</option>
                <option value="coffman-graham">Coffman-Graham</option>
                <option value="tight-tree">Tight tree</option>
              </select>
            </span>
            <span>
              <label htmlFor="rlab-effort">Effort</label>
              <select
                id="rlab-effort"
                data-testid="rlab-effort-select"
                value={effort}
                onChange={(e) => setEffort(e.target.value as Effort)}
              >
                <option value="low">Low (fast)</option>
                <option value="default">Default</option>
                <option value="high">High (quality)</option>
              </select>
            </span>
          </div>
          <div className="rlab-canvas-host">
            {scene ? (
              <SizedStructuralSvg
                scene={scene}
                direction={dir}
                onEdgeClick={setTracedEdge}
              />
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

          <div className="rlab-panel-head">Trace</div>
          <div className="rlab-section" data-testid="rlab-trace">
            {tracedMeta !== undefined ? (
              <>
                <MetricRow label="Edge" value={tracedMeta.id} />
                <MetricRow
                  label="Path"
                  value={`${tracedMeta.source} → ${tracedMeta.target}`}
                  tone="ok"
                />
                <p style={{ marginTop: 8 }}>
                  Everything else is dimmed. Click empty canvas to clear.
                </p>
              </>
            ) : (
              <p>
                Hover an edge to isolate it through the crossings; click it to
                pin the trace.
              </p>
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
