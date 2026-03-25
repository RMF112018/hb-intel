/**
 * P3-E15-T10 Stage 4 Project QC Module plans-reviews TypeScript contracts.
 */

import type { ControlGateType, QcIssueSeverity } from '../record-families/enums.js';
import type { WorkPackagePlanState } from '../foundation/enums.js';
import type {
  AddendumType,
  ControlGateStatus,
  CoverageRuleType,
  FindingToIssueCondition,
  OverrideType,
  PlanActivationDepth,
  PlanReadinessLevel,
  ReviewPhaseType,
} from './enums.js';

export interface IControlGateRequirement {
  readonly controlGateRequirementId: string;
  readonly projectId: string;
  readonly workPackageQualityPlanId: string;
  readonly gateType: ControlGateType;
  readonly title: string;
  readonly workPackageRef: string;
  readonly prerequisites: readonly string[];
  readonly responsibleOrganization: string;
  readonly responsibleIndividual: string | null;
  readonly designatedVerifierRef: string | null;
  readonly evidenceMinimums: readonly string[];
  readonly acceptanceCriteriaSummary: string;
  readonly readinessEffectIfNotSatisfied: string;
  readonly relatedReviewPackageRefs: readonly string[];
  readonly relatedTestRefs: readonly string[];
  readonly status: ControlGateStatus;
  readonly gateReadyAt: string | null;
  readonly gateAcceptedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IPlanCoverageEntry {
  readonly coverageEntryId: string;
  readonly workPackageQualityPlanId: string;
  readonly coverageRuleType: CoverageRuleType;
  readonly governedSourceRef: string | null;
  readonly projectAdditionRef: string | null;
  readonly description: string;
  readonly provenance: string | null;
  readonly addedByUserId: string;
  readonly addedAt: string;
  readonly isRemovable: boolean;
}

export interface IPlanAddendum {
  readonly addendumId: string;
  readonly workPackageQualityPlanId: string;
  readonly addendumType: AddendumType;
  readonly governedParentRef: string;
  readonly projectRiskBasis: string;
  readonly description: string;
  readonly extraGateOrReviewRefs: readonly string[];
  readonly addedByUserId: string;
  readonly addedAt: string;
  readonly approvedByUserId: string | null;
}

export interface IPlanOverride {
  readonly overrideId: string;
  readonly workPackageQualityPlanId: string;
  readonly overrideType: OverrideType;
  readonly originalRequirementRef: string;
  readonly replacementDescription: string;
  readonly equivalenceJustification: string;
  readonly deviationRef: string | null;
  readonly addedByUserId: string;
  readonly addedAt: string;
  readonly approvedByUserId: string | null;
}

export interface IPlanReadinessPosture {
  readonly workPackageQualityPlanId: string;
  readonly projectId: string;
  readonly activationDepth: PlanActivationDepth;
  readonly readinessLevel: PlanReadinessLevel;
  readonly totalGateCount: number;
  readonly gatesReady: number;
  readonly gatesBlocked: number;
  readonly gatesEscalated: number;
  readonly openExceptionCount: number;
  readonly blockedSignals: readonly string[];
  readonly escalatedSignals: readonly string[];
}

export interface IFindingToIssueSpawnRecord {
  readonly spawnRecordId: string;
  readonly reviewFindingId: string;
  readonly spawnedQcIssueId: string;
  readonly spawnCondition: FindingToIssueCondition;
  readonly originReviewPackageId: string;
  readonly findingSeverity: QcIssueSeverity;
  readonly governedRequirementRefs: readonly string[];
  readonly originResponsiblePartyContext: string;
  readonly spawnedAt: string;
  readonly spawnedByUserId: string;
}

export interface IReviewPackagePhase {
  readonly phaseId: string;
  readonly reviewPackageId: string;
  readonly phaseType: ReviewPhaseType;
  readonly disciplineSet: readonly string[];
  readonly acceptanceCriteriaSummary: string;
  readonly status: string;
}
