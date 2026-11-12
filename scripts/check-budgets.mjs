#!/usr/bin/env node
/**
 * Runs BOTH bundle ledgers and reports both before failing.
 *
 * Core growth is budgeted twice: publish weight in check-bundle-size.mjs
 * and per-import first-party cost in check-consumer-cost.mjs (the
 * core-layout and core-all scenarios move with almost any core change).
 * `verify` used to chain them with `&&`, so an over-budget publish weight
 * stopped the run before consumer cost was measured. A raise that ratified
 * only the first ledger then looked green until the next verify run
 * surfaced the second (heal 5d333f9b). This runner never short-circuits:
 * every ledger runs, every over-budget line prints, and the summary names
 * every file that needs a raise with its rationale in the same commit.
 *
 * Exit codes:
 *   0  every ledger within budget
 *   1  any ledger over budget or failed to run
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const LEDGERS = [
  { name: "publish weight", script: "scripts/check-bundle-size.mjs" },
  { name: "consumer cost", script: "scripts/check-consumer-cost.mjs" },
];

/**
 * Run every ledger through `run(ledger) -> exit status` and collect the
 * failures. Exported so the no-short-circuit contract is testable without
 * a build.
 */
export function runLedgers(ledgers, run) {
  const failed = [];
  for (const ledger of ledgers) {
    if (run(ledger) !== 0) failed.push(ledger);
  }
  return failed;
}

function runNode(ledger) {
  const r = spawnSync(process.execPath, [resolve(ROOT, ledger.script)], {
    cwd: ROOT,
    stdio: "inherit",
  });
  return r.status ?? 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failed = runLedgers(LEDGERS, (ledger) => {
    console.log(`\n--- ${ledger.name} (${ledger.script}) ---\n`);
    return runNode(ledger);
  });
  if (failed.length > 0) {
    console.error(
      `\nBundle ledgers over budget: ${failed.map((l) => l.script).join(", ")}.\n` +
        `Raise EACH one listed, with its rationale, in the same commit.`,
    );
    process.exit(1);
  }
  console.log("\nBoth bundle ledgers within budget.");
}
