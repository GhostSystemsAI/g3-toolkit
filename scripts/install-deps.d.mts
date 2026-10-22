// Types for tests/unit/install-deps.test.ts; the implementation is plain
// Node ESM so it runs before any dependency (tsx included) is installed.
export type NodeModulesState = "missing" | "symlink" | "foreign" | "installed";
export function foreignWorkspaceLinks(root: string): string[];
export function nodeModulesState(root: string): NodeModulesState;
export function planInstall(input: {
  state: NodeModulesState;
  writable: boolean;
}):
  | { action: "none" }
  | { action: "install"; unlinkSymlink: boolean; overlay: boolean };
export function storeIsWritable(storeDir: string): boolean;
export function buildOverlayStore(
  storeDir: string,
  overlayRoot: string,
): string;
export function overlayRoot(env?: Record<string, string | undefined>): string;
