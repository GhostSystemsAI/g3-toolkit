/**
 * Data-mapper scoping fence (CLAUDE.md architecture doctrine).
 *
 * A `data(field)` mapping on a rule whose selector also matches
 * elements WITHOUT `field` makes Cytoscape warn for every such element
 * on every style pass; in the block view that console flood stalled
 * the canvas (~1.7s/toggle, 2026-06-17). This test drives the REAL
 * composed canvas stylesheet over REAL element sets (the satellite BDD
 * structural scene, a UGM compound scene) through headless Cytoscape
 * and asserts zero mapping warnings, plus a static check that every
 * exported stylesheet producer scopes its data() mappers.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cytoscape from "cytoscape";
import { UGM, layoutStructural, overridesToCytoscapeStyles } from "@g3t/core";
import { projectDiagram } from "../../../../../src/demo/mbse/diagrams";
import { satelliteModel } from "../../../../../src/demo/mbse/model";
import { THEME_PRESETS, deriveCytoscapeStyle } from "../../theme/ThemeManager";
import { composeCanvasStylesheet } from "./CytoscapeCanvas";
import { MULTI_TYPE_PIE_RULES } from "./multi-type";
import { structuralToCytoscapeElements } from "./structural-to-cytoscape";
import { ugmToCytoscapeElements } from "./ugm-to-cytoscape";

const theme = Object.values(THEME_PRESETS)[0]!;

function mappingWarnings(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls
    .map((c: unknown[]) => c.map(String).join(" "))
    .filter((m: string) => /mapping|data field/i.test(m));
}

/** Every data(x) in a rule's style must be guarded by `[x]` / `[?x]`
 *  in its selector, or by a class whose producer always sets x. */
function unscopedMappers(
  rules: readonly unknown[],
  classGuaranteed: readonly string[] = [],
): string[] {
  const bad: string[] = [];
  for (const r of rules as {
    selector: string;
    style: Record<string, unknown>;
  }[]) {
    for (const [prop, v] of Object.entries(r.style ?? {})) {
      const m = typeof v === "string" ? /^data\((\w+)\)$/.exec(v) : null;
      if (!m) continue;
      const field = m[1]!;
      const guarded =
        new RegExp(`\\[\\??${field}(\\]|\\s*[=!<>])`).test(r.selector) ||
        classGuaranteed.some((c) => r.selector.includes(c));
      if (!guarded) bad.push(`${r.selector} { ${prop}: data(${field}) }`);
    }
  }
  return bad;
}

afterEach(() => vi.restoreAllMocks());

describe("data-mapped style selector scoping", () => {
  it("block view: structural scene renders with zero mapping warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input = projectDiagram(satelliteModel, "dg.bdd");
    const geometry = await layoutStructural(input, { direction: "DOWN" });
    const elements = structuralToCytoscapeElements(input, geometry);
    const cy = cytoscape({
      headless: true,
      styleEnabled: true,
      elements: elements as never,
      style: composeCanvasStylesheet(theme) as never,
    });
    cy.elements().forEach((e) => {
      e.style("label");
      e.style("opacity");
    });
    expect(cy.nodes(":parent").length).toBeGreaterThan(0);
    expect(mappingWarnings(warn)).toEqual([]);
    cy.destroy();
  });

  it("force view: compound + plain UGM scene renders with zero mapping warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ugm = new UGM();
    ugm.addNode("sys", { types: ["System"], properties: { name: "Sys" } });
    ugm.addNode("a", { types: ["Part"], properties: { name: "A" } });
    ugm.addNode("b", { types: ["Part"], properties: {} });
    ugm.addEdge("a", "b", { type: "uses", properties: {} });
    ugm.addEdge("sys", "a", { type: "contains", properties: {} });
    const elements = ugmToCytoscapeElements(ugm, {
      containment: { edgeType: "contains", direction: "parentToChild" },
    });
    const cy = cytoscape({
      headless: true,
      styleEnabled: true,
      elements: elements as never,
      style: [
        ...composeCanvasStylesheet(theme),
        ...deriveCytoscapeStyle(theme),
      ] as never,
    });
    cy.elements().forEach((e) => e.style("label"));
    expect(mappingWarnings(warn)).toEqual([]);
    cy.destroy();
  });

  it("compound parent without _compoundLabel (property-carried parent) stays silent", () => {
    // A UGM node whose properties carry `parent` becomes a Cytoscape
    // child through the properties spread, so its container is a
    // :parent WITHOUT _compoundLabel (only the containment pre-pass
    // stamps that field).
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ugm = new UGM();
    ugm.addNode("grp", { types: ["Group"], properties: { name: "G" } });
    ugm.addNode("m", {
      types: ["Part"],
      properties: { name: "M", parent: "grp" },
    });
    const elements = ugmToCytoscapeElements(ugm);
    const cy = cytoscape({
      headless: true,
      styleEnabled: true,
      elements: elements as never,
      style: composeCanvasStylesheet(theme) as never,
    });
    expect(cy.getElementById("grp").isParent()).toBe(true);
    cy.elements().forEach((e) => e.style("label"));
    expect(mappingWarnings(warn)).toEqual([]);
    cy.destroy();
  });

  it("host-merged deriveCytoscapeStyle over the block view stays silent", async () => {
    // deriveCytoscapeStyle is the host-composition export; merged as a
    // userStylesheet it lands AFTER the structural class rules, so a
    // bare `node { label: data(label) }` reaches structural elements
    // (which carry _label, not label) unshadowed.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input = projectDiagram(satelliteModel, "dg.bdd");
    const geometry = await layoutStructural(input, { direction: "DOWN" });
    const cy = cytoscape({
      headless: true,
      styleEnabled: true,
      elements: structuralToCytoscapeElements(input, geometry) as never,
      style: composeCanvasStylesheet(theme, {
        userStylesheet: deriveCytoscapeStyle(theme) as never,
      }) as never,
    });
    cy.elements().forEach((e) => e.style("label"));
    expect(mappingWarnings(warn)).toEqual([]);
    cy.destroy();
  });

  it("every exported stylesheet producer scopes its data() mappers", () => {
    expect(
      unscopedMappers(composeCanvasStylesheet(theme), [
        // structuralToCytoscapeElements sets _w/_h/_label on every
        // element of these classes, and routed edges always carry
        // _segDist/_segWeight.
        ".g3t-structural-",
        ".g3t-canvas-edge-routed",
      ]),
    ).toEqual([]);
    expect(unscopedMappers(deriveCytoscapeStyle(theme))).toEqual([]);
    expect(
      unscopedMappers(
        overridesToCytoscapeStyles([
          { scope: { type: "Person" }, labelField: "nickname", color: "#f00" },
          { scope: { nodeId: "p1" }, labelField: "title" },
        ]),
      ),
    ).toEqual([]);
    expect(unscopedMappers(MULTI_TYPE_PIE_RULES)).toEqual([]);
  });

  // The producer list above is hand-picked, so a new stylesheet (an
  // exported rule set, a demo shell's const, an inline JSX rule) escapes
  // it. This sweep reads every data(x) literal in package and demo
  // source and checks the nearest preceding selector, so the fence
  // follows the source rather than today's rendered scenes.
  it("every data(x) literal in source sits under a guarding selector", () => {
    let root = dirname(fileURLToPath(import.meta.url));
    while (!existsSync(resolve(root, "pnpm-workspace.yaml"))) {
      root = dirname(root);
    }
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name !== "node_modules" && e.name !== "dist") walk(p);
        } else if (
          /\.tsx?$/.test(e.name) &&
          !/\.(test|stories)\.tsx?$/.test(e.name)
        ) {
          files.push(p);
        }
      }
    };
    for (const pkg of ["core", "react", "charts"]) {
      walk(join(root, "packages", pkg, "src"));
    }
    walk(join(root, "src"));

    const classGuaranteed = [".g3t-structural-", ".g3t-canvas-edge-routed"];
    const bad: string[] = [];
    let seen = 0;
    for (const f of files) {
      // Comments mention data(x) in prose; blank them, keeping line
      // numbers, so only real style values are checked.
      const lines = readFileSync(f, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "))
        .replace(/^\s*\/\/.*$/gm, "")
        .split("\n");
      lines.forEach((line, i) => {
        for (const m of line.matchAll(/["'`]data\((\w+)\)["'`]/g)) {
          seen++;
          const field = m[1]!;
          let selector: string | undefined;
          for (let j = i; j >= Math.max(0, i - 40) && !selector; j--) {
            selector = /selector:\s*(.+?),?\s*$/.exec(lines[j]!)?.[1];
          }
          const guarded =
            selector !== undefined &&
            (new RegExp(`\\[\\??${field}(\\]|\\s*[=!<>])`).test(selector) ||
              classGuaranteed.some((c) => selector!.includes(c)));
          if (!guarded) {
            bad.push(
              `${relative(root, f)}:${i + 1} data(${field}) <- ${selector}`,
            );
          }
        }
      });
    }
    expect(seen).toBeGreaterThan(30);
    expect(bad).toEqual([]);
  });
});
