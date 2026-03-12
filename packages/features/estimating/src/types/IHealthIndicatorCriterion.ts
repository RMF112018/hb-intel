/**
 * Canonical criterion contract used by the SF18 Estimating adapter.
 *
 * @design D-SF18-T02
 */
import type { IBicOwner } from './IBicOwner.js';
import type { IQualificationMetadata, IRiskMetadata } from './IReadinessRiskMetadata.js';
import type { ICompletenessMetadata } from './IReadinessCompletenessMetadata.js';

export interface IHealthIndicatorCriterion {
  readonly criterionId: string;
  readonly label: string;
  readonly weight: number;
  readonly isBlocker: boolean;
  readonly isComplete: boolean;
  readonly actionHref: string;
  readonly assignee: IBicOwner | null;
  readonly completeness: ICompletenessMetadata;
  readonly qualification?: IQualificationMetadata;
  readonly risk?: IRiskMetadata;
}
