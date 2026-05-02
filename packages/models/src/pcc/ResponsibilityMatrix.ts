/**
 * PCC Responsibility Matrix — shared model contracts.
 *
 * Phase 3 / Wave 11 / Prompt 02. No runtime behavior, no I/O, no clients,
 * no mutation. The module exposes vocabulary tuples (`as const`),
 * deterministic interface declarations, and a discriminated-union health
 * score. SPFx UI, backend routes, and provider implementations are
 * downstream prompt scope (Prompts 03/04/05).
 *
 * Authority:
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Responsibility_Matrix_Target_Architecture.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Responsibility_Matrix_Scope_Lock.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Resolved_Decisions_Register.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Workbook_Source_Mapping.md
 *
 * Locked decisions:
 *   - The user-facing module title is "Responsibility Matrix"; subtitle is
 *     "RACI + Owner-Contract Responsibility Control Center". The
 *     read-model key registered in `PccReadModelResponseMap` is
 *     `responsibility-matrix`.
 *   - Workbook-derived task-row context is `109` (`82` PM task-text rows +
 *     `27` Field rows with assignment marks). Strict marked assignment rows
 *     total `98`. Owner-contract active default obligations are `0`.
 *   - RACI value `'Consulted'` and contract-party value `'Contractor'` are
 *     stored on separate axes. The two vocabularies share no overlapping
 *     literal.
 *   - Only explicit workbook marks (`R/A/C/I`) map directly to RACI values.
 *     Non-explicit marks (`X/Support/Review/Sign-Off/None`) remain
 *     `'Unknown'` and require human review.
 *   - Active operational items represent a single accountable owner unless
 *     a governed `sharedAccountabilityException` is set.
 *
 * Guardrails:
 *   - No legal advice. No automatic legal-obligation creation. No
 *     replacement of executed contracts. Snapshots are governed records,
 *     not contract amendments.
 *   - No external runtime (Microsoft Graph, SharePoint REST, PnP, Procore,
 *     Sage, AHJ portals, Document Crunch, Adobe Sign).
 *   - No backend write routes, no approval execution (Wave 14 owns
 *     approvals/checkpoints), no Team & Access mutation, no evidence
 *     upload/download/sync/storage. Evidence is reference-only.
 *
 * @module pcc/ResponsibilityMatrix
 */

import type { PccReadModelSourceStatus } from './PccReadModels.js';
import type { ProjectReadinessConfidenceState } from './ProjectReadinessFramework.js';
import type { PccProjectId } from './types.js';

// ---------------------------------------------------------------------------
// RACI internal axis. Five values; `'Unknown'` is the unresolved marker
// retained for non-explicit source marks pending human review.
// ---------------------------------------------------------------------------

export const RESPONSIBILITY_RACI_VALUES = [
  'Responsible',
  'Accountable',
  'Consulted',
  'Informed',
  'Unknown',
] as const;
export type ResponsibilityRaciValue = (typeof RESPONSIBILITY_RACI_VALUES)[number];

// ---------------------------------------------------------------------------
// Contract-party axis. Distinct from RACI: `'Contractor'` here is the
// contract party, never RACI `'Consulted'`.
// ---------------------------------------------------------------------------

export const RESPONSIBILITY_CONTRACT_PARTIES = [
  'Owner',
  'ArchitectEngineer',
  'Contractor',
] as const;
export type ResponsibilityContractParty = (typeof RESPONSIBILITY_CONTRACT_PARTIES)[number];

// ---------------------------------------------------------------------------
// Workbook source-mark vocabulary. Explicit `R/A/C/I` map directly to
// RACI; the remaining marks remain unresolved.
// ---------------------------------------------------------------------------

export const RESPONSIBILITY_SOURCE_MARKS = [
  'R',
  'A',
  'C',
  'I',
  'X',
  'Support',
  'Review',
  'Sign-Off',
  'None',
] as const;
export type ResponsibilitySourceMark = (typeof RESPONSIBILITY_SOURCE_MARKS)[number];

export const RESPONSIBILITY_WORKBOOK_TYPES = [
  'general-responsibility-matrix',
  'owner-contract-responsibility-matrix',
] as const;
export type ResponsibilityWorkbookType = (typeof RESPONSIBILITY_WORKBOOK_TYPES)[number];

export const RESPONSIBILITY_SOURCE_SHEETS = ['PM', 'Field', 'Template'] as const;
export type ResponsibilitySourceSheet = (typeof RESPONSIBILITY_SOURCE_SHEETS)[number];

// ---------------------------------------------------------------------------
// Template lifecycle and item classifications. Owner-contract placeholder
// rows use `'placeholder-schema-only'` and are excluded from active default
// obligations until governed activation.
// ---------------------------------------------------------------------------

export const RESPONSIBILITY_TEMPLATE_STATUSES = ['draft', 'approved', 'retired'] as const;
export type ResponsibilityTemplateStatus = (typeof RESPONSIBILITY_TEMPLATE_STATUSES)[number];

export const RESPONSIBILITY_ITEM_CLASSIFICATIONS = [
  'active-default-item',
  'ambiguous-review-required',
  'placeholder-schema-only',
  'active-default-obligation',
] as const;
export type ResponsibilityItemClassification = (typeof RESPONSIBILITY_ITEM_CLASSIFICATIONS)[number];

export const RESPONSIBILITY_CRITICALITIES = ['low', 'medium', 'high', 'critical'] as const;
export type ResponsibilityCriticality = (typeof RESPONSIBILITY_CRITICALITIES)[number];

export const RESPONSIBILITY_DOMAINS = [
  'contracts-commercial',
  'schedule-planning',
  'cost-accounting',
  'field-operations',
  'quality',
  'safety',
  'permitting',
  'closeout',
] as const;
export type ResponsibilityDomain = (typeof RESPONSIBILITY_DOMAINS)[number];

export const RESPONSIBILITY_ASSIGNMENT_LIFECYCLE_STATES = [
  'created',
  'reassigned',
  'handoff-pending',
  'handoff-accepted',
  'unassigned',
  'closed',
] as const;
export type ResponsibilityAssignmentLifecycleState =
  (typeof RESPONSIBILITY_ASSIGNMENT_LIFECYCLE_STATES)[number];

export const RESPONSIBILITY_WORKFLOW_STEP_TYPES = [
  'review',
  'approval',
  'decision',
  'sign-off',
] as const;
export type ResponsibilityWorkflowStepType = (typeof RESPONSIBILITY_WORKFLOW_STEP_TYPES)[number];

export const RESPONSIBILITY_WORKFLOW_STEP_STATES = [
  'pending',
  'in-progress',
  'responded',
  'completed',
  'skipped',
] as const;
export type ResponsibilityWorkflowStepState = (typeof RESPONSIBILITY_WORKFLOW_STEP_STATES)[number];

export const RESPONSIBILITY_EXCEPTION_CODES = [
  'MISSING_ACCOUNTABLE_OWNER',
  'MISSING_CURRENT_ACTION_OWNER',
  'OVERDUE_ACTION',
  'CONFLICTING_ASSIGNMENTS',
  'UNRESOLVED_CONTRACT_PARTY_MAPPING',
  'MISSING_REQUIRED_EVIDENCE_REFERENCE',
  'ROLE_VACANT',
  'PERSON_INACTIVE',
  'HANDOFF_REQUIRED',
  'OWNER_CONTRACT_AMBIGUITY',
] as const;
export type ResponsibilityExceptionCode = (typeof RESPONSIBILITY_EXCEPTION_CODES)[number];

export const RESPONSIBILITY_HEALTH_BANDS = ['healthy', 'at-risk', 'blocked'] as const;
export type ResponsibilityHealthBand = (typeof RESPONSIBILITY_HEALTH_BANDS)[number];

export const RESPONSIBILITY_AUDIT_EVENT_TYPES = [
  'template-changed',
  'assignment-changed',
  'handoff-changed',
  'current-owner-changed',
  'exception-changed',
  'evidence-ref-changed',
  'snapshot-generated',
] as const;
export type ResponsibilityAuditEventType = (typeof RESPONSIBILITY_AUDIT_EVENT_TYPES)[number];

export const RESPONSIBILITY_EVIDENCE_LINK_STATES = ['present', 'expected', 'missing'] as const;
export type ResponsibilityEvidenceLinkState = (typeof RESPONSIBILITY_EVIDENCE_LINK_STATES)[number];

// ---------------------------------------------------------------------------
// Eight-lane UI architecture from Wave 11 §21. Lane vocabulary lives with
// the model so SPFx and tests share a single source of truth.
// ---------------------------------------------------------------------------

export const RESPONSIBILITY_MATRIX_LANES = [
  'overview',
  'matrix',
  'register',
  'owner-contract-mapping',
  'my-responsibilities',
  'gaps-and-conflicts',
  'handoffs',
  'template-and-admin',
] as const;
export type ResponsibilityMatrixLane = (typeof RESPONSIBILITY_MATRIX_LANES)[number];

// ---------------------------------------------------------------------------
// Reference shapes. Roles and persons resolve through Team & Access; this
// module consumes them as references and never mutates roster state.
// ---------------------------------------------------------------------------

export interface IResponsibilityRoleRef {
  readonly roleCode: string;
  readonly label: string;
  readonly required: boolean;
}

export interface IResponsibilityPersonRef {
  readonly personId: string;
  readonly displayName: string;
  readonly isActive: boolean;
}

// ---------------------------------------------------------------------------
// Workbook source traceability. Every template item carries the source
// reference; non-explicit marks set `requiresUserReview: true`.
// ---------------------------------------------------------------------------

export interface IResponsibilityWorkbookSourceRef {
  readonly workbookType: ResponsibilityWorkbookType;
  readonly sourceFile: string;
  readonly sourceSheet: ResponsibilitySourceSheet;
  readonly sourceRow: number;
  readonly sourceSection?: string;
  readonly sourceTask?: string;
  readonly sourceMarks: readonly ResponsibilitySourceMark[];
  readonly requiresUserReview: boolean;
  readonly mappingNotes?: string;
}

export interface IResponsibilityNormalizedAssignment {
  readonly roleRef: IResponsibilityRoleRef;
  readonly raciValue: ResponsibilityRaciValue;
  readonly sourceMark: ResponsibilitySourceMark;
  readonly requiresUserReview: boolean;
}

// ---------------------------------------------------------------------------
// Contract-party mapping (Axis A). Stored separately from RACI (Axis B) so
// `'Contractor'` and `'Consulted'` are never collapsed.
// ---------------------------------------------------------------------------

export interface IResponsibilityContractPartyMapping {
  readonly contractParty: ResponsibilityContractParty;
  readonly mappingNotes?: string;
  readonly requiresUserReview: boolean;
}

// ---------------------------------------------------------------------------
// Contract clause / obligation reference. Pure metadata. This module does
// not perform legal interpretation; downstream legal review is required
// before activating any obligation row.
// ---------------------------------------------------------------------------

export interface IResponsibilityContractObligationRef {
  readonly contractDocumentRef: string;
  readonly articleSection?: string;
  readonly page?: number;
  readonly obligationSummary: string;
  readonly trigger?: string;
  readonly evidenceReferenceExpectation?: string;
}

// ---------------------------------------------------------------------------
// Decision-rights overlay (RAPID-aligned). For decision-heavy items, this
// supplements the RACI assignment with explicit recommend / agree / decide
// / perform / input roles.
// ---------------------------------------------------------------------------

export interface IResponsibilityDecisionRights {
  readonly recommender?: IResponsibilityRoleRef;
  readonly agree?: readonly IResponsibilityRoleRef[];
  readonly decider: IResponsibilityRoleRef;
  readonly performer?: IResponsibilityRoleRef;
  readonly inputs?: readonly IResponsibilityRoleRef[];
}

// ---------------------------------------------------------------------------
// Assignment layer. Active operational items represent a single
// accountable owner unless `sharedAccountabilityException` is set.
// `currentActionOwner` may differ from `accountableOwner` (ball-in-court).
// ---------------------------------------------------------------------------

export interface IResponsibilitySharedAccountabilityException {
  readonly reason: string;
  readonly approvedBy?: IResponsibilityPersonRef;
}

export interface IResponsibilityAssignment {
  readonly ownerRole?: IResponsibilityRoleRef;
  readonly supportRoles: readonly IResponsibilityRoleRef[];
  readonly reviewerRoles: readonly IResponsibilityRoleRef[];
  readonly signOffRoles: readonly IResponsibilityRoleRef[];
  readonly accountableOwner?: IResponsibilityPersonRef;
  readonly currentActionOwner?: IResponsibilityPersonRef;
  readonly dueDateUtc?: string;
  readonly isOverdue: boolean;
  readonly lifecycleState: ResponsibilityAssignmentLifecycleState;
  readonly sharedAccountabilityException?: IResponsibilitySharedAccountabilityException;
}

// ---------------------------------------------------------------------------
// Workflow step model. Stepwise routing is supported for review / approval
// / decision / sign-off items; runtime execution is downstream.
// ---------------------------------------------------------------------------

export interface IResponsibilityWorkflowStepStatusEntry {
  readonly state: ResponsibilityWorkflowStepState;
  readonly transitionedAtUtc: string;
  readonly actor?: IResponsibilityPersonRef;
}

export interface IResponsibilityWorkflowStep {
  readonly stepId: string;
  readonly stepType: ResponsibilityWorkflowStepType;
  readonly requiredReviewers: readonly IResponsibilityRoleRef[];
  readonly optionalReviewers: readonly IResponsibilityRoleRef[];
  readonly pendingActionOwner?: IResponsibilityPersonRef;
  readonly statusHistory: readonly IResponsibilityWorkflowStepStatusEntry[];
}

// ---------------------------------------------------------------------------
// Handoffs and exceptions.
// ---------------------------------------------------------------------------

export interface IResponsibilityHandoff {
  readonly handoffId: string;
  readonly fromPerson?: IResponsibilityPersonRef;
  readonly toPerson?: IResponsibilityPersonRef;
  readonly requestedAtUtc: string;
  readonly acceptedAtUtc?: string;
  readonly accepted: boolean;
  readonly reason?: string;
}

export interface IResponsibilityException {
  readonly code: ResponsibilityExceptionCode;
  readonly severity: ResponsibilityCriticality;
  readonly summary: string;
  readonly relatedItemId?: string;
}

// ---------------------------------------------------------------------------
// Evidence link reference. Reference-only by contract; no binary, URL,
// blob, file content, or upload field is permitted on this shape. Document
// Control retains evidence-binary ownership.
// ---------------------------------------------------------------------------

export interface IResponsibilityEvidenceLinkRef {
  readonly documentControlSourceId: string;
  readonly itemRef?: string;
  readonly status: ResponsibilityEvidenceLinkState;
}

// ---------------------------------------------------------------------------
// Template library and project-instance records.
// ---------------------------------------------------------------------------

export interface IResponsibilityTemplateLibraryRecord {
  readonly templateItemId: string;
  readonly templateVersion: string;
  readonly status: ResponsibilityTemplateStatus;
  readonly effectiveDateUtc?: string;
  readonly retirementDateUtc?: string;
  readonly sourceSnapshot: IResponsibilityWorkbookSourceRef;
  readonly classification: ResponsibilityItemClassification;
  readonly criticality: ResponsibilityCriticality;
  readonly domain: ResponsibilityDomain;
  readonly sourceTask: string;
  readonly baselineRaci: readonly IResponsibilityNormalizedAssignment[];
  readonly baselineContractPartyMapping?: IResponsibilityContractPartyMapping;
  readonly obligationRef?: IResponsibilityContractObligationRef;
  readonly decisionRights?: IResponsibilityDecisionRights;
}

export interface IResponsibilityProjectInstanceRecord {
  readonly projectId: PccProjectId;
  readonly instanceId: string;
  readonly templateItemId: string;
  readonly templateVersion: string;
  readonly classification: ResponsibilityItemClassification;
  readonly criticality: ResponsibilityCriticality;
  readonly domain: ResponsibilityDomain;
  readonly sourceTask: string;
  readonly assignment: IResponsibilityAssignment;
  readonly workflowSteps?: readonly IResponsibilityWorkflowStep[];
  readonly handoffs?: readonly IResponsibilityHandoff[];
  readonly evidenceLinks?: readonly IResponsibilityEvidenceLinkRef[];
  readonly exceptions: readonly IResponsibilityException[];
}

// ---------------------------------------------------------------------------
// Discriminated-union health score. `'insufficient-data'` does not expose
// `band`; `'computed'` exposes `band` plus the input counts.
// ---------------------------------------------------------------------------

export interface IResponsibilityMatrixHealthScoreInsufficient {
  readonly state: 'insufficient-data';
  readonly reason: string;
}

export interface IResponsibilityMatrixHealthScoreComputed {
  readonly state: 'computed';
  readonly band: ResponsibilityHealthBand;
  readonly openCriticalExceptions: number;
  readonly overdueActions: number;
  readonly missingAccountableOwners: number;
  readonly missingCurrentActionOwners: number;
  readonly pendingEvidence: number;
  readonly unresolvedDecisionRightsGaps: number;
}

export type ResponsibilityMatrixHealthScore =
  | IResponsibilityMatrixHealthScoreInsufficient
  | IResponsibilityMatrixHealthScoreComputed;

// ---------------------------------------------------------------------------
// Workbook-source summary. Counts are deterministic and traceable to the
// canonical workbook posture (109 / 82 / 27 / 98 / 47 / 0).
// ---------------------------------------------------------------------------

export interface IResponsibilityWorkbookSourceSummary {
  readonly defaultItemsTotal: number;
  readonly pmItems: number;
  readonly fieldItems: number;
  readonly strictMarkedRows: number;
  readonly ambiguousItemsTotal: number;
  readonly ownerContractActiveDefaultObligations: number;
  readonly sourceFiles: readonly string[];
}

// ---------------------------------------------------------------------------
// Source posture. Reuses `PccReadModelSourceStatus` for source health and
// `ProjectReadinessConfidenceState` for confidence so vocabulary aligns
// with the broader PCC framework.
// ---------------------------------------------------------------------------

export interface IResponsibilityMatrixSourcePosture {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly confidence?: ProjectReadinessConfidenceState;
  readonly lastIngestedAtUtc?: string;
  readonly pendingHumanReviewCount: number;
}

// ---------------------------------------------------------------------------
// Snapshot record. Governed read-only artifact; never a contract amendment
// and never a substitute for an executed contract.
// ---------------------------------------------------------------------------

export interface IResponsibilityMatrixSnapshot {
  readonly snapshotId: string;
  readonly generatedAtUtc: string;
  readonly projectId: PccProjectId;
  readonly readOnly: true;
  readonly counts: IResponsibilityWorkbookSourceSummary;
  readonly healthScore: ResponsibilityMatrixHealthScore;
  readonly summary: string;
}

// ---------------------------------------------------------------------------
// Audit event. Required for template, assignment, handoff, current-owner,
// exception, evidence-reference, and snapshot mutations.
// ---------------------------------------------------------------------------

export interface IResponsibilityAuditEvent {
  readonly eventId: string;
  readonly eventType: ResponsibilityAuditEventType;
  readonly occurredAtUtc: string;
  readonly actor?: IResponsibilityPersonRef;
  readonly entityRef: string;
  readonly summary: string;
}
