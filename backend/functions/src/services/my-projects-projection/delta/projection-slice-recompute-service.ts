/**
 * My Projects projection — slice-recompute service contract.
 *
 * Prompt 06 ships the INTERFACE + a `NoopProjectionSliceRecomputeService`
 * stub so the sync worker can be exercised end-to-end. Prompt 07 will land
 * the real implementation (slice recompute, registry upsert, soft-deactivate)
 * against the same contract; only the import in the Function entry needs to
 * swap.
 */

import type { SourceListKind } from '../projection-types.js';

export interface IRecomputeCounts {
  readonly helperRowsInserted: number;
  readonly helperRowsUpdated: number;
  readonly helperRowsReactivated: number;
  readonly helperRowsDeactivated: number;
  readonly helperRowsPurged: number;
}

export type ProjectionSliceRecomputeFailureCode = 'recompute-failed' | 'projection-write-failed';

export type IRecomputeOutcome =
  | { readonly ok: true; readonly counts: IRecomputeCounts }
  | {
      readonly ok: false;
      readonly failureCode: ProjectionSliceRecomputeFailureCode;
      readonly sanitizedReason: string;
      readonly partialCounts?: IRecomputeCounts;
    };

export interface IRecomputeRequest {
  readonly sourceListKind: SourceListKind;
  readonly changedItemIds: readonly string[];
  readonly deletedItemIds: readonly string[];
  readonly projectionBatchId: string;
  readonly correlationId: string;
}

export interface IProjectionSliceRecomputeService {
  recompute(request: IRecomputeRequest): Promise<IRecomputeOutcome>;
}

const ZERO_COUNTS: IRecomputeCounts = Object.freeze({
  helperRowsInserted: 0,
  helperRowsUpdated: 0,
  helperRowsReactivated: 0,
  helperRowsDeactivated: 0,
  helperRowsPurged: 0,
});

/**
 * Prompt-06 default: always succeeds with zero-count writes. Lets the queue
 * worker run end-to-end without Prompt-07's projection engine. The Function
 * entry swaps this for the real implementation when Prompt 07 lands.
 */
export class NoopProjectionSliceRecomputeService implements IProjectionSliceRecomputeService {
  async recompute(_request: IRecomputeRequest): Promise<IRecomputeOutcome> {
    return { ok: true, counts: ZERO_COUNTS };
  }
}
