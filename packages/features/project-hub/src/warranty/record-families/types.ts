/**
 * P3-E14-T10 Stage 2 Project Warranty Module record-families TypeScript contracts.
 * 10 record family interfaces, authority matrix, identity model.
 */

import type {
  AcknowledgmentEnteredBy,
  CoverageDecisionOutcome,
  CoverageDecisionStatus,
  DisputeOutcome,
  OwnerIntakeStatus,
  OwnerReportChannel,
  ResolutionOutcome,
  SubcontractorScopePosition,
  WarrantyAcknowledgmentStatus,
  WarrantyAssignmentStatus,
  WarrantyAssignmentType,
  WarrantyAuthorityRole,
  WarrantyCaseSourceChannel,
  WarrantyCaseStatus,
  WarrantyCoverageLayer,
  WarrantyCoverageSourceEnum,
  WarrantyCoverageStatus,
  WarrantyEvidenceType,
  WarrantyIssueType,
  WarrantyRecordFamily,
  WarrantySlaStatus,
  WarrantyVisitStatus,
  WarrantyVisitType,
  WarrantyWriteAction,
} from './enums.js';

// -- IWarrantyCoverageItem (T02 §4.1) ----------------------------------------

export interface IWarrantyCoverageItem {
  readonly coverageItemId: string;
  readonly projectId: string;
  readonly coverageLayer: WarrantyCoverageLayer;
  readonly coverageScope: string;
  readonly responsiblePartyId: string;
  readonly responsiblePartyName: string;
  readonly warrantyStartDate: string;
  readonly warrantyEndDate: string;
  readonly expirationAdvisoryThresholdDays: number;
  readonly locationRef: string | null;
  readonly systemRef: string | null;
  readonly assetRef: string | null;
  readonly closeoutTurnoverRef: string | null;
  readonly startupCommissioningRef: string | null;
  readonly status: WarrantyCoverageStatus;
  readonly sourceHandoff: WarrantyCoverageSourceEnum;
  readonly isMetadataComplete: boolean;
  readonly registeredAt: string;
  readonly registeredByUserId: string;
  readonly voidedAt: string | null;
  readonly voidedByUserId: string | null;
  readonly voidRationale: string | null;
}

// -- IWarrantyCase (T02 §4.2) ------------------------------------------------

export interface IWarrantyCase {
  readonly caseId: string;
  readonly projectId: string;
  readonly caseNumber: string;
  readonly coverageItemId: string;
  readonly title: string;
  readonly description: string;
  readonly location: string;
  readonly reportedIssueType: WarrantyIssueType;
  readonly status: WarrantyCaseStatus;
  readonly openedAt: string;
  readonly openedByUserId: string;
  readonly lastStatusTransitionAt: string;
  readonly lastStatusTransitionByUserId: string;
  readonly activeAssignmentId: string | null;
  readonly activeDecisionId: string | null;
  readonly isUrgent: boolean;
  readonly slaResponseDeadline: string | null;
  readonly slaRepairDeadline: string | null;
  readonly slaVerificationDeadline: string | null;
  readonly slaStatus: WarrantySlaStatus;
  readonly isBackChargeAdvisory: boolean;
  readonly backChargeAdvisoryPublishedAt: string | null;
  readonly resolutionRecordId: string | null;
  readonly ownerIntakeLogId: string | null;
  readonly sourceChannel: WarrantyCaseSourceChannel;
  readonly externalReferenceId: string | null;
}

// -- IWarrantyCoverageDecision (T02 §4.3) ------------------------------------

export interface IWarrantyCoverageDecision {
  readonly decisionId: string;
  readonly caseId: string;
  readonly decision: CoverageDecisionOutcome;
  readonly rationale: string;
  readonly decisionMadeAt: string;
  readonly decisionMadeByUserId: string;
  readonly status: CoverageDecisionStatus;
  readonly supersededByDecisionId: string | null;
  readonly revisionNote: string | null;
}

// -- IWarrantyCaseAssignment (T02 §4.4) ---------------------------------------

export interface IWarrantyCaseAssignment {
  readonly assignmentId: string;
  readonly caseId: string;
  readonly assignmentSequence: number;
  readonly responsiblePartyId: string;
  readonly responsiblePartyName: string;
  readonly assignmentType: WarrantyAssignmentType;
  readonly assignedAt: string;
  readonly assignedByUserId: string;
  readonly slaResponseDeadline: string;
  readonly slaRepairDeadline: string;
  readonly status: WarrantyAssignmentStatus;
  readonly supersededAt: string | null;
  readonly supersededReason: string | null;
}

// -- IWarrantyVisit (T02 §4.5) -----------------------------------------------

export interface IWarrantyVisit {
  readonly visitId: string;
  readonly caseId: string;
  readonly visitType: WarrantyVisitType;
  readonly scheduledDate: string;
  readonly scheduledAt: string;
  readonly scheduledByUserId: string;
  readonly status: WarrantyVisitStatus;
  readonly completedAt: string | null;
  readonly completedByUserId: string | null;
  readonly visitNotes: string | null;
  readonly evidenceIds: readonly string[];
  readonly cancellationReason: string | null;
}

// -- IWarrantyCaseEvidence (T02 §4.6) -----------------------------------------

export interface IWarrantyCaseEvidence {
  readonly evidenceId: string;
  readonly caseId: string;
  readonly visitId: string | null;
  readonly evidenceType: WarrantyEvidenceType;
  readonly capturedAt: string;
  readonly capturedByUserId: string;
  readonly description: string | null;
  readonly storageHandle: string | null;
}

// -- ISubcontractorAcknowledgment (T02 §4.7) ----------------------------------

export interface IWarrantySubcontractorAcknowledgment {
  readonly acknowledgmentId: string;
  readonly assignmentId: string;
  readonly caseId: string;
  readonly status: WarrantyAcknowledgmentStatus;
  readonly acknowledgedAt: string | null;
  readonly scopePosition: SubcontractorScopePosition | null;
  readonly disputeRationale: string | null;
  readonly pmDisputeResponse: string | null;
  readonly disputeOutcome: DisputeOutcome | null;
  readonly enteredBy: AcknowledgmentEnteredBy;
  readonly enteredByUserId: string;
  readonly enteredAt: string;
}

// -- IOwnerIntakeLog (T02 §4.8) -----------------------------------------------

export interface IWarrantyOwnerIntakeLog {
  readonly intakeLogId: string;
  readonly projectId: string;
  readonly reportedByOwner: string;
  readonly reportedAt: string;
  readonly issueDescription: string;
  readonly location: string | null;
  readonly reportChannel: OwnerReportChannel;
  readonly linkedCaseIds: readonly string[];
  readonly status: OwnerIntakeStatus;
  readonly unresolvableReason: string | null;
  readonly loggedByUserId: string;
  readonly loggedAt: string;
  readonly sourceChannel: WarrantyCaseSourceChannel;
}

// -- IWarrantyCaseResolutionRecord (T02 §4.9) — IMMUTABLE --------------------

export interface IWarrantyCaseResolutionRecord {
  readonly resolutionRecordId: string;
  readonly caseId: string;
  readonly outcome: ResolutionOutcome;
  readonly resolvedAt: string;
  readonly resolvedByUserId: string;
  readonly resolutionDescription: string;
  readonly isBackChargeAdvisory: boolean;
  readonly backChargeAdvisoryNotes: string | null;
  readonly subcontractorPerformanceNote: string | null;
  readonly evidenceIds: readonly string[];
}

// -- IWarrantyCoverageExpiration (T02 §1) — system-generated, immutable ------

export interface IWarrantyCoverageExpiration {
  readonly expirationId: string;
  readonly coverageItemId: string;
  readonly expiredAt: string;
  readonly openCaseCountAtExpiration: number;
}

// -- Supporting Types ---------------------------------------------------------

export interface IWarrantyRecordFamilyDef {
  readonly family: WarrantyRecordFamily;
  readonly role: string;
  readonly terminalStates: readonly string[];
}

export interface IWarrantyAuthorityMatrixEntry {
  readonly action: WarrantyWriteAction;
  readonly allowedRoles: readonly WarrantyAuthorityRole[];
  readonly notes: string;
}
