/**
 * P3-E7-T01 Permits Module foundation constants.
 */

import type {
  ComplianceHealthSignalType,
  DerivedHealthTier,
  PermitAuthorityAction,
  PermitAuthorityRole,
  PermitRecordType,
  PermitThreadRelationship,
} from './enums.js';
import type {
  IComplianceHealthSignal,
  ILockedDecision,
  IPermitAuthorityRule,
  IPermitCrossContractRef,
  IPermitImmutableFieldDeclaration,
  IPermitSharedPackageRequirement,
} from './types.js';

// ── Module Scope ────────────────────────────────────────────────────

export const PERMITS_MODULE_SCOPE = 'permits' as const;
export const PERMITS_FOUNDATION_SCOPE = 'permits/foundation' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const PERMIT_THREAD_RELATIONSHIPS = [
  'THREAD_ROOT', 'SUBPERMIT', 'PHASED_RELEASE', 'REVISION',
  'TEMPORARY_APPROVAL', 'CLOSEOUT_PATH', 'STANDALONE',
] as const satisfies ReadonlyArray<PermitThreadRelationship>;

export const DERIVED_HEALTH_TIERS = [
  'CRITICAL', 'AT_RISK', 'NORMAL', 'CLOSED',
] as const satisfies ReadonlyArray<DerivedHealthTier>;

export const PERMIT_AUTHORITY_ROLES = [
  'ProjectManager', 'SiteSupervisor', 'Executive', 'System',
] as const satisfies ReadonlyArray<PermitAuthorityRole>;

export const PERMIT_RECORD_TYPES = [
  'PermitApplication', 'IssuedPermit', 'RequiredInspectionCheckpoint',
  'InspectionVisit', 'InspectionDeficiency', 'PermitLifecycleAction', 'PermitEvidenceRecord',
] as const satisfies ReadonlyArray<PermitRecordType>;

export const PERMIT_AUTHORITY_ACTIONS = [
  'Create', 'Read', 'Update', 'Assign', 'Annotate',
] as const satisfies ReadonlyArray<PermitAuthorityAction>;

export const COMPLIANCE_HEALTH_SIGNAL_TYPES = [
  'ExpirationProximity', 'OpenHighSeverityDeficiency', 'FailedInspectionWithoutPass',
  'TerminalNegativeStatus', 'ActiveStopWorkOrViolation',
] as const satisfies ReadonlyArray<ComplianceHealthSignalType>;

// ── Authority Matrix (§7.1) ─────────────────────────────────────────

export const PERMIT_AUTHORITY_MATRIX: ReadonlyArray<IPermitAuthorityRule> = [
  { role: 'ProjectManager', recordType: 'PermitApplication', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'ProjectManager', recordType: 'IssuedPermit', allowedActions: ['Read', 'Update'] },
  { role: 'ProjectManager', recordType: 'InspectionVisit', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'ProjectManager', recordType: 'InspectionDeficiency', allowedActions: ['Read', 'Assign', 'Update'] },
  { role: 'ProjectManager', recordType: 'PermitEvidenceRecord', allowedActions: ['Create', 'Read'] },
  { role: 'ProjectManager', recordType: 'RequiredInspectionCheckpoint', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordType: 'PermitLifecycleAction', allowedActions: ['Read'] },
  { role: 'SiteSupervisor', recordType: 'IssuedPermit', allowedActions: ['Read'] },
  { role: 'SiteSupervisor', recordType: 'InspectionVisit', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SiteSupervisor', recordType: 'InspectionDeficiency', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SiteSupervisor', recordType: 'PermitEvidenceRecord', allowedActions: ['Create', 'Read'] },
  { role: 'Executive', recordType: 'PermitApplication', allowedActions: ['Read'] },
  { role: 'Executive', recordType: 'IssuedPermit', allowedActions: ['Read', 'Annotate'] },
  { role: 'Executive', recordType: 'InspectionVisit', allowedActions: ['Read', 'Annotate'] },
  { role: 'Executive', recordType: 'InspectionDeficiency', allowedActions: ['Read'] },
  { role: 'Executive', recordType: 'PermitEvidenceRecord', allowedActions: ['Read'] },
];

// ── Immutable Fields (§7.2) ─────────────────────────────────────────

export const PERMIT_IMMUTABLE_FIELD_DECLARATIONS: ReadonlyArray<IPermitImmutableFieldDeclaration> = [
  {
    recordType: 'IssuedPermit',
    fieldNames: ['issuedPermitId', 'projectId', 'permitNumber', 'permitType', 'applicationDate', 'issuanceDate'],
  },
];

// ── Compliance Health Signals (§8) ──────────────────────────────────

export const COMPLIANCE_HEALTH_SIGNALS: ReadonlyArray<IComplianceHealthSignal> = [
  { signalType: 'ExpirationProximity', description: 'Expiration date approaching or passed', contributesToTier: 'CRITICAL' },
  { signalType: 'OpenHighSeverityDeficiency', description: 'Open deficiency with severity = HIGH and resolution not complete', contributesToTier: 'CRITICAL' },
  { signalType: 'FailedInspectionWithoutPass', description: 'Required inspection checkpoint with FAIL result and no subsequent PASS', contributesToTier: 'AT_RISK' },
  { signalType: 'TerminalNegativeStatus', description: 'Permit in REJECTED, REVOKED, or EXPIRED without renewal', contributesToTier: 'CRITICAL' },
  { signalType: 'ActiveStopWorkOrViolation', description: 'Active lifecycle action of type STOP_WORK or VIOLATION_ISSUED', contributesToTier: 'CRITICAL' },
];

// ── Shared Package Requirements (§6) ────────────────────────────────

export const PERMIT_SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<IPermitSharedPackageRequirement> = [
  { packageName: '@hbc/related-items', role: 'Links IssuedPermit to schedule milestones, constraints, financial lines' },
  { packageName: '@hbc/workflow-handoff', role: 'Cross-party handoffs (GC to jurisdiction, inspector to PM)' },
  { packageName: '@hbc/acknowledgment', role: 'Named party acknowledgment for lifecycle actions' },
  { packageName: '@hbc/field-annotations', role: 'PER annotation layer on IssuedPermit and InspectionVisit' },
  { packageName: '@hbc/versioned-record', role: 'Audit trail on IssuedPermit; immutable lifecycle record' },
  { packageName: '@hbc/bic-next-move', role: 'Next-action prompt for permit owner on work queue items' },
];

// ── Cross-Contract References (§5) ──────────────────────────────────

export const PERMIT_CROSS_CONTRACT_REFS: ReadonlyArray<IPermitCrossContractRef> = [
  { contract: 'P3-E1', section: '§3.4', relationship: 'Permits boundary and authority model' },
  { contract: 'P3-E2', section: '§6', relationship: 'What Permits owns as source of truth' },
  { contract: 'P3-D1', section: 'Activity Spine', relationship: 'Permits publishes lifecycle and inspection events' },
  { contract: 'P3-D2', section: 'Health Spine', relationship: 'Permits publishes permit health and compliance metrics' },
  { contract: 'P3-D3', section: '§13', relationship: 'Permits publishes work queue items' },
  { contract: 'P3-D4', section: 'Related Items', relationship: 'Permits links to schedule, constraints, financial lines' },
  { contract: 'P3-G1', section: '§4.4', relationship: 'Permits lane capabilities' },
  { contract: 'P3-G2', section: 'All', relationship: 'Per-lane interaction detail' },
  { contract: 'P3-G3', section: 'Cross-Lane', relationship: 'Permits cross-references with schedule and financial lanes' },
  { contract: 'P3-H1', section: '§6.4', relationship: 'Permits acceptance criteria' },
];

// ── Locked Decisions (Master Index) ─────────────────────────────────

export const PERMIT_MODULE_LOCKED_DECISIONS: ReadonlyArray<ILockedDecision> = [
  { decisionId: 1, description: 'PermitApplication is a first-class record (pre-issuance lifecycle)' },
  { decisionId: 2, description: 'IssuedPermit is a first-class record separate from application' },
  { decisionId: 3, description: 'RequiredInspectionCheckpoint is governed by a template library (not free-text)' },
  { decisionId: 4, description: 'InspectionVisit is a first-class record (replaces nested IInspection[])' },
  { decisionId: 5, description: 'InspectionDeficiency is a first-class record (replaces nested IInspectionIssue[])' },
  { decisionId: 6, description: 'PermitLifecycleAction is a first-class record replacing status-enum-mutation' },
  { decisionId: 7, description: 'PermitEvidenceRecord is a first-class record for documents, photos, and certificates' },
  { decisionId: 8, description: 'Responsibility envelopes on IssuedPermit, InspectionVisit, and InspectionDeficiency' },
  { decisionId: 9, description: 'No manual complianceScore field exists anywhere in the model' },
  { decisionId: 10, description: 'Compliance health derived from record truth: deficiencies, expiration, blocking inspections' },
  { decisionId: 11, description: 'Thread model connects master permits, subpermits, phased releases, revisions, temp approvals, closeout' },
  { decisionId: 12, description: 'Governed template library drives RequiredInspectionCheckpoint creation per permit type' },
  { decisionId: 13, description: 'Work Queue items published across full permit lifecycle (not just expiration)' },
  { decisionId: 14, description: 'PER annotation scope covers IssuedPermit and InspectionVisit via @hbc/field-annotations' },
  { decisionId: 15, description: '@hbc/versioned-record provides audit trail; @hbc/workflow-handoff manages handoffs' },
];

// ── Label Maps ──────────────────────────────────────────────────────

export const PERMIT_THREAD_RELATIONSHIP_LABELS: Readonly<Record<PermitThreadRelationship, string>> = {
  THREAD_ROOT: 'Primary permit (thread root)',
  SUBPERMIT: 'Jurisdiction-issued subpermit under master',
  PHASED_RELEASE: 'Phased release tied to master permit',
  REVISION: 'Revision or amendment to parent permit',
  TEMPORARY_APPROVAL: 'Temporary certificate of occupancy or interim approval',
  CLOSEOUT_PATH: 'Closeout or final inspection permit branch',
  STANDALONE: 'Fully independent permit with no thread relationships',
};

export const DERIVED_HEALTH_TIER_LABELS: Readonly<Record<DerivedHealthTier, string>> = {
  CRITICAL: 'Critical — immediate action required',
  AT_RISK: 'At risk — attention needed',
  NORMAL: 'Normal — compliant',
  CLOSED: 'Closed — permit closed or archived',
};

export const PERMIT_RECORD_TYPE_LABELS: Readonly<Record<PermitRecordType, string>> = {
  PermitApplication: 'Permit Application',
  IssuedPermit: 'Issued Permit',
  RequiredInspectionCheckpoint: 'Required Inspection Checkpoint',
  InspectionVisit: 'Inspection Visit',
  InspectionDeficiency: 'Inspection Deficiency',
  PermitLifecycleAction: 'Permit Lifecycle Action',
  PermitEvidenceRecord: 'Permit Evidence Record',
};
