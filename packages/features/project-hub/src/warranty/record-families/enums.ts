/**
 * P3-E14-T10 Stage 2 Project Warranty Module record-families enumerations.
 * 10 record families, 23 enum types, identity model, authority model.
 */

// -- WarrantyCoverageLayer (T02 §5) -------------------------------------------
export type WarrantyCoverageLayer = 'Product' | 'Labor' | 'System';

// -- WarrantyCoverageStatus (T02 §5) ------------------------------------------
export type WarrantyCoverageStatus = 'Draft' | 'Active' | 'Expired' | 'Voided';

// -- WarrantyCoverageSourceEnum (T02 §5) — renamed to avoid collision with T01
export type WarrantyCoverageSourceEnum = 'CloseoutTurnover' | 'StartupTurnover' | 'Manual';

// -- WarrantyCaseStatus (T02 §5) — 16 states per T04 --------------------------
export type WarrantyCaseStatus =
  | 'Open' | 'PendingCoverageDecision' | 'NotCovered' | 'Denied' | 'Duplicate'
  | 'Assigned' | 'AwaitingSubcontractor' | 'AwaitingOwner'
  | 'Scheduled' | 'InProgress' | 'Corrected' | 'PendingVerification'
  | 'Verified' | 'Closed' | 'Reopened' | 'Voided';

// -- WarrantySlaStatus (T02 §5) -----------------------------------------------
export type WarrantySlaStatus = 'WithinSla' | 'Approaching' | 'Overdue' | 'NotApplicable';

// -- AcknowledgmentStatus (T02 §5) --------------------------------------------
export type WarrantyAcknowledgmentStatus = 'Pending' | 'Acknowledged' | 'ScopeAccepted' | 'ScopeDisputed';

// -- SubcontractorScopePosition (T02 §5) --------------------------------------
export type SubcontractorScopePosition = 'Accepted' | 'Disputed' | 'PartialAccepted';

// -- DisputeOutcome (T02 §5) --------------------------------------------------
export type DisputeOutcome =
  | 'UpheldSubcontractorNotResponsible' | 'RejectedSubcontractorRemains'
  | 'Reassigned' | 'EscalatedToPX';

// -- CoverageDecisionOutcome (T02 §5) -----------------------------------------
export type CoverageDecisionOutcome = 'Covered' | 'NotCovered' | 'Denied';

// -- CoverageDecisionStatus (T02 §5) ------------------------------------------
export type CoverageDecisionStatus = 'Active' | 'Superseded';

// -- AssignmentType (T02 §5) --------------------------------------------------
export type WarrantyAssignmentType = 'Subcontractor' | 'Manufacturer' | 'GC' | 'Internal';

// -- AssignmentStatus (T02 §5) ------------------------------------------------
export type WarrantyAssignmentStatus = 'Active' | 'Superseded' | 'Released';

// -- WarrantyVisitType (T02 §5) -----------------------------------------------
export type WarrantyVisitType = 'Diagnosis' | 'Repair' | 'Verification' | 'Reinspection';

// -- WarrantyVisitStatus (T02 §5) ---------------------------------------------
export type WarrantyVisitStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

// -- WarrantyEvidenceType (T02 §5) --------------------------------------------
export type WarrantyEvidenceType = 'Photo' | 'Video' | 'InspectionNote' | 'Document' | 'LinkedArtifact';

// -- ResolutionOutcome (T02 §5) -----------------------------------------------
export type ResolutionOutcome =
  | 'Corrected' | 'CorrectedUnderProtest' | 'PmAccepted' | 'BackCharged' | 'Unresolved';

// -- OwnerReportChannel (T02 §5) ----------------------------------------------
export type OwnerReportChannel = 'Phone' | 'Email' | 'SiteVisit' | 'Written';

// -- OwnerIntakeStatus (T02 §5) -----------------------------------------------
export type OwnerIntakeStatus = 'Logged' | 'Linked' | 'Unresolvable';

// -- WarrantyCaseSourceChannel (T02 §5) ---------------------------------------
export type WarrantyCaseSourceChannel = 'PmEntered' | 'OwnerPortal';

// -- AcknowledgmentEnteredBy (T02 §5) -----------------------------------------
export type AcknowledgmentEnteredBy = 'PmOnBehalf' | 'DirectSubcontractor';

// -- WarrantyIssueType (T02 §5) -----------------------------------------------
export type WarrantyIssueType = 'Defect' | 'Damage' | 'Incomplete' | 'Failure' | 'Other';

// -- WarrantyAuthorityRole (T02 §6.1) -----------------------------------------
export type WarrantyAuthorityRole =
  | 'PM' | 'PX' | 'WARRANTY_MANAGER' | 'APM_PA'
  | 'PER' | 'FINANCIAL_READER' | 'EXT_SUBCONTRACTOR' | 'EXT_OWNER';

// -- WarrantyWriteAction (T02 §6.2) -------------------------------------------
export type WarrantyWriteAction =
  | 'REGISTER_COVERAGE_ITEM' | 'PROMOTE_COVERAGE_ACTIVE' | 'VOID_COVERAGE_ITEM'
  | 'CREATE_CASE' | 'MAKE_COVERAGE_DECISION' | 'ASSIGN_CASE' | 'REASSIGN_CASE'
  | 'ENTER_ACKNOWLEDGMENT' | 'SCHEDULE_VISIT' | 'ADD_EVIDENCE'
  | 'DECLARE_CORRECTED' | 'PERFORM_VERIFICATION' | 'CREATE_RESOLUTION_RECORD'
  | 'FLAG_BACK_CHARGE' | 'VOID_CASE' | 'REOPEN_CLOSED_CASE'
  | 'ENTER_OWNER_INTAKE' | 'EXTEND_SLA_DEADLINE';

// -- WarrantyRecordFamily (T02 §1) --------------------------------------------
export type WarrantyRecordFamily =
  | 'WarrantyCoverageItem' | 'WarrantyCase' | 'WarrantyCoverageDecision'
  | 'WarrantyCaseAssignment' | 'WarrantyVisit' | 'WarrantyCaseEvidence'
  | 'SubcontractorAcknowledgment' | 'OwnerIntakeLog'
  | 'WarrantyCaseResolutionRecord' | 'WarrantyCoverageExpiration';
