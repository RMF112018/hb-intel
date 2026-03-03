/**
 * Buyout lifecycle status for a cost code / trade.
 */
export enum BuyoutStatus {
  /** Buyout has not yet started for this trade. */
  Pending = 'Pending',
  /** Buyout is actively being negotiated. */
  InProgress = 'InProgress',
  /** Subcontract has been committed / executed. */
  Committed = 'Committed',
  /** Buyout is fully complete (all paperwork finalized). */
  Complete = 'Complete',
}
