/**
 * P3-E14-T10 Stage 6 Project Warranty Module subcontractor-participation enumerations.
 * Assignment, acknowledgment, dispute, evidence, resolution, deferrals.
 */

// -- Subcontractor Entry Channel (T06 §1.2) -----------------------------------
export type SubcontractorEntryChannel = 'PmOnBehalf' | 'DirectSubcontractor';

// -- Acknowledgment Status (T06 §3.1) ----------------------------------------
export type SubAcknowledgmentStatus =
  | 'Pending' | 'Acknowledged' | 'ScopeAccepted' | 'ScopeDisputed' | 'DisputeResolved';

// -- Dispute Outcome (T06 §3.1) -----------------------------------------------
export type SubDisputeOutcome =
  | 'UpheldSubcontractorNotResponsible' | 'RejectedSubcontractorRemains'
  | 'Reassigned' | 'EscalatedToPX';

// -- Evidence Type T06 (T06 §5.1) — extended from T02 -------------------------
export type WarrantyEvidenceTypeT06 =
  | 'PhotoBefore' | 'PhotoAfter' | 'VideoDocumentation' | 'MaterialSpec'
  | 'SubcontractorReport' | 'InspectionReport' | 'ManufacturerResponse' | 'Other';

// -- Resolution Type T06 (T06 §6.2) ------------------------------------------
export type WarrantyResolutionTypeT06 = 'Corrected' | 'Credited' | 'Voided' | 'NotWarrantyScope';

// -- Sub Work Queue Event (T06 §8.3) ------------------------------------------
export type SubWorkQueueEventType =
  | 'CASE_ASSIGNED_TO_SUB' | 'ACKNOWLEDGMENT_SLA_REMINDER'
  | 'ACKNOWLEDGMENT_SLA_ESCALATION' | 'SCOPE_DISPUTED'
  | 'DISPUTE_UNRESOLVED_ESCALATION' | 'COMPLETION_DECLARED_VERIFICATION_PENDING'
  | 'VERIFICATION_FAILED' | 'BACK_CHARGE_ADVISORY_FLAGGED';

// -- External Collaboration Deferral (T06 §9) --------------------------------
export type ExternalCollaborationDeferral =
  | 'SUB_PORTAL_LOGIN' | 'DIRECT_CASE_NOTIFICATION'
  | 'DIRECT_ACKNOWLEDGMENT_ENTRY' | 'DIRECT_EVIDENCE_UPLOAD'
  | 'SUB_DUE_DATE_DASHBOARD' | 'MULTI_SUB_PORTFOLIO_VIEW'
  | 'DIGITAL_PUNCH_LIST_INTEGRATION';
