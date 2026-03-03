/**
 * Lifecycle status for an estimating effort.
 */
export enum EstimatingStatus {
  /** Estimate is being drafted. */
  Draft = 'Draft',
  /** Estimate is actively being worked on. */
  InProgress = 'InProgress',
  /** Estimate has been submitted to the client. */
  Submitted = 'Submitted',
  /** Bid was awarded. */
  Awarded = 'Awarded',
  /** Bid was lost. */
  Lost = 'Lost',
}
