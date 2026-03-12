/**
 * Estimator/package readiness criterion contracts for checklist item evaluation.
 *
 * @design D-SF18-T02
 */
import type { ICompletenessMetadata } from './IReadinessCompletenessMetadata.js';
import type { IQualificationMetadata, IRiskMetadata } from './IReadinessRiskMetadata.js';

export interface IEstimatingPackageReadinessCriteria {
  readonly packageId: string;
  readonly packageLabel: string;
  readonly criteriaIds: readonly string[];
  readonly completeness: ICompletenessMetadata;
  readonly qualification: IQualificationMetadata;
  readonly risk: IRiskMetadata;
}
