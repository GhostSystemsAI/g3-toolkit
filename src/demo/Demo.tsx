/**
 * Demo router: landing page ↔ application shell.
 *
 * Default view (npm run dev): landing page with scenario cards.
 * Clicking a card renders the full app with that dataset.
 *
 * Shells are CODE-SPLIT (G3L Round 49): nine lazy chunks instead
 * of one bundle carrying every example, which was the source of the
 * >500 kB chunk warning. The landing paints from a small chunk; a
 * shell's code loads on selection (the production-smoke spec's
 * 15 s mount window covers the fetch).
 */

import { lazy, Suspense, useState, useEffect } from "react";
import { DemoLanding, type Scenario } from "./DemoLanding";
import { useThemeStore } from "@g3t/react";
import { injectDesignTokens } from "@g3t/react";
import "@g3t/react";

const MbseShell = lazy(() =>
  import("./mbse/MbseShell").then((m) => ({ default: m.MbseShell })),
);
const SupplyThreadShell = lazy(() =>
  import("./supply/ThreadShell").then((m) => ({
    default: m.SupplyThreadShell,
  })),
);
const BioShell = lazy(() =>
  import("./bio/BioShell").then((m) => ({ default: m.BioShell })),
);
const AnalyticsSurface = lazy(() =>
  import("./surfaces/DashboardSurfaces").then((m) => ({
    default: m.AnalyticsSurface,
  })),
);
const ScaleSurface = lazy(() =>
  import("./scale/ScaleSurface").then((m) => ({ default: m.ScaleSurface })),
);
const OntologyShell = lazy(() =>
  import("./ontology/OntologyShell").then((m) => ({
    default: m.OntologyShell,
  })),
);
const StyleLabShell = lazy(() =>
  import("./stylelab/StyleLabShell").then((m) => ({
    default: m.StyleLabShell,
  })),
);
const AuditShell = lazy(() =>
  import("./audit/AuditShell").then((m) => ({ default: m.AuditShell })),
);
const RoutingShell = lazy(() =>
  import("./routing/RoutingShell").then((m) => ({ default: m.RoutingShell })),
);
const Rdf12Shell = lazy(() =>
  import("./rdf12/Rdf12Shell").then((m) => ({ default: m.Rdf12Shell })),
);

/** Map scenario IDs to dedicated demo shells. */
const SHELL_MAP: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  mbse: MbseShell,
  auditor: AuditShell,
  "supply-chain": SupplyThreadShell,
  biomedical: BioShell,
  "analytics-dashboard": AnalyticsSurface,
  scale: ScaleSurface,
  "ontology-workbench": OntologyShell,
  "style-lab": StyleLabShell,
  "routing-lab": RoutingShell,
  "rdf12-hyperarcs": Rdf12Shell,
};

export function Demo() {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    useThemeStore.getState().setTheme("dark");
    injectDesignTokens(true);
  }, []);

  useEffect(() => {
    injectDesignTokens(theme.id === "dark");
  }, [theme]);

  if (activeScenario) {
    const Shell = SHELL_MAP[activeScenario.id];
    if (Shell) {
      return (
        <Suspense fallback={<p style={{ padding: 24 }}>Loading example…</p>}>
          <Shell onBack={() => setActiveScenario(null)} />
        </Suspense>
      );
    }
    // Every shipped scenario has a dedicated shell; fall back to the
    // landing if an unknown id is somehow active.
    setActiveScenario(null);
    return null;
  }

  return <DemoLanding onSelect={setActiveScenario} />;
}
