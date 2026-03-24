/**
 * P3-E7-T02 Permits Record Architecture TypeScript contracts.
 * 7 first-class record families + supporting types.
 */

import type {
  CheckpointStatus,
  DeficiencyResolutionStatus,
  DeficiencySeverity,
  ExpirationRiskTier,
  InspectionVisitResult,
  IssuedPermitStatus,
  PartyType,
  PermitAccountableRole,
  PermitApplicationStatus,
  PermitEvidenceType,
  PermitHealthTier,
  PermitLifecycleActionType,
  PermitType,
  RequiredInspectionResult,
  SubmissionMethod,
} from './enums.js';
import type { PermitThreadRelationship } from '../foundation/enums.js';

// ── Supporting Types (§9) ───────────────────────────────────────────

export interface IJurisdictionContact {
  readonly contactName: string;
  readonly title: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly officeHours: string | null;
  readonly portalUrl: string | null;
}

export interface IInspectorContact {
  readonly phone: string | null;
  readonly email: string | null;
  readonly badgeNumber: string | null;
}

// ── PermitApplication (§2) ──────────────────────────────────────────

export interface IPermitApplication {
  readonly applicationId: string;
  readonly projectId: string;
  readonly permitType: PermitType;
  readonly jurisdictionName: string;
  readonly jurisdictionContact: IJurisdictionContact;
  readonly applicationDate: string;
  readonly submittedById: string;
  readonly submittedByName: string;
  readonly applicationStatus: PermitApplicationStatus;
  readonly submissionMethod: SubmissionMethod;
  readonly trackingNumber: string | null;
  readonly estimatedResponseDate: string | null;
  readonly applicationFeeAmount: number;
  readonly bondAmountRequired: number;
  readonly feesPaid: boolean;
  readonly jurisdictionResponseDate: string | null;
  readonly rejectionReason: string | null;
  readonly issuedPermitId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
}

// ── IssuedPermit (§3) ───────────────────────────────────────────────

export interface IIssuedPermit {
  // Identity
  readonly issuedPermitId: string;
  readonly projectId: string;
  readonly applicationId: string | null;
  readonly permitNumber: string;
  readonly permitType: PermitType;
  // Thread
  readonly threadRootPermitId: string | null;
  readonly parentPermitId: string | null;
  readonly threadRelationshipType: PermitThreadRelationship;
  // Jurisdiction
  readonly jurisdictionName: string;
  readonly jurisdictionContact: IJurisdictionContact;
  // Dates
  readonly applicationDate: string;
  readonly issuanceDate: string;
  readonly expirationDate: string;
  readonly renewalDate: string | null;
  readonly closedDate: string | null;
  // Status (read-only; mutated via PermitLifecycleAction)
  readonly currentStatus: IssuedPermitStatus;
  readonly currentStatusSetAt: string;
  readonly currentStatusSetByActionId: string;
  // Financials
  readonly permitFeeAmount: number;
  readonly bondAmount: number;
  // Description
  readonly description: string;
  readonly conditions: readonly string[];
  readonly tags: readonly string[];
  // Responsibility Envelope
  readonly accountableRole: PermitAccountableRole;
  readonly currentResponsiblePartyId: string;
  readonly currentResponsiblePartyType: PartyType;
  readonly nextActionOwnerId: string | null;
  readonly watcherPartyIds: readonly string[];
  readonly escalationOwnerId: string | null;
  readonly blockedByPartyId: string | null;
  // Derived (calculated)
  readonly daysToExpiration: number;
  readonly expirationRiskTier: ExpirationRiskTier;
  readonly derivedHealthTier: PermitHealthTier;
  // Provenance
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
}

// ── RequiredInspectionCheckpoint (§4) ────────────────────────────────

export interface IRequiredInspectionCheckpoint {
  readonly checkpointId: string;
  readonly projectId: string;
  readonly issuedPermitId: string;
  readonly templateCheckpointId: string | null;
  readonly checkpointName: string;
  readonly codeReference: string | null;
  readonly sequence: number;
  readonly status: CheckpointStatus;
  readonly dateCalledIn: string | null;
  readonly scheduledDate: string | null;
  readonly verifiedOnline: boolean;
  readonly currentResult: RequiredInspectionResult;
  readonly linkedInspectionVisitIds: readonly string[];
  readonly lastVisitId: string | null;
  readonly isBlockingCloseout: boolean;
  readonly blockedByCheckpointIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly importedFromTemplateAt: string | null;
}

// ── InspectionVisit (§5) ────────────────────────────────────────────

export interface IInspectionVisit {
  readonly visitId: string;
  readonly projectId: string;
  readonly issuedPermitId: string;
  readonly linkedCheckpointId: string | null;
  readonly inspectorName: string;
  readonly inspectorContact: IInspectorContact;
  readonly inspectorOrganization: string | null;
  readonly scheduledDate: string;
  readonly completedDate: string | null;
  readonly durationMinutes: number | null;
  readonly result: InspectionVisitResult;
  readonly followUpRequired: boolean;
  readonly followUpDueDate: string | null;
  readonly currentResponsiblePartyId: string;
  readonly currentResponsiblePartyType: PartyType;
  readonly nextActionOwnerId: string | null;
  readonly escalationOwnerId: string | null;
  readonly inspectorNotes: string;
  readonly internalNotes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
  readonly resultRecordedByUserId: string | null;
}

// ── InspectionDeficiency (§6) ───────────────────────────────────────

export interface IInspectionDeficiency {
  readonly deficiencyId: string;
  readonly projectId: string;
  readonly issuedPermitId: string;
  readonly visitId: string;
  readonly description: string;
  readonly severity: DeficiencySeverity;
  readonly codeReference: string | null;
  readonly correctiveActionRequired: string;
  readonly resolutionStatus: DeficiencyResolutionStatus;
  readonly assignedToPartyId: string | null;
  readonly assignedToPartyType: PartyType | null;
  readonly dueDate: string | null;
  readonly resolvedDate: string | null;
  readonly resolutionNotes: string | null;
  readonly resolvedByUserId: string | null;
  readonly requiresReinspection: boolean;
  readonly reinspectionVisitId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId: string;
}

// ── PermitLifecycleAction (§7) — Immutable ──────────────────────────

export interface IPermitLifecycleAction {
  readonly actionId: string;
  readonly projectId: string;
  readonly issuedPermitId: string;
  readonly actionType: PermitLifecycleActionType;
  readonly actionDate: string;
  readonly effectiveDate: string | null;
  readonly previousStatus: IssuedPermitStatus;
  readonly newStatus: IssuedPermitStatus;
  readonly performedByUserId: string;
  readonly performedByName: string;
  readonly performedByRole: string;
  readonly notes: string | null;
  readonly evidenceRecordIds: readonly string[];
  readonly jurisdictionReferenceNumber: string | null;
  readonly requiresAcknowledgment: boolean;
  readonly acknowledgedAt: string | null;
  readonly acknowledgedByUserId: string | null;
  readonly createdAt: string;
}

// ── PermitEvidenceRecord (§8) ───────────────────────────────────────

export interface IPermitEvidenceRecord {
  readonly evidenceId: string;
  readonly projectId: string;
  readonly issuedPermitId: string;
  readonly linkedVisitId: string | null;
  readonly linkedActionId: string | null;
  readonly evidenceType: PermitEvidenceType;
  readonly title: string;
  readonly description: string | null;
  readonly storageUri: string;
  readonly fileName: string;
  readonly fileSizeBytes: number | null;
  readonly mimeType: string | null;
  readonly uploadedAt: string;
  readonly uploadedByUserId: string;
  readonly uploadedByName: string;
}
