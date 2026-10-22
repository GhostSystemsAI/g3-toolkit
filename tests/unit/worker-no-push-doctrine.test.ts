import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fence for heal cb92962e: a dispatched worker ran `git push` from its
// worktree because its generic contract said "commit and push", and the
// export gate refused it (origin is github.com, off the forge mesh).
// CLAUDE.md is the handoff every worker reads, so the rule lives there.
const root = resolve(__dirname, "../..");

describe("worker push doctrine", () => {
  it("CLAUDE.md tells dispatched workers not to push", () => {
    const md = readFileSync(resolve(root, "CLAUDE.md"), "utf8").replace(
      /\s+/g,
      " ",
    );
    expect(md).toContain("Dispatched workers DO NOT `git push`");
    expect(md).toContain("the merge gate lands it");
  });
});
