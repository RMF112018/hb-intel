/**
 * Qualification and risk metadata contracts for readiness evaluation.
 *
 * @design D-SF18-T02
 */
import type { RiskLevel, ConfidenceLevel, SeverityLevel } from '../constants/index.js';

export interface IQualificationMetadata {
  readonly isQualified: boolean;
  readonly qualificationSource: string;
  readonly qualifiedBy?: string;
  readonly qualifiedAt?: string;
}

export interface IRiskMetadata {
  readonly riskLevel: RiskLevel;
  readonly confidence: ConfidenceLevel;
  readonly severity: SeverityLevel;
  readonly rationale?: string;
  readonly flaggedBy?: string;
  readonly flaggedAt?: string;
}
