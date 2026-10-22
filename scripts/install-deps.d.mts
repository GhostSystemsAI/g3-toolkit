// Types for tests/unit/install-deps.test.ts; the implementation is plain
// Node ESM so it runs before any dependency (tsx included) is installed.
export type NodeModulesState = "missing" | "symlink" | "installed";
export function nodeModulesState(root: string): NodeModulesState;
export function storeWritable(storeVersionDir: string): boolean;
export function buildOverlayStore(
  storeVersionDir: string,
  overlayRoot: string,
): string;
export function overlayRootFor(env: Record<string, string | undefined>): string;
export function planInstall(input: {
  state: NodeModulesState;
  writable: boolean;
}):
  | { action: "none" }
  | { action: "install"; unlinkSymlink: boolean; overlay: boolean };
