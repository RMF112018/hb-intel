/**
 * @see D-SF02-T06 — Minimal typed stub for SF02-T04 (Hooks) compilation.
 * Full implementation with deduplication and notification-intelligence wiring
 * will be provided by SF02-T06 (Transfer Detection).
 */

import type { IBicOwner } from '../types/IBicNextMove';

export interface RecordBicTransferParams {
  itemKey: string;
  fromOwner: IBicOwner | null;
  toOwner: IBicOwner | null;
  action: string;
}

/**
 * Records a BIC ownership transfer event.
 * Stub — no-op until SF02-T06 populates with deduplication + notification wiring.
 */
export function recordBicTransfer(_params: RecordBicTransferParams): void {
  // T06 will implement: deduplication guard (D-03) + notification-intelligence event
}
