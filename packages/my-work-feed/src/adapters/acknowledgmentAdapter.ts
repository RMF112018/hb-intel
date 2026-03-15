/**
 * Acknowledgment source adapter — disabled stub.
 *
 * `@hbc/acknowledgment` provides only per-record state lookup (`fetchAcknowledgmentState`),
 * not a "list all pending" API. Acknowledgment state surfaces through BIC/handoff item
 * enrichment rather than as standalone feed items.
 *
 * Registered with `isEnabled: () => false` to satisfy the `MyWorkSource` union
 * while avoiding an undiscoverable query pattern.
 */

import type { IMyWorkSourceAdapter } from '../types/index.js';

export const acknowledgmentAdapter: IMyWorkSourceAdapter = {
  source: 'acknowledgment',
  isEnabled: () => false,
  load: async () => [],
};
