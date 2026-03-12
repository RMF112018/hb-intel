/**
 * Scoring dimension utility contracts for readiness composition and UI breakdowns.
 *
 * @design D-SF18-T02
 */

/** Key union for score dimensions in the Estimating readiness model. */
export type ScoringDimensionKey =
  | 'scope-completeness'
  | 'compliance'
  | 'coverage'
  | 'commercial'
  | 'governance';

/** Per-dimension score projection used in category and summary payloads. */
export interface IScoringDimensionScore {
  readonly dimension: ScoringDimensionKey;
  readonly weight: number;
  readonly score: number;
  readonly maxScore: number;
}
