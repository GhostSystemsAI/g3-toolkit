import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fence for heal d455ee76: a worker chained file edits with `git stash` in
// one Bash call; the PreToolUse git gate refused the stash and dropped the
// whole command, edits included. CLAUDE.md is the handoff every worker
// reads, so the rule lives there.
const root = resolve(__dirname, "../..");

describe("worker git-gate doctrine", () => {
  it("CLAUDE.md warns that a refused git op drops chained edits", () => {
    const md = readFileSync(resolve(root, "CLAUDE.md"), "utf8").replace(
      /\s+/g,
      " ",
    );
    expect(md).toContain("A refused git op drops the WHOLE Bash command");
    expect(md).toContain("Keep edits in their own Bash call");
    expect(md).toContain("`git show HEAD:<path>` into scratch");
  });
});
