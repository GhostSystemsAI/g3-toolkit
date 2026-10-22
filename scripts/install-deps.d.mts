export function storeIsWritable(storeDir: string): boolean;
export function buildOverlayStore(
  storeDir: string,
  overlayRoot: string,
): string;
export function overlayRoot(env?: Record<string, string | undefined>): string;
