/**
 * Hook-level readiness data lifecycle states.
 *
 * @design D-SF18-T04
 */
export type BidReadinessDataState =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'degraded';
