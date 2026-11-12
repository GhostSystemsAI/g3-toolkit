import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";

// Fence for heal 98f9a6d9 (gotcha findby-timeout-preempted-by-vitest-
// test-timeout): Demo.test.tsx gave findBy a 15 s budget inside a test
// that ran under vitest's 5 s default, so the test timeout killed the
// wait first and the declared budget was dead. cd89cde fixed that file
// by hand; nothing stopped the same shape elsewhere. This walks every
// test file the default config collects and requires each literal
// waitFor/findBy timeout to sit strictly below the budget of the test or
// hook that awaits it (the render before the wait spends from the same
// budget, so equal is dead too).
const root = resolve(__dirname, "../..");
// vitest defaults; vitest.config.ts sets neither.
const DEFAULT_TEST_MS = 5_000;
const DEFAULT_HOOK_MS = 10_000;
const TESTS = new Set(["it", "test"]);
const HOOKS = new Set(["beforeAll", "beforeEach", "afterAll", "afterEach"]);
const WAIT = /^(waitFor|find(All)?By\w+)$/;

type Finding = { file: string; line: number; wait: number; budget: number };

function rootName(e: ts.Expression): string | undefined {
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return rootName(e.expression);
  if (ts.isCallExpression(e)) return rootName(e.expression);
  return undefined;
}

function calleeName(e: ts.Expression): string | undefined {
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return undefined;
}

export function scanWaitBudgets(file: string, src: string): Finding[] {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const consts = new Map<string, ts.Expression>();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.initializer)
        consts.set(d.name.text, d.initializer);
    }
  }
  const num = (e: ts.Expression | undefined): number | undefined => {
    if (!e) return undefined;
    if (ts.isNumericLiteral(e)) return Number(e.text.replace(/_/g, ""));
    if (ts.isParenthesizedExpression(e)) return num(e.expression);
    if (ts.isIdentifier(e)) return num(consts.get(e.text));
    if (ts.isBinaryExpression(e)) {
      const [l, r] = [num(e.left), num(e.right)];
      if (l === undefined || r === undefined) return undefined;
      if (e.operatorToken.kind === ts.SyntaxKind.PlusToken) return l + r;
      if (e.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return l * r;
    }
    return undefined;
  };
  const timeoutOf = (e: ts.Expression): number | undefined => {
    if (!ts.isObjectLiteralExpression(e)) return undefined;
    for (const p of e.properties) {
      if (
        ts.isPropertyAssignment(p) &&
        ts.isIdentifier(p.name) &&
        p.name.text === "timeout"
      )
        return num(p.initializer);
    }
    return undefined;
  };
  // Budget of the test/hook call whose callback is `fn`.
  const budgetOf = (fn: ts.Node): number | undefined => {
    const call = fn.parent;
    if (!call || !ts.isCallExpression(call)) return undefined;
    const name = rootName(call.expression);
    const isTest = name !== undefined && TESTS.has(name);
    const isHook = name !== undefined && HOOKS.has(name);
    if (!isTest && !isHook) return undefined;
    for (const a of call.arguments) {
      if (a === fn) continue;
      const t = timeoutOf(a);
      if (t !== undefined) return t;
    }
    const after =
      call.arguments[call.arguments.indexOf(fn as ts.Expression) + 1];
    return num(after) ?? (isTest ? DEFAULT_TEST_MS : DEFAULT_HOOK_MS);
  };
  const out: Finding[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n)) {
      const name = calleeName(n.expression);
      const last = n.arguments.at(-1);
      const wait =
        name && WAIT.test(name) && last ? timeoutOf(last) : undefined;
      if (wait !== undefined) {
        let p: ts.Node | undefined = n.parent;
        let budget: number | undefined;
        while (p && budget === undefined) {
          if (ts.isArrowFunction(p) || ts.isFunctionExpression(p))
            budget = budgetOf(p);
          p = p.parent;
        }
        if (budget !== undefined && wait >= budget) {
          const line = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
          out.push({ file, line, wait, budget });
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

describe("waitFor/findBy budgets fit inside their test timeout", () => {
  const files = execFileSync(
    "git",
    [
      "ls-files",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "packages/*/src/**/*.test.ts",
      "packages/*/src/**/*.test.tsx",
      "examples/*/src/**/*.test.ts",
      "examples/*/src/**/*.test.tsx",
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.test.tsx",
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);

  it("finds the test corpus", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it("no test declares a wait budget its own timeout pre-empts", () => {
    const dead = files.flatMap((f) =>
      scanWaitBudgets(f, readFileSync(resolve(root, f), "utf8")),
    );
    expect(
      dead.map((d) => `${d.file}:${d.line} wait ${d.wait} >= ${d.budget}`),
    ).toEqual([]);
  });

  it("flags the original Demo.test.tsx shape and accepts its fix", () => {
    const bad = `const MS = 15_000;
it("x", async () => { await screen.findByText("a", {}, { timeout: MS }); });`;
    expect(scanWaitBudgets("bad.tsx", bad)).toHaveLength(1);
    const good = `const MS = 15_000;
it("x", async () => { await screen.findByText("a", {}, { timeout: MS }); }, MS + 5_000);`;
    expect(scanWaitBudgets("good.tsx", good)).toEqual([]);
    const hook = `beforeAll(async () => { await waitFor(() => 1, { timeout: 15_000 }); }, 30_000);
it("y", { timeout: 20_000 }, async () => { await waitFor(() => 1, { timeout: 10_000 }); });`;
    expect(scanWaitBudgets("hook.tsx", hook)).toEqual([]);
    const equal = `it("z", async () => { await waitFor(() => 1, { timeout: 5000 }); });`;
    expect(scanWaitBudgets("equal.tsx", equal)).toHaveLength(1);
  });
});
