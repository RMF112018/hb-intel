/**
 * P3-E15-T10 Stage 6 Project QC Module deviations-evidence TypeScript contracts.
 */

import type { QcEvidenceType } from '../record-families/enums.js';
import type { DeviationState } from '../foundation/enums.js';
import type {
  ApprovalProvenanceEvent,
  ConflictResolutionPath,
  DeviationConditionType,
  DeviationReadinessEffect,
  EvidenceMinimumUseCase,
  EvidenceSufficiencyStatus,
  ExternalApprovalResolutionType,
} from './enums.js';

/** Deviation condition per T06 §3. */
export interface IDeviationCondition {
  readonly conditionId: string;
  readonly deviationId: string;
  readonly conditionType: DeviationConditionType;
  readonly description: string;
  readonly enforcementCriteria: string;
  readonly isSatisfied: boolean;
  readonly satisfiedAt: string | null;
  readonly linkedRecordRefs: readonly string[];
}

/** Evidence minimum rule per T06 §5. */
export interface IEvidenceMinimumRule {
  readonly ruleId: string;
  readonly useCase: EvidenceMinimumUseCase;
  readonly governedMinimumDescription: string;
  readonly requiredEvidenceTypes: readonly QcEvidenceType[];
  readonly minimumCount: number;
  readonly sufficiencyRequiresReviewerAcceptance: boolean;
  readonly isGovernedFloor: boolean;
  readonly projectCanTighten: boolean;
}

/** Evidence sufficiency check per T06 §5. */
export interface IEvidenceSufficiencyCheck {
  readonly checkId: string;
  readonly targetRecordId: string;
  readonly useCase: EvidenceMinimumUseCase;
  readonly ruleId: string;
  readonly linkedEvidenceRefs: readonly string[];
  readonly status: EvidenceSufficiencyStatus;
  readonly checkedAt: string;
  readonly checkedByUserId: string | null;
}

/** Official source conflict per T06 §7. */
export interface IOfficialSourceConflict {
  readonly conflictId: string;
  readonly projectId: string;
  readonly affectedRecordId: string;
  readonly previousSourceRef: string;
  readonly newerSourceRef: string;
  readonly conflictDetectedAt: string;
  readonly resolutionPath: ConflictResolutionPath | null;
  readonly resolvedAt: string | null;
  readonly resolvedByUserId: string | null;
  readonly recheckDueDate: string | null;
  readonly deviationRefIfException: string | null;
}

/** Approval provenance entry per T06 §6.4. */
export interface IApprovalProvenanceEntry {
  readonly entryId: string;
  readonly externalApprovalDependencyId: string;
  readonly event: ApprovalProvenanceEvent;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly proofSourceRef: string | null;
  readonly affectedQcRecordRefs: readonly string[];
  readonly notes: string;
}

/** Deviation readiness mapping per T06 §3/§8. */
export interface IDeviationReadinessMapping {
  readonly mappingId: string;
  readonly deviationId: string;
  readonly affectedRecordId: string;
  readonly deviationState: DeviationState;
  readonly readinessEffect: DeviationReadinessEffect;
  readonly conditionsSatisfied: boolean;
}

/** External approval resolution per T06 §9. */
export interface IExternalApprovalResolution {
  readonly resolutionId: string;
  readonly externalApprovalDependencyId: string;
  readonly resolutionType: ExternalApprovalResolutionType;
  readonly responderIdentity: string;
  readonly proofRef: string | null;
  readonly resolvedAt: string;
  readonly justification: string | null;
  readonly readinessRecordsReleased: readonly string[];
}
