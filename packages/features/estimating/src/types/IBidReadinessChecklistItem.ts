/**
 * SF18-T06 checklist item contract for estimator readiness workflow.
 *
 * @design D-SF18-T06
 */
import type { ScoringDimensionKey } from './IScoringDimension.js';

export interface IBidReadinessChecklistItem {
  readonly checklistItemId: string;
  readonly criterionId: string;
  readonly label: string;
  readonly category: ScoringDimensionKey;
  readonly weight: number;
  readonly isBlocker: boolean;
  readonly isComplete: boolean;
  readonly rationale: string;
  readonly scoringInfluence: number;
  readonly actionHref: string;
}
