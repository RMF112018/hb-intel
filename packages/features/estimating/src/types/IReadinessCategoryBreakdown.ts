/**
 * Category-level readiness breakdown used by dashboards and checklist grouping.
 *
 * @design D-SF18-T02
 */
import type { ScoringDimensionKey } from './IScoringDimension.js';

export interface IReadinessCategoryBreakdown {
  readonly categoryId: string;
  readonly label: string;
  readonly dimension: ScoringDimensionKey;
  readonly score: number;
  readonly maxScore: number;
  readonly completionPercent: number;
  readonly blockerCount: number;
}
