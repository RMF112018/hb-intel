/**
 * Completeness metadata contracts for package and criterion-level readiness.
 *
 * @design D-SF18-T02
 */

export interface ICompletenessMetadata {
  readonly requiredCount: number;
  readonly completedCount: number;
  readonly missingCount: number;
  readonly completionPercent: number;
}
