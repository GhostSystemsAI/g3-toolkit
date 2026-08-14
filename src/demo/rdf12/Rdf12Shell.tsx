/**
 * RDF 1.2 hyperarc demo shell (Brief 14).
 *
 * Left rail: the authored quoted triples with their annotations
 * (statedBy / confidence / recordedAt / reviewedBy). Center: the
 * same rows rendered TWO ways, toggled live —
 *
 * - Hyperarc (default): each unique `« s p o »` becomes a diamond
 *   `_Statement` pseudo-node with rdf:subject/object edges and one
 *   annotation edge per row; the nested review reads as a
 *   statement-to-statement link (the shape the edge render cannot
 *   express).
 * - Asserted: haunt g-xplore convention — one dashed `star` edge per
 *   annotation from the base subject to the base object, layered
 *   over the asserted base edge. Low visual clutter; drops the
 *   nested case to a synthetic label-node fallback.
 *
 * Both renders fold a numeric `confidence` annotation onto its
 * projected artifact as `_confidence`, and the shell ships a stylesheet
 * with `[_confidence]`-scoped opacity plus a `[_rdfStatement]`-scoped
 * diamond shape — data-mapped style props stay on `[field]`-scoped
 * selectors per CLAUDE.md (bare `node`/`edge` rules would flood the
 * console with per-frame Cytoscape warnings on the elements missing
 * the field).
 */
import { useMemo, useState } from "react";
import { CytoscapeCanvas, type CyStylesheet } from "@g3t/react";
import {
  projectTripleTermsAsEdges,
  projectTripleTermsAsHyperarcs,
  STAR_EDGE_TYPE,
} from "@g3t/core";
import { publishCanvas } from "../testing/e2e-hooks";
import { CapabilityBubble } from "../components/CapabilityCallout";
import { usePrefersReducedMotion } from "../components/usePrefersReducedMotion";
import { RDF12_ROWS, tripleLabel, termLabel } from "./rdf12";

/* eslint-disable @typescript-eslint/no-explicit-any --
   Cytoscape's TS types don't accept `data(x)` strings for opacity /
   shape even though they work at runtime; style objects cast to any
   the same way CytoscapeCanvas's own ENCODING_*_RULES do. */

const ACCENT = "#38bdf8";

type ViewMode = "hyperarc" | "asserted";

/** Group flat annotation rows by their quoted triple for the rail. */
function useGrouped() {
  return useMemo(() => {
    const groups: Array<{
      label: string;
      annotations: Array<{ pred: string; value: string }>;
    }> = [];
    const byLabel = new Map<string, number>();
    for (const row of RDF12_ROWS) {
      const label = tripleLabel(row.stmt.value);
      let idx = byLabel.get(label);
      if (idx === undefined) {
        idx = groups.length;
        byLabel.set(label, idx);
        groups.push({ label, annotations: [] });
      }
      const group = groups[idx];
      if (group) {
        group.annotations.push({
          pred: termLabel(row.ann),
          value: termLabel(row.val),
        });
      }
    }
    return groups;
  }, []);
}

// [_rdfStatement] and [_confidence] scoped rules only; NEVER a bare
// `node` / `edge` selector on data-mapped props (CLAUDE.md doctrine).
const HYPERARC_STYLE: CyStylesheet[] = [
  {
    selector: "node[?_rdfStatement]",
    style: {
      shape: "diamond",
      "background-color": ACCENT,
      "border-color": "#0369a1",
      "border-width": 2,
      width: 44,
      height: 44,
      "font-size": 10,
    } as any,
  },
  {
    selector: "node[_confidence]",
    style: { opacity: "data(_confidence)" } as any,
  },
  {
    selector: "edge[?_annotation]",
    style: {
      "line-style": "dashed",
      "line-color": "#94a3b8",
      "target-arrow-color": "#94a3b8",
      width: 1.5,
    } as any,
  },
  {
    selector: "edge[type = 'rdf:subject']",
    style: {
      "line-color": ACCENT,
      "target-arrow-color": ACCENT,
      width: 2,
    } as any,
  },
  {
    selector: "edge[type = 'rdf:object']",
    style: {
      "line-color": ACCENT,
      "target-arrow-color": ACCENT,
      width: 2,
      "line-style": "dotted",
    } as any,
  },
];

const EDGE_STYLE: CyStylesheet[] = [
  {
    selector: `edge[type = '${STAR_EDGE_TYPE}']`,
    style: {
      "line-style": "dashed",
      "line-color": "#94a3b8",
      "target-arrow-color": "#94a3b8",
      "curve-style": "bezier",
      "control-point-step-size": 40,
      width: 1.5,
      label: "data(annP)",
      "font-size": 9,
      color: "#8b949e",
    } as any,
  },
  {
    selector: "edge[_confidence]",
    style: { opacity: "data(_confidence)" } as any,
  },
  {
    selector: "edge[?asserted]",
    style: {
      width: 2,
      "line-color": ACCENT,
      "target-arrow-color": ACCENT,
    } as any,
  },
];

export function Rdf12Shell({ onBack }: { onBack: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<ViewMode>("hyperarc");
  const ugm = useMemo(
    () =>
      mode === "hyperarc"
        ? projectTripleTermsAsHyperarcs(RDF12_ROWS)
        : projectTripleTermsAsEdges(RDF12_ROWS),
    [mode],
  );
  const stylesheet = mode === "hyperarc" ? HYPERARC_STYLE : EDGE_STYLE;
  const groups = useGrouped();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0d1117",
        color: "#e6edf3",
        fontFamily: "var(--g3t-font, 'IBM Plex Sans', sans-serif)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 16px",
          borderBottom: "1px solid #21262d",
        }}
      >
        <button
          type="button"
          className="g3t-btn"
          data-testid="rdf12-back"
          onClick={onBack}
          style={{ fontSize: 12 }}
        >
          {"←"} Scenarios
        </button>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <b style={{ fontSize: 15 }}>RDF 1.2 Hyperarcs</b>
          <span style={{ fontSize: 12, color: "#8b949e" }}>
            quoted triples as hyperarcs — pseudo-node reification vs
            haunt-style annotation edges
          </span>
        </div>
        <div
          role="tablist"
          aria-label="Render mode"
          style={{ marginLeft: "auto", display: "flex", gap: 6 }}
        >
          {(["hyperarc", "asserted"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              data-testid={`rdf12-view-${m}`}
              onClick={() => setMode(m)}
              className="g3t-btn"
              style={{
                fontSize: 12,
                borderColor: mode === m ? ACCENT : "#30363d",
                color: mode === m ? ACCENT : "#c9d1d9",
              }}
            >
              {m === "hyperarc" ? "Hyperarc" : "Asserted"}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside
          data-testid="rdf12-rail"
          style={{
            width: 340,
            flex: "0 0 340px",
            borderRight: "1px solid #21262d",
            overflowY: "auto",
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#8b949e",
              marginBottom: 8,
            }}
          >
            Authored statements
          </div>
          {groups.map((g) => (
            <div
              key={g.label}
              data-testid="rdf12-statement"
              style={{
                border: `1px solid ${ACCENT}40`,
                borderLeft: `3px solid ${ACCENT}`,
                borderRadius: 6,
                padding: "8px 10px",
                marginBottom: 10,
                background: "rgba(56,189,248,0.06)",
              }}
            >
              <code
                style={{
                  fontSize: 12,
                  color: ACCENT,
                  fontFamily: "var(--g3t-font-mono, monospace)",
                  wordBreak: "break-word",
                }}
              >
                {g.label}
              </code>
              <div style={{ marginTop: 6 }}>
                {g.annotations.map((a) => (
                  <div
                    key={a.pred + a.value}
                    style={{ fontSize: 11, color: "#8b949e" }}
                  >
                    <span style={{ color: "#c9d1d9" }}>{a.pred}</span> {a.value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main
          style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
        >
          <div
            data-testid="rdf12-legend"
            style={{
              display: "flex",
              gap: 14,
              padding: "6px 12px",
              fontSize: 11,
              color: "#8b949e",
              borderBottom: "1px solid #21262d",
              flexWrap: "wrap",
            }}
          >
            {mode === "hyperarc" ? (
              <>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>diamond</strong>: reified
                  statement (« s p o »)
                </span>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>rdf:subject / rdf:object</strong>:
                  term links
                </span>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>dashed</strong>: annotation
                  (statedBy / confidence / recordedAt)
                </span>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>statement → statement</strong>:
                  nested quoted triple
                </span>
              </>
            ) : (
              <>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>solid</strong>: asserted
                  base triple
                </span>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>dashed</strong>: annotation
                  edge (one per row, label = ann predicate)
                </span>
                <span>
                  <strong style={{ color: "#c9d1d9" }}>opacity</strong>: driven
                  by <code>_confidence</code>
                </span>
              </>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CytoscapeCanvas
              ugm={ugm}
              layout="fcose"
              stylesheet={stylesheet}
              onReady={publishCanvas("rdf12")}
              animate={!reducedMotion}
            />
          </div>
          <div style={{ padding: 12 }}>
            <CapabilityBubble
              accent={ACCENT}
              items={[
                {
                  mechanism: "projectTripleTermsAsHyperarcs",
                  how: "reifies each `« s p o »` into a diamond pseudo-node with rdf:subject/object; nested triples recurse to statement-to-statement links.",
                },
                {
                  mechanism: "projectTripleTermsAsEdges",
                  how: "one dashed `star` edge per annotation, layered over the asserted base edge (the haunt g-xplore convention).",
                },
                {
                  mechanism: "SparqlAdapter (RDF 1.2 triple terms)",
                  anchor: "rdf-1-2-hyperarcs-triple-terms",
                  how: "parses `« s p o »` triple terms out of SPARQL-1.2-JSON, recursively; `tripleTermToValue` preserves nesting.",
                },
              ]}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
