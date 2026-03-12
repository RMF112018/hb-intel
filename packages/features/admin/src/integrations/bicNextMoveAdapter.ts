/**
 * BIC Next-Move integration adapter.
 *
 * Defines the contract for querying blocked workflows from the
 * BIC Next-Move package without importing it directly.
 *
 * @design D-07, SF17-T07
 */

/** Context describing a BIC blocking condition. */
export interface IBicBlockingContext {
  readonly workflowId: string;
  readonly reason: string;
  readonly blockedSince: string;
}

/** Adapter interface for BIC Next-Move workflow queries. */
export interface IBicNextMoveAdapter {
  /** Return workflows currently blocked by BIC conditions. */
  getBlockedWorkflows(): Promise<readonly IBicBlockingContext[]>;
}

/**
 * Reference (stub) implementation of IBicNextMoveAdapter.
 * Returns empty data — consuming packages provide real implementations.
 */
export class ReferenceBicNextMoveAdapter implements IBicNextMoveAdapter {
  async getBlockedWorkflows(): Promise<readonly IBicBlockingContext[]> {
    return [];
  }
}
