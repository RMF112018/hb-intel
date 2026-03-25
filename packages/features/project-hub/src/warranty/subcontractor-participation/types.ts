/**
 * P3-E14-T10 Stage 6 Project Warranty Module subcontractor-participation TypeScript contracts.
 * Assignment, acknowledgment lifecycle, dispute paths, evidence, resolution, work queue.
 */

import type {
  ExternalCollaborationDeferral,
  SubAcknowledgmentStatus,
  SubcontractorEntryChannel,
  SubDisputeOutcome,
  SubWorkQueueEventType,
  WarrantyEvidenceTypeT06,
  WarrantyResolutionTypeT06,
} from './enums.js';

// -- Assignment T06 (T06 §2.1) -----------------------------------------------
export interface IWarrantyCaseAssignmentT06 {
  readonly assignmentId: string;
  readonly caseId: string;
  readonly subcontractorId: string | null;
  readonly subcontractorName: string | null;
  readonly assignedByUserId: string;
  readonly assignedAt: string;
  readonly assignmentNotes: string | null;
  readonly supersededByAssignmentId: string | null;
  readonly enteredBy: SubcontractorEntryChannel;
}

// -- Acknowledgment T06 (T06 §3.1) -------------------------------------------
export interface ISubcontractorAcknowledgmentT06 {
  readonly acknowledgmentId: string;
  readonly caseId: string;
  readonly assignmentId: string;
  readonly subcontractorId: string;
  readonly status: SubAcknowledgmentStatus;
  readonly acknowledgedAt: string | null;
  readonly acknowledgedByUserId: string;
  readonly enteredBy: SubcontractorEntryChannel;
  readonly acknowledgmentNotes: string | null;
  readonly scopeDecisionAt: string | null;
  readonly disputeRationale: string | null;
  readonly pmDisputeResponse: string | null;
  readonly disputeOutcome: SubDisputeOutcome | null;
  readonly disputeResolvedAt: string | null;
  readonly disputeResolvedByUserId: string | null;
}

// -- Evidence T06 (T06 §5.1) -------------------------------------------------
export interface IWarrantyCaseEvidenceT06 {
  readonly evidenceId: string;
  readonly caseId: string;
  readonly visitId: string | null;
  readonly evidenceType: WarrantyEvidenceTypeT06;
  readonly fileRef: string | null;
  readonly description: string;
  readonly capturedAt: string;
  readonly submittedByUserId: string;
  readonly enteredBy: SubcontractorEntryChannel;
}

// -- Resolution Record T06 (T06 §6.2) — immutable ----------------------------
export interface IWarrantyCaseResolutionRecordT06 {
  readonly resolutionRecordId: string;
  readonly caseId: string;
  readonly resolvedAt: string;
  readonly resolvedByUserId: string;
  readonly resolutionType: WarrantyResolutionTypeT06;
  readonly resolutionDescription: string;
  readonly verificationNotes: string | null;
  readonly isBackChargeAdvisory: boolean;
  readonly backChargeAdvisoryNotes: string | null;
  readonly subcontractorPerformanceNote: string | null;
  readonly ownerSignOffRef: string | null;
}

// -- Acknowledgment Transition (T06 §3.2) ------------------------------------
export interface IAcknowledgmentTransition {
  readonly from: SubAcknowledgmentStatus | null;
  readonly to: SubAcknowledgmentStatus;
  readonly actor: string;
  readonly guard: string;
}

// -- Dispute Resolution Path (T06 §4.2) --------------------------------------
export interface IDisputeResolutionPathDef {
  readonly outcome: SubDisputeOutcome;
  readonly caseEffect: string;
  readonly nextAction: string;
}

// -- Acknowledgment SLA (T06 §3.3) -------------------------------------------
export interface IAcknowledgmentSlaDef {
  readonly tier: string;
  readonly reminderThresholdBD: number;
  readonly escalationThresholdBD: number;
}

// -- Sub Work Queue Event (T06 §8.3) -----------------------------------------
export interface ISubWorkQueueEventDef {
  readonly eventType: SubWorkQueueEventType;
  readonly workQueueItem: string;
  readonly assignee: string;
}

// -- External Collaboration Deferral (T06 §9) --------------------------------
export interface IExternalCollaborationDeferralDef {
  readonly capability: ExternalCollaborationDeferral;
  readonly reasonDeferred: string;
  readonly layer2Requirement: string;
}
