import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";
import { resolve } from "node:path";

// Fence for heal f7a0d038: a timing probe, `process.stderr.write("PROBE
// render ...")`, was committed in src/demo/scale/ScaleSurface.test.tsx
// (cd3db07) and the lint gate passed it. eslint.config.js now rejects
// direct process stream writes outside scripts/; this asserts the rule
// fires on that exact shape through the repo's own config.
const root = resolve(__dirname, "../..");
const PROBE = 'process.stderr.write("PROBE render " + 12 + "\\n");\n';

async function ruleIds(text: string, file: string): Promise<string[]> {
  const eslint = new ESLint({ cwd: root });
  const [result] = await eslint.lintText(text, {
    filePath: resolve(root, file),
  });
  return result.messages.map((m) => m.ruleId ?? "");
}

describe("lint: no stray process-stream probes", () => {
  it("rejects process.stderr.write in a demo test file", async () => {
    expect(await ruleIds(PROBE, "src/demo/scale/Probe.test.tsx")).toContain(
      "no-restricted-syntax",
    );
  }, 30_000);

  it("rejects process.stdout.write in package source", async () => {
    expect(
      await ruleIds(
        PROBE.replace("stderr", "stdout"),
        "packages/core/src/probe.ts",
      ),
    ).toContain("no-restricted-syntax");
  }, 30_000);

  it("leaves Node tooling under scripts/ free to write", async () => {
    expect(await ruleIds(PROBE, "scripts/probe.mjs")).not.toContain(
      "no-restricted-syntax",
    );
  }, 30_000);
});
