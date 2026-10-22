// Types for the bundle-ledger runner, consumed by the unit fence.
export interface Ledger {
  name: string;
  script: string;
}
export const LEDGERS: Ledger[];
export function runLedgers(
  ledgers: Ledger[],
  run: (ledger: Ledger) => number,
): Ledger[];
