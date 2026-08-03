/**
 * Structural SVG view (G3L:RND-001 continuation; F1 structural
 * slice).
 *
 * Renders the renderer-neutral structural geometry document
 * (StructuralGeometry: absolute top-left boxes for containers, rows,
 * plain nodes, ports, plus routed edge polylines) through pure SVG.
 * This is the alternative renderer path for structural diagrams:
 * where the Cytoscape path converts geometry to cy elements and
 * fights compound semantics (the expand/collapse postmortem's
 * "geometry-right is not picture-right"), this view draws the
 * document VERBATIM: what the layout computed is what appears, and
 * jsdom can verify all of it headlessly.
 *
 * Interaction: transform-only wheel-zoom and drag-pan on the scene
 * group (the MR-2-validated pattern; no per-element work in the hot
 * path). UML edge symbols reuse the overlay's arrow geometry
 * (arrowShapes / shortenPolyline / isDashedKind), so the two paths
 * cannot drift apart on relationship semantics.
 */
import React, { useCallback, useMemo, useRef, useState } from "react";
import { routeStructuralEdges, hitTestStructural } from "@g3t/core";
import type {
  StructuralGeometry,
  StructuralGraphInput,
  StructuralHit,
  GlyphSlot,
} from "@g3t/core";
import {
  useElementPointerEvents,
  type ElementPointerHandlers,
} from "../../interaction/element-pointer-events";
import {
  arrowShapes,
  isDashedKind,
  shortenPolyline,
  type UmlEdgeKind,
} from "../canvas/structural-edge-overlay";

export interface StructuralSvgTheme {
  background: string;
  containerFill: string;
  containerStroke: string;
  headerFill: string;
  headerText: string;
  rowText: string;
  dividerText: string;
  nodeFill: string;
  nodeText: string;
  edgeStroke: string;
  edgeLabel: string;
  portFill: string;
}

/** Defaults tuned for the demo's dark shell. */
export const STRUCTURAL_SVG_DARK: StructuralSvgTheme = {
  background: "transparent",
  containerFill: "rgba(30, 41, 59, 0.85)",
  containerStroke: "#64748b",
  headerFill: "rgba(51, 65, 85, 0.95)",
  headerText: "#e2e8f0",
  rowText: "#cbd5e1",
  dividerText: "#94a3b8",
  nodeFill: "rgba(30, 41, 59, 0.85)",
  nodeText: "#e2e8f0",
  edgeStroke: "#94a3b8",
  edgeLabel: "#cbd5e1",
  portFill: "#e2e8f0",
};

/** R-2 (round 17, 2026-07-28): the glyph affordance's box. Drawn in
 *  the header strip so it reads as a button rather than as part of
 *  the container's body. */
const GLYPH_W = 16;
const GLYPH_H = 14;
const GLYPH_PAD = 4;

function glyphBox(
  g: { x: number; y: number; width: number; height: number },
  headerH: number,
  slot: GlyphSlot,
): { x: number; y: number } {
  const left = g.x + GLYPH_PAD;
  const right = g.x + g.width - GLYPH_W - GLYPH_PAD;
  const centerX = g.x + g.width / 2 - GLYPH_W / 2;
  const topY = g.y + (headerH - GLYPH_H) / 2;
  const bottomY = g.y + g.height - GLYPH_H - GLYPH_PAD;
  switch (slot) {
    case "top-left":
      return { x: left, y: topY };
    case "bottom-left":
      return { x: left, y: bottomY };
    case "bottom-right":
      return { x: right, y: bottomY };
    case "top":
      return { x: centerX, y: topY };
    case "bottom":
      return { x: centerX, y: bottomY };
    case "top-right":
    default:
      return { x: right, y: topY };
  }
}

export interface StructuralSvgViewProps extends ElementPointerHandlers<StructuralHit> {
  /** R-2 (round 17): per-node affordance drawn as a bordered box in
   *  the header strip, with its own hit zone ("glyph") so consumers
   *  can act on the glyph alone. Class g3t-ssv-glyph for hover
   *  styling. */
  glyphs?: ReadonlyMap<
    string,
    { slot: GlyphSlot; text: string; title?: string }
  >;
  /** R-3 (round 17): 2 renders the stereotype on its own centred
   *  line above the name (UML convention). Default 1 leaves
   *  existing scenes unchanged. */
  headerLines?: 1 | 2;
  input: StructuralGraphInput;
  geometry: StructuralGeometry;
  width: number;
  height: number;
  theme?: StructuralSvgTheme;
  /** Flow direction of the layout that produced `geometry`; the
   *  live drag re-router anchors against it (RTE-011). */
  direction?: "RIGHT" | "LEFT" | "DOWN" | "UP";
  /** LR-46 (owner review 2026-07-22): SHACL-style decorations so
   *  the shapes surface can ride this view. Row ids map to their
   *  worst validation severity (text tint); closed containers get
   *  a heavier border. */
  rowSeverities?: ReadonlyMap<string, "violation" | "warning" | "info">;
  closedContainers?: ReadonlySet<string>;
  "data-testid"?: string;
}

const SEVERITY_TINT: Record<"violation" | "warning" | "info", string> = {
  violation: "#ef4444",
  warning: "#eab308",
  info: "#38bdf8",
};

const FIT_PADDING = 32;

export function StructuralSvgView({
  glyphs,
  headerLines = 1,
  input,
  geometry,
  direction = "RIGHT",
  rowSeverities,
  closedContainers,
  width,
  height,
  theme = STRUCTURAL_SVG_DARK,
  "data-testid": testId,
  ...pointerHandlers
}: StructuralSvgViewProps): React.JSX.Element {
  // Fit-to-content initial viewport.
  const fit = useMemo(() => {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const g of Object.values(geometry.nodes)) {
      if (g.parent !== undefined) continue;
      x1 = Math.min(x1, g.x);
      y1 = Math.min(y1, g.y);
      x2 = Math.max(x2, g.x + g.width);
      y2 = Math.max(y2, g.y + g.height);
    }
    if (!Number.isFinite(x1)) return { k: 1, tx: 0, ty: 0 };
    const k = Math.min(
      (width - 2 * FIT_PADDING) / Math.max(1, x2 - x1),
      (height - 2 * FIT_PADDING) / Math.max(1, y2 - y1),
      1.5,
    );
    return {
      k,
      tx: (width - k * (x2 - x1)) / 2 - k * x1,
      ty: (height - k * (y2 - y1)) / 2 - k * y1,
    };
  }, [geometry, width, height]);

  const [view, setView] = useState<{ k: number; tx: number; ty: number }>(fit);
  const [lastFit, setLastFit] = useState(fit);
  if (lastFit !== fit) {
    // New geometry/viewport: reset to the fresh fit (the documented
    // adjust-state-during-render pattern; no refs in render).
    setLastFit(fit);
    setView(fit);
  }
  const drag = useRef<{ x: number; y: number } | null>(null);
  // MR-11 round-3 (owner: "click-drag only works for the entire
  // canvas"): pointer-down now resolves through the hit test. A
  // node body/header grab drags THAT node (rendered through an
  // offset map; its edges' routed polylines are stale during the
  // drag, so they fall back to straight lines, honestly, until
  // RTE-011 wires live rerouting here). Anything else pans.
  const nodeDrag = useRef<{ id: string; lastX: number; lastY: number } | null>(
    null,
  );
  const [dragOffsets, setDragOffsets] = useState<
    Record<string, { dx: number; dy: number }>
  >({});
  const offsetOf = (ownerId: string): { dx: number; dy: number } =>
    dragOffsets[ownerId] ?? { dx: 0, dy: 0 };
  // RTE-011 (LR-15/22, owner review 2026-07-22): live re-routing.
  // The offsets are applied to a CLONED geometry (moved tops, their
  // rows/child entries by the `id::` convention, and their declared
  // ports), and the pure router runs over it, so dragged elements
  // keep ORTHOGONAL edges and route-anchored labels instead of
  // collapsing to center-to-center lines. The straight fallback
  // below survives only for edges the router skips.
  const portOwner = useMemo(() => {
    const own = new Map<string, string>();
    for (const n of input.nodes) {
      for (const p of n.ports ?? []) own.set(p.id, n.id);
    }
    return own;
  }, [input.nodes]);
  // LR-18: port multiplicities from the INPUT (geometry carries
  // only placement).
  const portMultiplicity = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of input.nodes) {
      for (const p of n.ports ?? []) {
        if (p.multiplicity !== undefined) m.set(p.id, p.multiplicity);
      }
    }
    return m;
  }, [input.nodes]);
  const effectiveGeometry = useMemo(() => {
    const moved = Object.keys(dragOffsets);
    if (moved.length === 0) return geometry;
    const shifted = (
      ownerOf: (id: string) => string | undefined,
      entries: Record<string, { x: number; y: number }>,
    ) => {
      const out: Record<string, { x: number; y: number }> = {};
      for (const [id, g] of Object.entries(entries)) {
        const owner = ownerOf(id);
        const off = owner !== undefined ? dragOffsets[owner] : undefined;
        out[id] = off ? { ...g, x: g.x + off.dx, y: g.y + off.dy } : g;
      }
      return out;
    };
    const topOwner = (id: string) => {
      const head = id.split("::")[0] ?? id;
      return dragOffsets[head] ? head : undefined;
    };
    return {
      ...geometry,
      nodes: shifted(topOwner, geometry.nodes) as typeof geometry.nodes,
      ports: shifted((id) => {
        const declared = portOwner.get(id);
        if (declared !== undefined && dragOffsets[declared]) return declared;
        return topOwner(id);
      }, geometry.ports ?? {}) as typeof geometry.ports,
    };
  }, [geometry, dragOffsets, portOwner]);
  const liveRoutes = useMemo(() => {
    if (Object.keys(dragOffsets).length === 0) return null;
    try {
      return routeStructuralEdges(input, effectiveGeometry, { direction });
    } catch {
      return null; // last-resort fallback below stays honest
    }
  }, [dragOffsets, input, effectiveGeometry, direction]);

  const draggedEdgeFallback = useMemo(() => {
    const moved = new Set(Object.keys(dragOffsets));
    if (moved.size === 0) return new Set<string>();
    const out = new Set<string>();
    for (const e of input.edges) {
      if (moved.has(e.source) || moved.has(e.target)) out.add(e.id);
    }
    return out;
  }, [dragOffsets, input.edges]);

  // INT-001: model point = inverse of the view transform.
  // R-2: the view owns glyph geometry, so it probes for core.
  const glyphAt = useCallback(
    (elementId: string, point: { x: number; y: number }) => {
      const gl = glyphs?.get(elementId);
      if (gl === undefined) return null;
      const gRaw = effectiveGeometry.nodes[elementId];
      if (gRaw === undefined) return null;
      const box = glyphBox(gRaw, effectiveGeometry.headerHeight, gl.slot);
      return point.x >= box.x &&
        point.x <= box.x + GLYPH_W &&
        point.y >= box.y &&
        point.y <= box.y + GLYPH_H
        ? gl.slot
        : null;
    },
    [glyphs, effectiveGeometry],
  );

  const hit = useCallback(
    (p: { x: number; y: number }) =>
      // VR-1: hit against the OFFSET geometry, matching the render.
      hitTestStructural(input, effectiveGeometry, p, { glyphAt }),
    [input, effectiveGeometry, glyphAt],
  );
  const toModel = useCallback(
    (client: { x: number; y: number }, el: SVGSVGElement) => {
      const r = el.getBoundingClientRect();
      return {
        x: (client.x - r.left - view.tx) / view.k,
        y: (client.y - r.top - view.ty) / view.k,
      };
    },
    [view],
  );
  const pointerProps = useElementPointerEvents<StructuralHit, SVGSVGElement>(
    hit,
    toModel,
    pointerHandlers,
  );

  // MR-11 round-4 (owner: wheel "zooms the overall application
  // shell and the graph view unreliably"): React attaches wheel
  // listeners PASSIVELY at the root, so a React onWheel cannot
  // preventDefault and the page scrolls the shell while the graph
  // zooms (the "linked" feel). The zoom therefore binds as a NATIVE
  // non-passive listener that preventDefaults. Round-3's lesson
  // stands inside it: event-derived values are captured before the
  // deferred state updater runs.
  const svgRef = useRef<SVGSVGElement | null>(null);
  React.useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(4, Math.max(0.05, v.k * factor));
        // Zoom about the pointer: keep the model point under it
        // fixed.
        return {
          k,
          tx: px - ((px - v.tx) / v.k) * k,
          ty: py - ((py - v.ty) / v.k) * k,
        };
      });
    };
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, []);
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const model = {
      x: (e.clientX - rect.left - view.tx) / view.k,
      y: (e.clientY - rect.top - view.ty) / view.k,
    };
    // VR-1: offset geometry here too, or a dragged container can
    // never be grabbed again (its region stays at the old spot).
    const h = hitTestStructural(input, effectiveGeometry, model, {
      glyphAt,
    });
    // LR-13 (owner review 2026-07-22): container interiors are
    // covered by ROW hits, which used to fall through to canvas pan,
    // leaving only the thin header and the 4px border as container
    // grab targets ("very difficult to trigger a container move").
    // A row grab now drags its CONTAINER (the row's geometry parent),
    // and the border band counts as a grab too.
    const dragId =
      h === null
        ? undefined
        : h.kind === "node" &&
            (h.zone === "body" || h.zone === "header" || h.zone === "border")
          ? h.elementId
          : h.kind === "row"
            ? geometry.nodes[h.elementId]?.parent
            : undefined;
    if (dragId !== undefined) {
      nodeDrag.current = {
        id: dragId,
        lastX: e.clientX,
        lastY: e.clientY,
      };
    } else {
      drag.current = { x: e.clientX, y: e.clientY };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const nd = nodeDrag.current;
    if (nd) {
      const dx = (e.clientX - nd.lastX) / view.k;
      const dy = (e.clientY - nd.lastY) / view.k;
      nd.lastX = e.clientX;
      nd.lastY = e.clientY;
      setDragOffsets((m) => {
        const cur = m[nd.id] ?? { dx: 0, dy: 0 };
        return { ...m, [nd.id]: { dx: cur.dx + dx, dy: cur.dy + dy } };
      });
      return;
    }
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
    nodeDrag.current = null;
  };

  const edgeKind = useMemo(() => {
    const m = new Map<string, { kind: UmlEdgeKind; label?: string }>();
    for (const e of input.edges) {
      m.set(e.id, {
        kind: (e.kind ?? "association") as UmlEdgeKind,
        label: e.label,
      });
    }
    return m;
  }, [input.edges]);

  const nodes = Object.entries(geometry.nodes);
  const containers = nodes.filter(([, g]) => g.kind === "container");
  const rows = nodes.filter(([, g]) => g.kind === "row");
  const plain = nodes.filter(([, g]) => g.kind === "node");
  const headerH = geometry.headerHeight;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      data-testid={testId}
      role="img"
      style={{
        // G2 (owner 2026-07-28): dragging swept text into the
        // browser selection across containers; labels are not
        // user-selectable content in a diagram.
        userSelect: "none",
        background: theme.background,
        cursor: "grab",
        touchAction: "none",
      }}
      ref={svgRef}
      onClick={pointerProps.onClick}
      onContextMenu={pointerProps.onContextMenu}
      onPointerLeave={pointerProps.onPointerLeave}
      onPointerDown={(e) => {
        pointerProps.onPointerDown(e);
        onPointerDown(e);
      }}
      onPointerMove={(e) => {
        pointerProps.onPointerMove(e);
        onPointerMove(e);
      }}
      onPointerUp={(e) => {
        pointerProps.onPointerUp(e);
        onPointerUp();
      }}
    >
      <g
        data-ssv-scene=""
        transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}
      >
        {/* Containers: body, header strip, header text. */}
        {containers.map(([id, gRaw]) => {
          const off = offsetOf(id);
          const g = { ...gRaw, x: gRaw.x + off.dx, y: gRaw.y + off.dy };
          const header = input.nodes.find((n) => n.id === id)?.header;
          const closed = closedContainers?.has(id) === true;
          // VR-27 v2 (owner 2026-07-28): no keyword; OPEN shapes
          // draw a DASHED border instead (closed stays solid and
          // heavier). Only where the scene distinguishes at all
          // (closedContainers provided): MBSE containers unaffected.
          const distinguishClosed = closedContainers !== undefined;
          // R-3 (round 17, 2026-07-28): UML convention puts the
          // stereotype on its OWN line above the name; on one line
          // it competes with long names for the same horizontal
          // budget. headerLines=2 opts in; 1 (default) is unchanged.
          const twoLine =
            headerLines === 2 &&
            header?.stereotype !== undefined &&
            header.name !== undefined;
          const title = header
            ? `${header.stereotype ? `\u00ab${header.stereotype}\u00bb ` : ""}${header.name}`
            : (g.text ?? id);
          const glyph = glyphs?.get(id);
          return (
            <g key={id} data-ssv-node={id} data-ssv-kind="container">
              <rect
                x={g.x}
                y={g.y}
                width={g.width}
                height={g.height}
                rx={4}
                fill={theme.containerFill}
                stroke={theme.containerStroke}
                strokeWidth={closed ? 2.4 : 1.2}
                strokeDasharray={
                  distinguishClosed && !closed ? "6 3" : undefined
                }
                data-ssv-closed={closed ? "" : undefined}
                data-ssv-open={distinguishClosed && !closed ? "" : undefined}
              />
              <rect
                x={g.x}
                y={g.y}
                width={g.width}
                height={headerH}
                rx={4}
                fill={theme.headerFill}
              />
              {twoLine && header ? (
                <>
                  <text
                    x={g.x + g.width / 2}
                    y={g.y + headerH / 2 - 3}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={500}
                    fill={theme.headerText}
                    data-ssv-header-stereotype={id}
                  >
                    {`\u00ab${header.stereotype ?? ""}\u00bb`}
                  </text>
                  <text
                    x={g.x + g.width / 2}
                    y={g.y + headerH / 2 + 11}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={700}
                    fill={theme.headerText}
                    data-ssv-header={id}
                  >
                    {header.name}
                  </text>
                </>
              ) : (
                <text
                  x={g.x + g.width / 2}
                  y={g.y + headerH / 2 + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={theme.headerText}
                  data-ssv-header={id}
                >
                  {title}
                </text>
              )}
              {glyph !== undefined && (
                <g
                  className="g3t-ssv-glyph"
                  data-ssv-glyph={id}
                  data-ssv-glyph-slot={glyph.slot}
                  style={{ cursor: "pointer" }}
                >
                  <title>{glyph.title ?? glyph.text}</title>
                  <rect
                    x={glyphBox(g, headerH, glyph.slot).x}
                    y={glyphBox(g, headerH, glyph.slot).y}
                    width={GLYPH_W}
                    height={GLYPH_H}
                    rx={3}
                    fill={theme.headerFill}
                    stroke={theme.containerStroke}
                    strokeWidth={1}
                  />
                  <text
                    x={glyphBox(g, headerH, glyph.slot).x + GLYPH_W / 2}
                    y={glyphBox(g, headerH, glyph.slot).y + GLYPH_H / 2 + 3.5}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill={theme.headerText}
                  >
                    {glyph.text}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Compartment rows (divider titles styled separately). */}
        {rows.map(([id, gRaw]) => {
          const off = offsetOf(gRaw.parent ?? id);
          const g = { ...gRaw, x: gRaw.x + off.dx, y: gRaw.y + off.dy };
          const severity = rowSeverities?.get(id);
          return (
            <g key={id}>
              {/* LR-23 (owner review 2026-07-22): a simple horizontal
                  separator above each section divider (id vs text,
                  attribute compartments), the classic UML
                  compartment line. */}
              {g.divider === true ? (
                <line
                  x1={g.x}
                  y1={g.y}
                  x2={g.x + g.width}
                  y2={g.y}
                  stroke={theme.containerStroke}
                  strokeWidth={0.8}
                  data-ssv-row-divider={id}
                />
              ) : null}
              <text
                /* LR-14 (owner review 2026-07-22): sections and
                 attributes CENTER, matching the cytoscape
                 compartment presentation. */
                x={g.x + g.width / 2}
                y={g.y + g.height / 2 + 3.5}
                textAnchor="middle"
                fontSize={g.divider ? 9.5 : 10.5}
                fontStyle={g.divider ? "italic" : undefined}
                fill={
                  severity !== undefined
                    ? SEVERITY_TINT[severity]
                    : g.divider
                      ? theme.dividerText
                      : theme.rowText
                }
                data-ssv-row={id}
                data-ssv-row-severity={severity}
              >
                {g.text ?? ""}
              </text>
            </g>
          );
        })}

        {/* Plain nodes. */}
        {plain.map(([id, gRaw]) => {
          const off = offsetOf(id);
          const g = { ...gRaw, x: gRaw.x + off.dx, y: gRaw.y + off.dy };
          return (
            <g key={id} data-ssv-node={id} data-ssv-kind="node">
              <rect
                x={g.x}
                y={g.y}
                width={g.width}
                height={g.height}
                rx={6}
                fill={theme.nodeFill}
                stroke={theme.containerStroke}
                strokeWidth={1.2}
              />
              <text
                x={g.x + g.width / 2}
                y={g.y + g.height / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fill={theme.nodeText}
                data-ssv-label={id}
              >
                {g.text ?? input.nodes.find((n) => n.id === id)?.header?.name}
              </text>
            </g>
          );
        })}

        {/* Edges: routed polylines, arrow-trimmed shafts, UML
            symbols, mid labels. */}
        {Object.entries(geometry.edges ?? {}).map(([id, egRaw]) => {
          const meta = edgeKind.get(id);
          if (!meta) return null;
          // Dragged endpoints make the routed polyline stale: fall
          // back to a straight offset-aware center line (data-ssv-
          // edge-fallback marks it for tests and for the eye).
          let eg = egRaw;
          let fallback = false;
          const live = liveRoutes?.[id];
          if (draggedEdgeFallback.has(id) && live) {
            eg = live; // RTE-011: routed against the offset geometry
          } else if (draggedEdgeFallback.has(id)) {
            const edge = input.edges.find((x) => x.id === id);
            const sG = edge ? geometry.nodes[edge.source] : undefined;
            const tG = edge ? geometry.nodes[edge.target] : undefined;
            if (edge && sG && tG) {
              const so = offsetOf(edge.source);
              const to = offsetOf(edge.target);
              eg = {
                points: [
                  {
                    x: sG.x + sG.width / 2 + so.dx,
                    y: sG.y + sG.height / 2 + so.dy,
                  },
                  {
                    x: tG.x + tG.width / 2 + to.dx,
                    y: tG.y + tG.height / 2 + to.dy,
                  },
                ],
              };
              fallback = true;
            }
          }
          const shapes = arrowShapes(meta.kind, eg.points);
          let pts = eg.points;
          for (const s of shapes) {
            pts = shortenPolyline(pts, s.end, s.trim);
          }
          const d = pts
            .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
            .join(" ");
          // Owner 2026-07-28 (shapes note + the IBD Imagery/Cmd
          // collision): labels anchor at the TARGET end, backed off
          // along the final segment and offset perpendicular, not at
          // the route's middle vertex (which is a bend on most
          // orthogonal routes and collides where fans converge).
          const labelAt = (():
            | { x: number; y: number; anchor: "start" | "middle" | "end" }
            | undefined => {
            const pts = eg.points;
            const b = pts[pts.length - 1];
            const a = pts[pts.length - 2] ?? b;
            if (b === undefined || a === undefined) return undefined;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            // Owner 2026-07-28 v2: port labels own the quadrant
            // ABOVE E/W ports and RIGHT of N/S ports, so edge
            // labels take the OPPOSITE quadrant: below the line on
            // horizontal approaches, left of the line on vertical
            // ones. Disjoint by construction.
            if (Math.abs(dx) >= Math.abs(dy)) {
              const back = Math.min(12, Math.abs(dx) / 2);
              return {
                x: b.x - Math.sign(dx || 1) * back,
                y: b.y + 12,
                anchor: dx >= 0 ? "end" : "start",
              };
            }
            const back = Math.min(12, Math.abs(dy) / 2);
            return {
              x: b.x - 8,
              y: b.y - Math.sign(dy || 1) * back + 3,
              anchor: "end",
            };
          })();
          return (
            <g key={id} data-ssv-edge={id}>
              <path
                d={d}
                fill="none"
                stroke={theme.edgeStroke}
                strokeWidth={1.5}
                strokeDasharray={isDashedKind(meta.kind) ? "6 4" : undefined}
                data-ssv-edge-path={id}
                {...(fallback ? { "data-ssv-edge-fallback": id } : {})}
              />
              {shapes.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  stroke={theme.edgeStroke}
                  strokeWidth={1.5}
                  fill={s.fill === "stroke" ? theme.edgeStroke : "none"}
                  data-ssv-arrow={`${id}:${s.end}`}
                />
              ))}
              {meta.label !== undefined && labelAt !== undefined && (
                <text
                  x={labelAt.x}
                  y={labelAt.y}
                  textAnchor={labelAt.anchor}
                  fontSize={9}
                  fill={theme.edgeLabel}
                  data-ssv-edge-label={id}
                >
                  {meta.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Boundary ports above everything. */}
        {Object.entries(geometry.ports).map(([id, pRaw]) => {
          const off = offsetOf(pRaw.node);
          const p = { ...pRaw, x: pRaw.x + off.dx, y: pRaw.y + off.dy };
          // LR-18 (owner review 2026-07-22): ports carry their OWN
          // name labels (the local part of the port id), side-aware
          // anchored beside the port: what read as mis-anchored
          // "edge labels" in the IBD were edge labels doing double
          // duty for unlabeled ports. Case passes through as
          // authored.
          // VR-26 (owner re-verify 2026-07-28): shapes-scene port
          // ids are URIs; a "."-split pops the URI tail, not a
          // name. Cut at the LAST of #, /, or "." instead.
          const cut = Math.max(
            id.lastIndexOf("#"),
            id.lastIndexOf("/"),
            id.lastIndexOf("."),
          );
          const localName = cut >= 0 ? id.slice(cut + 1) : id;
          const mult = portMultiplicity.get(id);
          // LR-18: SysML-style multiplicity beside the port name.
          const name =
            mult !== undefined ? `${localName} [${mult}]` : localName;
          // G1 (owner 2026-07-28, v3 of this placement): OUTSIDE
          // the container beside the port (inside placement sat on
          // top of container rows), offset PERPENDICULAR to the
          // port axis so the label clears the wire, which exits at
          // the port's center line (the VR-10 ask).
          const labelPos =
            p.side === "EAST"
              ? {
                  x: p.x + p.width + 3,
                  y: p.y - 3,
                  anchor: "start" as const,
                }
              : p.side === "WEST"
                ? {
                    x: p.x - 3,
                    y: p.y - 3,
                    anchor: "end" as const,
                  }
                : p.side === "SOUTH"
                  ? {
                      x: p.x + p.width + 4,
                      y: p.y + p.height + 10,
                      anchor: "start" as const,
                    }
                  : {
                      x: p.x + p.width + 4,
                      y: p.y - 4,
                      anchor: "start" as const,
                    };
          return (
            <g key={id}>
              <rect
                x={p.x}
                y={p.y}
                width={p.width}
                height={p.height}
                fill={theme.portFill}
                stroke={theme.containerStroke}
                strokeWidth={0.8}
                data-ssv-port={id}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={labelPos.anchor}
                fontSize={8.5}
                fill={theme.rowText}
                data-ssv-port-label={id}
              >
                {name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
