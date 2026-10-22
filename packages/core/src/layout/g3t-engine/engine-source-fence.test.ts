/**
 * Routing-engine source fence (heal gotcha 2144aa96).
 *
 * Brief 05b (channel-router rewire) was hand-implemented by two
 * concurrent sessions in g3t-structural.ts + g3t-routing.ts; one
 * rewrote g3t-structural.ts on disk between the other's Read and Edit,
 * adding an unowned `expChannelPlan` "EXPERIMENT" block that built one
 * field-center bus (midline=crossCenter) for every channel. The
 * ownership rule lives in CLAUDE.md (editing discipline: one owner per
 * destructive brief, plan worktree per owner). This fence is the
 * mechanical half: in-flight experiment scaffolding must never ride a
 * commit into the routing engine, where it would silently change
 * geometry behind a default-off flag.
 *
 * If this fails, the block is either finished work (rename it and
 * give it an owner, a brief and tests) or a probe (delete it).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE_DIRS = [HERE, join(HERE, "..", "..", "route")];

/** Markers of uncommitted-quality experiment scaffolding. */
const MARKERS: readonly RegExp[] = [
  /\bEXPERIMENT\b/,
  /\bexpChannelPlan\b/,
  /\bcrossCenter\b/,
];

const SELF = fileURLToPath(import.meta.url);

function sources(): string[] {
  const out: string[] = [];
  for (const dir of ENGINE_DIRS) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".ts")) continue;
      const path = join(dir, name);
      if (path === SELF) continue;
      out.push(path);
    }
  }
  return out;
}

describe("routing-engine source fence", () => {
  it("scans the engine and router sources", () => {
    const names = sources().map((p) => relative(HERE, p));
    expect(names).toContain("g3t-structural.ts");
    expect(names).toContain("g3t-routing.ts");
    expect(names).toContain("g3t-channel-router.ts");
  });

  it("carries no experiment scaffolding", () => {
    const hits: string[] = [];
    for (const path of sources()) {
      const lines = readFileSync(path, "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const m of MARKERS) {
          if (m.test(line)) hits.push(`${relative(HERE, path)}:${i + 1} ${m}`);
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
