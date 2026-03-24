/**
 * P3-E14-T10 Stage 2 Project Warranty Module record-families constants.
 * Record family definitions, authority matrix, enum arrays, labels.
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
import type {
  IWarrantyAuthorityMatrixEntry,
  IWarrantyRecordFamilyDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const WARRANTY_COVERAGE_LAYERS = ['Product', 'Labor', 'System'] as const satisfies ReadonlyArray<WarrantyCoverageLayer>;
export const WARRANTY_COVERAGE_STATUSES = ['Draft', 'Active', 'Expired', 'Voided'] as const satisfies ReadonlyArray<WarrantyCoverageStatus>;
export const WARRANTY_COVERAGE_SOURCE_ENUMS = ['CloseoutTurnover', 'StartupTurnover', 'Manual'] as const satisfies ReadonlyArray<WarrantyCoverageSourceEnum>;
export const WARRANTY_CASE_STATUSES = [
  'Open', 'PendingCoverageDecision', 'NotCovered', 'Denied', 'Duplicate',
  'Assigned', 'AwaitingSubcontractor', 'AwaitingOwner',
  'Scheduled', 'InProgress', 'Corrected', 'PendingVerification',
  'Verified', 'Closed', 'Reopened', 'Voided',
] as const satisfies ReadonlyArray<WarrantyCaseStatus>;
export const WARRANTY_SLA_STATUSES = ['WithinSla', 'Approaching', 'Overdue', 'NotApplicable'] as const satisfies ReadonlyArray<WarrantySlaStatus>;
export const WARRANTY_ACKNOWLEDGMENT_STATUSES = ['Pending', 'Acknowledged', 'ScopeAccepted', 'ScopeDisputed'] as const satisfies ReadonlyArray<WarrantyAcknowledgmentStatus>;
export const SUBCONTRACTOR_SCOPE_POSITIONS = ['Accepted', 'Disputed', 'PartialAccepted'] as const satisfies ReadonlyArray<SubcontractorScopePosition>;
export const DISPUTE_OUTCOMES = ['UpheldSubcontractorNotResponsible', 'RejectedSubcontractorRemains', 'Reassigned', 'EscalatedToPX'] as const satisfies ReadonlyArray<DisputeOutcome>;
export const COVERAGE_DECISION_OUTCOMES = ['Covered', 'NotCovered', 'Denied'] as const satisfies ReadonlyArray<CoverageDecisionOutcome>;
export const COVERAGE_DECISION_STATUSES = ['Active', 'Superseded'] as const satisfies ReadonlyArray<CoverageDecisionStatus>;
export const WARRANTY_ASSIGNMENT_TYPES = ['Subcontractor', 'Manufacturer', 'GC', 'Internal'] as const satisfies ReadonlyArray<WarrantyAssignmentType>;
export const WARRANTY_ASSIGNMENT_STATUSES = ['Active', 'Superseded', 'Released'] as const satisfies ReadonlyArray<WarrantyAssignmentStatus>;
export const WARRANTY_VISIT_TYPES = ['Diagnosis', 'Repair', 'Verification', 'Reinspection'] as const satisfies ReadonlyArray<WarrantyVisitType>;
export const WARRANTY_VISIT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'NoShow'] as const satisfies ReadonlyArray<WarrantyVisitStatus>;
export const WARRANTY_EVIDENCE_TYPES = ['Photo', 'Video', 'InspectionNote', 'Document', 'LinkedArtifact'] as const satisfies ReadonlyArray<WarrantyEvidenceType>;
export const RESOLUTION_OUTCOMES = ['Corrected', 'CorrectedUnderProtest', 'PmAccepted', 'BackCharged', 'Unresolved'] as const satisfies ReadonlyArray<ResolutionOutcome>;
export const OWNER_REPORT_CHANNELS = ['Phone', 'Email', 'SiteVisit', 'Written'] as const satisfies ReadonlyArray<OwnerReportChannel>;
export const OWNER_INTAKE_STATUSES = ['Logged', 'Linked', 'Unresolvable'] as const satisfies ReadonlyArray<OwnerIntakeStatus>;
export const WARRANTY_CASE_SOURCE_CHANNELS = ['PmEntered', 'OwnerPortal'] as const satisfies ReadonlyArray<WarrantyCaseSourceChannel>;
export const ACKNOWLEDGMENT_ENTERED_BYS = ['PmOnBehalf', 'DirectSubcontractor'] as const satisfies ReadonlyArray<AcknowledgmentEnteredBy>;
export const WARRANTY_ISSUE_TYPES = ['Defect', 'Damage', 'Incomplete', 'Failure', 'Other'] as const satisfies ReadonlyArray<WarrantyIssueType>;
export const WARRANTY_AUTHORITY_ROLES = ['PM', 'PX', 'WARRANTY_MANAGER', 'APM_PA', 'PER', 'FINANCIAL_READER', 'EXT_SUBCONTRACTOR', 'EXT_OWNER'] as const satisfies ReadonlyArray<WarrantyAuthorityRole>;
export const WARRANTY_RECORD_FAMILIES = [
  'WarrantyCoverageItem', 'WarrantyCase', 'WarrantyCoverageDecision',
  'WarrantyCaseAssignment', 'WarrantyVisit', 'WarrantyCaseEvidence',
  'SubcontractorAcknowledgment', 'OwnerIntakeLog',
  'WarrantyCaseResolutionRecord', 'WarrantyCoverageExpiration',
] as const satisfies ReadonlyArray<WarrantyRecordFamily>;

// -- Terminal Case Statuses ---------------------------------------------------

export const WARRANTY_TERMINAL_CASE_STATUSES = [
  'NotCovered', 'Denied', 'Duplicate', 'Closed', 'Voided',
] as const satisfies ReadonlyArray<WarrantyCaseStatus>;

// -- Record Family Definitions (T02 §1) ----------------------------------------

export const WARRANTY_RECORD_FAMILY_DEFINITIONS: ReadonlyArray<IWarrantyRecordFamilyDef> = [
  { family: 'WarrantyCoverageItem', role: 'Coverage inventory', terminalStates: ['Expired', 'Voided'] },
  { family: 'WarrantyCase', role: 'First-class case — atomic unit of warranty issue management', terminalStates: ['Closed', 'NotCovered', 'Denied', 'Duplicate', 'Voided'] },
  { family: 'WarrantyCoverageDecision', role: 'Formal coverage scope determination', terminalStates: ['Covered', 'NotCovered', 'Denied'] },
  { family: 'WarrantyCaseAssignment', role: 'Responsibility routing per case', terminalStates: ['Superseded', 'Released'] },
  { family: 'WarrantyVisit', role: 'Scheduled or completed site visit', terminalStates: ['Completed', 'Cancelled'] },
  { family: 'WarrantyCaseEvidence', role: 'Evidence attachments', terminalStates: ['Archived'] },
  { family: 'SubcontractorAcknowledgment', role: 'Formal subcontractor response to assignment', terminalStates: ['ScopeAccepted', 'ScopeDisputed'] },
  { family: 'OwnerIntakeLog', role: 'PM-entered record of owner-reported issue', terminalStates: ['Linked', 'Unresolvable'] },
  { family: 'WarrantyCaseResolutionRecord', role: 'Immutable closure record', terminalStates: [] },
  { family: 'WarrantyCoverageExpiration', role: 'System-generated expiration record', terminalStates: [] },
];

// -- Authority Matrix (T02 §6.2) -----------------------------------------------

export const WARRANTY_WRITE_AUTHORITY_MATRIX: ReadonlyArray<IWarrantyAuthorityMatrixEntry> = [
  { action: 'REGISTER_COVERAGE_ITEM', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: '' },
  { action: 'PROMOTE_COVERAGE_ACTIVE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'Requires metadata complete' },
  { action: 'VOID_COVERAGE_ITEM', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'Requires rationale' },
  { action: 'CREATE_CASE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'APM_PA', 'PX'], notes: '' },
  { action: 'MAKE_COVERAGE_DECISION', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'PM or WARRANTY_MANAGER only' },
  { action: 'ASSIGN_CASE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: '' },
  { action: 'REASSIGN_CASE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: '' },
  { action: 'ENTER_ACKNOWLEDGMENT', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'PM on behalf of sub in Phase 3' },
  { action: 'SCHEDULE_VISIT', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'APM_PA', 'PX'], notes: '' },
  { action: 'ADD_EVIDENCE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'APM_PA', 'PX'], notes: '' },
  { action: 'DECLARE_CORRECTED', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'PM enters on sub behalf' },
  { action: 'PERFORM_VERIFICATION', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'Verification gate is PM/WARRANTY_MANAGER' },
  { action: 'CREATE_RESOLUTION_RECORD', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'Immutable on creation' },
  { action: 'FLAG_BACK_CHARGE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: '' },
  { action: 'VOID_CASE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'PX'], notes: 'Requires rationale' },
  { action: 'REOPEN_CLOSED_CASE', allowedRoles: ['PX'], notes: 'PX only; requires reason' },
  { action: 'ENTER_OWNER_INTAKE', allowedRoles: ['PM', 'WARRANTY_MANAGER', 'APM_PA', 'PX'], notes: '' },
  { action: 'EXTEND_SLA_DEADLINE', allowedRoles: ['PX'], notes: 'PX only; requires reason' },
];

// -- Locked Authority Decisions (T02 §6.4) ------------------------------------

export const WARRANTY_LOCKED_AUTHORITY_DECISIONS = [
  'Coverage decisions require PM or WARRANTY_MANAGER authority; APM/PA may not make coverage determinations',
  'Re-opening a Closed case requires PX authority; PMs may not re-open closed cases unilaterally',
  'WarrantyCaseResolutionRecord is immutable after creation; correction requires void + new case',
  'SLA deadline extension requires PX authority and a documented reason',
  'WarrantyCoverageDecision revisions are always additive (supersede, not mutate)',
] as const;

// -- Label Maps (selected key enums) ------------------------------------------

export const WARRANTY_CASE_STATUS_LABELS: Readonly<Record<WarrantyCaseStatus, string>> = {
  Open: 'Open', PendingCoverageDecision: 'Pending Coverage Decision',
  NotCovered: 'Not Covered', Denied: 'Denied', Duplicate: 'Duplicate',
  Assigned: 'Assigned', AwaitingSubcontractor: 'Awaiting Subcontractor',
  AwaitingOwner: 'Awaiting Owner', Scheduled: 'Scheduled',
  InProgress: 'In Progress', Corrected: 'Corrected',
  PendingVerification: 'Pending Verification', Verified: 'Verified',
  Closed: 'Closed', Reopened: 'Reopened', Voided: 'Voided',
};

export const WARRANTY_COVERAGE_LAYER_LABELS: Readonly<Record<WarrantyCoverageLayer, string>> = {
  Product: 'Product (manufacturer)', Labor: 'Labor (workmanship)', System: 'System (integrated)',
};

export const RESOLUTION_OUTCOME_LABELS: Readonly<Record<ResolutionOutcome, string>> = {
  Corrected: 'Corrected', CorrectedUnderProtest: 'Corrected Under Protest',
  PmAccepted: 'PM Accepted', BackCharged: 'Back-Charged', Unresolved: 'Unresolved',
};
