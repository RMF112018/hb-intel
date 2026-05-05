/**
 * PCC approval checkpoint read-model.
 *
 * Wave 1 surfaces approval state without an approval engine. Decision routing,
 * notifications, and persistence are out of scope for these types.
 *
 * Phase 3 / Wave 1 / Prompt 04 adds explicit checkpoint type, authority type,
 * and reviewer-action vocabulary. The `IApprovalCheckpoint.checkpointType`
 * and `IApprovalCheckpoint.authorityType` fields are **optional** to keep the
 * Prompt 02 shape backward-compatible; tightening to required is deferred
 * until later waves with confirmed consumers.
 *
 * Phase 3 / Wave 14 / Prompt 02 extends this module with the PCC-native
 * approvals/checkpoints control layer (read-model contracts, no command
 * runtime). Wave 14 owns: 17-state approval-request machine, 11-action
 * decision discriminated union, 8-mode registry with per-mode completion
 * rules, per-action reason-code families, validation rules
 * APR-VAL-001..020, role-action matrix typed against `PccPersona`, HBI
 * no-authority refusal helpers (principal-key based — HBI is NOT a
 * `PccPersona`), and audit-event + redaction vocabulary.
 *
 * Cycle prevention: this file does NOT import from `./CheckpointInstance.js`
 * (downstream sibling). Helpers whose parameter types live in
 * `CheckpointInstance.ts` (e.g., stale-source-reference detection) are
 * defined there; placing them here would create a TS module cycle. Legacy
 * `IApprovalCheckpoint` records bridge to Wave 14 `ICheckpointInstance` via
 * `mapLegacyCheckpointToInstance` defined in `CheckpointInstance.ts`.
 *
 * KEEP-OPTIONAL decision: `IApprovalCheckpoint.checkpointType` and
 * `IApprovalCheckpoint.authorityType` remain optional in Wave 14.
 * Verified consumers (`PccApprovalsCheckpointsCard.tsx` uses
 * `cp.checkpointType ?? 'generic'`; `PccApprovalsSurface.tsx` reads
 * fixture-populated values directly) tolerate `undefined`. Wave 14
 * authoritative posture moves to `ICheckpointDefinition.kind` (required)
 * and `ICheckpointDefinition.ownerRole` (required, broader than
 * `ApprovalAuthorityType`); legacy interface preserved without churn.
 */

import type {
  PccApprovalCheckpointId,
  PccApprovalDecisionId,
  PccApprovalParticipantId,
  PccApprovalPolicyId,
  PccApprovalPolicyVersionId,
  PccApprovalRequestId,
  PccApprovalRouteId,
  PccApprovalStepId,
  PccProjectId,
  PccWorkflowItemId,
} from './types.js';
import type { PccPersona } from './PccUserRoles.js';

export const APPROVAL_CHECKPOINT_STATES = [
  'pending',
  'approved',
  'rejected',
  'waived',
] as const;

export type ApprovalCheckpointState = (typeof APPROVAL_CHECKPOINT_STATES)[number];

export const APPROVAL_CHECKPOINT_TYPES = [
  'startup-readiness',
  'permit-issuance',
  'inspection-pass',
  'team-access-grant',
  'site-health-repair-acknowledgment',
  'closeout-acceptance',
  'buyout-commitment',
  'document-control-exception',
  'integration-configuration',
  'generic',
] as const;

export type ApprovalCheckpointType = (typeof APPROVAL_CHECKPOINT_TYPES)[number];

export const APPROVAL_AUTHORITY_TYPES = [
  'it-admin',
  'pcc-admin',
  'project-executive',
  'project-manager',
  'combined',
  'checkpoint-specific',
] as const;

export type ApprovalAuthorityType = (typeof APPROVAL_AUTHORITY_TYPES)[number];

export const REVIEWER_ACTIONS = [
  'approve',
  'reject',
  'request-changes',
  'delegate',
  'cancel',
] as const;

export type ReviewerAction = (typeof REVIEWER_ACTIONS)[number];

export interface IReviewerActionRecord {
  id: string;
  checkpointId: PccApprovalCheckpointId;
  action: ReviewerAction;
  actorUpn: string;
  actorPersona?: PccPersona;
  /** Populated only when `action === 'delegate'`. */
  delegatedToUpn?: string;
  /** ISO 8601 UTC. */
  occurredAtUtc: string;
  note?: string;
}

export interface IApprovalCheckpoint {
  id: PccApprovalCheckpointId;
  workflowItemId: PccWorkflowItemId;
  requiredPersona: PccPersona;
  state: ApprovalCheckpointState;
  /** ISO 8601 UTC. */
  requestedAtUtc: string;
  /** ISO 8601 UTC; populated once decided. */
  decidedAtUtc?: string;
  decidedByUpn?: string;
  decisionNote?: string;
  /**
   * Phase 3 / Wave 1 / Prompt 04 vocabulary fields. Optional to preserve
   * Prompt 02 shape backward compatibility.
   */
  checkpointType?: ApprovalCheckpointType;
  authorityType?: ApprovalAuthorityType;
}

// ---------------------------------------------------------------------------
// Wave 14 — Approval Request state machine
// ---------------------------------------------------------------------------

/** Wave 14 approval-request lifecycle states (17). */
export const APPROVAL_REQUEST_STATES = [
  'draft',
  'requested',
  'pending-review',
  'in-review',
  'revision-requested',
  'approved',
  'rejected-returned',
  'deferred',
  'waived',
  'overridden',
  'escalated',
  'cancelled',
  'superseded',
  'expired',
  'execution-pending',
  'manually-closed',
  'archived',
] as const;

export type ApprovalRequestState = (typeof APPROVAL_REQUEST_STATES)[number];

/** Subset of `APPROVAL_REQUEST_STATES` that are terminal. */
export const APPROVAL_REQUEST_TERMINAL_STATES: readonly ApprovalRequestState[] = [
  'approved',
  'rejected-returned',
  'deferred',
  'waived',
  'overridden',
  'cancelled',
  'superseded',
  'expired',
  'manually-closed',
  'archived',
] as const;

/** Subset of `APPROVAL_REQUEST_STATES` that are non-terminal. */
export const APPROVAL_REQUEST_NON_TERMINAL_STATES: readonly ApprovalRequestState[] = [
  'draft',
  'requested',
  'pending-review',
  'in-review',
  'revision-requested',
  'escalated',
  'execution-pending',
] as const;

/**
 * Allowed state transitions per the Wave 14 state-machine artifact.
 * Pure data; no validation runtime. Every value is a member of
 * `APPROVAL_REQUEST_STATES`.
 *
 * Per the artifact's `terminal -> archived` row, every terminal state
 * may transition to `archived`. Non-terminal states list their explicit
 * forward edges. `revision-requested` is non-terminal and returns to the
 * source module — represented here with no forward edges (the source
 * module re-issues a fresh `draft` lifecycle independently).
 */
export const APPROVAL_REQUEST_ALLOWED_TRANSITIONS: Readonly<
  Record<ApprovalRequestState, readonly ApprovalRequestState[]>
> = {
  draft: ['requested'],
  requested: ['pending-review', 'cancelled', 'superseded'],
  'pending-review': [
    'in-review',
    'revision-requested',
    'approved',
    'rejected-returned',
    'deferred',
    'waived',
    'overridden',
    'escalated',
    'cancelled',
    'superseded',
    'expired',
  ],
  'in-review': [
    'revision-requested',
    'approved',
    'rejected-returned',
    'deferred',
    'waived',
    'overridden',
    'escalated',
  ],
  'revision-requested': [],
  approved: ['execution-pending', 'archived'],
  'rejected-returned': ['archived'],
  deferred: ['archived'],
  waived: ['archived'],
  overridden: ['archived'],
  escalated: ['approved', 'rejected-returned'],
  cancelled: ['archived'],
  superseded: ['archived'],
  expired: ['archived'],
  'execution-pending': ['manually-closed'],
  'manually-closed': ['archived'],
  archived: [],
};

/** True if `state` is a terminal Wave 14 approval-request state. */
export function isTerminalApprovalRequestState(state: ApprovalRequestState): boolean {
  return APPROVAL_REQUEST_TERMINAL_STATES.includes(state);
}

/** True if the `(from, to)` transition is allowed by the Wave 14 state machine. */
export function isApprovalRequestTransitionAllowed(
  from: ApprovalRequestState,
  to: ApprovalRequestState,
): boolean {
  return APPROVAL_REQUEST_ALLOWED_TRANSITIONS[from].includes(to);
}

// ---------------------------------------------------------------------------
// Wave 14 — Approval modes
// ---------------------------------------------------------------------------

/** Wave 14 approval-route mode tuple (8). */
export const APPROVAL_MODES = [
  'single-approver',
  'sequential',
  'parallel-all',
  'parallel-any',
  'advisory-review',
  'acknowledgement-only',
  'escalation-review',
  'admin-verification',
] as const;

export type ApprovalMode = (typeof APPROVAL_MODES)[number];

export interface IApprovalModeCompletionRule {
  readonly mode: ApprovalMode;
  /** Plain-language completion rule. */
  readonly completionRule: string;
  /** Per-mode edge cases callers must respect. */
  readonly edgeCases: readonly string[];
}

/** Per-mode completion rules from `approval_mode_registry.json`. */
export const APPROVAL_MODE_COMPLETION_RULES: Readonly<
  Record<ApprovalMode, IApprovalModeCompletionRule>
> = {
  'single-approver': {
    mode: 'single-approver',
    completionRule: 'one authorized approver terminal decision resolves the step',
    edgeCases: [
      'delegation only if policy allows',
      'rejection policy controls return/termination',
    ],
  },
  sequential: {
    mode: 'sequential',
    completionRule:
      'steps open in order and each required step must resolve before the next opens',
    edgeCases: [
      'source supersession invalidates uncompleted steps',
      'revision request returns to source owner',
    ],
  },
  'parallel-all': {
    mode: 'parallel-all',
    completionRule: 'all required approvers must decide',
    edgeCases: ['fail-fast rejection or collect-all-responses determined by policy'],
  },
  'parallel-any': {
    mode: 'parallel-any',
    completionRule: 'first authorized terminal decision resolves the step',
    edgeCases: ['remaining participants marked not-needed-after-resolution'],
  },
  'advisory-review': {
    mode: 'advisory-review',
    completionRule: 'advisory participants provide comments/recommendations only',
    edgeCases: ['cannot approve, waive, override, cancel, or manual-close'],
  },
  'acknowledgement-only': {
    mode: 'acknowledgement-only',
    completionRule: 'recipient confirms awareness',
    edgeCases: ['does not imply approval authority'],
  },
  'escalation-review': {
    mode: 'escalation-review',
    completionRule:
      'escalated owner reviews while original route history is preserved',
    edgeCases: ['original route may pause or remain visible by policy'],
  },
  'admin-verification': {
    mode: 'admin-verification',
    completionRule: 'technical/governance actor verifies required controls',
    edgeCases: ['may produce execution-pending but not external execution'],
  },
};

// ---------------------------------------------------------------------------
// Wave 14 — Decision actions, reason codes, action→target map
// ---------------------------------------------------------------------------

/** Wave 14 decision action tuple (11). */
export const APPROVAL_DECISION_ACTIONS = [
  'approve',
  'reject-return',
  'request-revision',
  'acknowledge',
  'defer',
  'waive-with-reason',
  'override-with-reason',
  'escalate',
  'cancel',
  'supersede',
  'manual-close',
] as const;

export type ApprovalDecisionAction = (typeof APPROVAL_DECISION_ACTIONS)[number];

export const REJECT_RETURN_REASON_CODES = [
  'incomplete-evidence',
  'incorrect-source',
  'missing-authority',
  'conflicting-data',
  'scope-unclear',
] as const;
export type RejectReturnReasonCode = (typeof REJECT_RETURN_REASON_CODES)[number];

export const REQUEST_REVISION_REASON_CODES = [
  'missing-field',
  'evidence-update-required',
  'source-item-change-required',
  'routing-correction',
] as const;
export type RequestRevisionReasonCode = (typeof REQUEST_REVISION_REASON_CODES)[number];

export const DEFER_REASON_CODES = [
  'external-dependency',
  'owner-delay',
  'client-input-pending',
  'authority-review-pending',
] as const;
export type DeferReasonCode = (typeof DEFER_REASON_CODES)[number];

export const WAIVE_REASON_CODES = [
  'low-risk-exception',
  'time-sensitive-business-need',
  'non-applicable-condition',
  'documented-alternate-control',
] as const;
export type WaiveReasonCode = (typeof WAIVE_REASON_CODES)[number];

export const OVERRIDE_REASON_CODES = [
  'executive-direction',
  'emergency-condition',
  'governance-approved-exception',
  'project-critical-path-impact',
] as const;
export type OverrideReasonCode = (typeof OVERRIDE_REASON_CODES)[number];

export const ESCALATE_REASON_CODES = [
  'overdue',
  'high-risk',
  'high-cost',
  'disputed-decision',
  'authority-conflict',
] as const;
export type EscalateReasonCode = (typeof ESCALATE_REASON_CODES)[number];

export const CANCEL_REASON_CODES = [
  'source-cancelled',
  'duplicate-request',
  'created-in-error',
  'no-longer-applicable',
] as const;
export type CancelReasonCode = (typeof CANCEL_REASON_CODES)[number];

export const SUPERSEDE_REASON_CODES = [
  'source-version-changed',
  'snapshot-replaced',
  'policy-version-replaced',
  'route-rebuilt',
] as const;
export type SupersedeReasonCode = (typeof SUPERSEDE_REASON_CODES)[number];

export const MANUAL_CLOSE_REASON_CODES = [
  'admin-cleanup',
  'historical-reconciliation',
  'migrated-record',
  'duplicate-terminal-record',
] as const;
export type ManualCloseReasonCode = (typeof MANUAL_CLOSE_REASON_CODES)[number];

/**
 * Map decision action → terminal target state when a single-step route
 * resolves on that action. `null` for non-terminal actions
 * (`request-revision`, `acknowledge`, `escalate`).
 *
 * `acknowledge` resolves to `approved` only when the route mode is
 * `acknowledgement-only` and the step is final; route-mode validation
 * lives at the route layer, not here.
 */
export const APPROVAL_ACTION_TO_TARGET_STATE: Readonly<
  Record<ApprovalDecisionAction, ApprovalRequestState | null>
> = {
  approve: 'approved',
  'reject-return': 'rejected-returned',
  'request-revision': null,
  acknowledge: null,
  defer: 'deferred',
  'waive-with-reason': 'waived',
  'override-with-reason': 'overridden',
  escalate: null,
  cancel: 'cancelled',
  supersede: 'superseded',
  'manual-close': 'manually-closed',
};

// ---------------------------------------------------------------------------
// Wave 14 — Discriminated-union ApprovalDecision
// ---------------------------------------------------------------------------

interface IApprovalDecisionBase {
  readonly id: PccApprovalDecisionId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly stepId: PccApprovalStepId;
  readonly participantId: PccApprovalParticipantId;
  readonly actorPrincipalKey: string;
  readonly actorRole: PccPersona;
  /** ISO 8601 UTC. */
  readonly decisionAtUtc: string;
}

export interface IApprovalDecisionApprove extends IApprovalDecisionBase {
  readonly action: 'approve';
  readonly evidenceRefs?: readonly string[];
  readonly comment?: string;
}

export interface IApprovalDecisionRejectReturn extends IApprovalDecisionBase {
  readonly action: 'reject-return';
  readonly reasonCode: RejectReturnReasonCode;
  readonly comment: string;
}

export interface IApprovalDecisionRequestRevision extends IApprovalDecisionBase {
  readonly action: 'request-revision';
  readonly reasonCode: RequestRevisionReasonCode;
  readonly comment: string;
}

export interface IApprovalDecisionAcknowledge extends IApprovalDecisionBase {
  readonly action: 'acknowledge';
  readonly comment?: string;
}

export interface IApprovalDecisionDefer extends IApprovalDecisionBase {
  readonly action: 'defer';
  readonly reasonCode: DeferReasonCode;
  /** ISO 8601 UTC; reminder/follow-up gate. */
  readonly deferUntilUtc: string;
  readonly followUpOwnerPrincipalKey: string;
  readonly comment?: string;
}

export interface IApprovalDecisionWaive extends IApprovalDecisionBase {
  readonly action: 'waive-with-reason';
  readonly reasonCode: WaiveReasonCode;
  /** Non-empty per APR-VAL-005. */
  readonly evidenceRefs: readonly string[];
  readonly riskAcknowledgement: string;
  readonly comment?: string;
}

export interface IApprovalDecisionOverride extends IApprovalDecisionBase {
  readonly action: 'override-with-reason';
  readonly reasonCode: OverrideReasonCode;
  /** Non-empty per APR-VAL-005. */
  readonly evidenceRefs: readonly string[];
  readonly consequenceAcknowledgement: string;
  readonly comment?: string;
}

export interface IApprovalDecisionEscalate extends IApprovalDecisionBase {
  readonly action: 'escalate';
  readonly escalationReason: EscalateReasonCode;
  /**
   * Target persona for escalation; held as `PccPersona` literal to keep
   * routing decidable inside the type system.
   */
  readonly escalationTargetRole: PccPersona;
  readonly comment?: string;
}

export interface IApprovalDecisionCancel extends IApprovalDecisionBase {
  readonly action: 'cancel';
  readonly reasonCode: CancelReasonCode;
  readonly comment?: string;
}

export interface IApprovalDecisionSupersede extends IApprovalDecisionBase {
  readonly action: 'supersede';
  readonly reasonCode: SupersedeReasonCode;
  /** Replacement source-reference id (defined in `CheckpointInstance.ts`). */
  readonly replacementSourceReferenceId: string;
  readonly comment?: string;
}

export interface IApprovalDecisionManualClose extends IApprovalDecisionBase {
  readonly action: 'manual-close';
  readonly reasonCode: ManualCloseReasonCode;
  /** Non-empty per APR-VAL-005. */
  readonly evidenceRefs: readonly string[];
  readonly comment?: string;
}

export type ApprovalDecision =
  | IApprovalDecisionApprove
  | IApprovalDecisionRejectReturn
  | IApprovalDecisionRequestRevision
  | IApprovalDecisionAcknowledge
  | IApprovalDecisionDefer
  | IApprovalDecisionWaive
  | IApprovalDecisionOverride
  | IApprovalDecisionEscalate
  | IApprovalDecisionCancel
  | IApprovalDecisionSupersede
  | IApprovalDecisionManualClose;

// ---------------------------------------------------------------------------
// Wave 14 — Approval domain interfaces (request, policy, route, step, participant)
// ---------------------------------------------------------------------------

export interface IApprovalRequest {
  readonly id: PccApprovalRequestId;
  readonly projectId: PccProjectId;
  /**
   * Source-reference ids (defined in `CheckpointInstance.ts`). Held as
   * string ids here to avoid a back-import; downstream code can join to
   * `ICheckpointSourceReference` records by id.
   */
  readonly sourceReferenceIds: readonly string[];
  readonly approvalPolicyId: PccApprovalPolicyId;
  readonly routeId: PccApprovalRouteId;
  readonly createdByPrincipalKey: string;
  /** ISO 8601 UTC. */
  readonly createdAtUtc: string;
  readonly state: ApprovalRequestState;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly currentStepId?: PccApprovalStepId;
  readonly priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface IApprovalPolicy {
  readonly id: PccApprovalPolicyId;
  readonly name: string;
  readonly version: string;
  readonly approvalModes: readonly ApprovalMode[];
  readonly decisionActions: readonly ApprovalDecisionAction[];
  readonly escalationRules: readonly string[];
  readonly description?: string;
  readonly tags?: readonly string[];
}

export interface IApprovalPolicyVersion {
  readonly id: PccApprovalPolicyVersionId;
  readonly policyId: PccApprovalPolicyId;
  readonly version: string;
  /** ISO 8601 UTC. */
  readonly effectiveFrom: string;
  /** ISO 8601 UTC; absent for currently effective version. */
  readonly effectiveUntil?: string;
  readonly approvalModes: readonly ApprovalMode[];
  readonly decisionActions: readonly ApprovalDecisionAction[];
  readonly notes?: string;
}

export interface IApprovalParticipant {
  readonly id: PccApprovalParticipantId;
  readonly stepId: PccApprovalStepId;
  readonly principalKey: string;
  readonly role: PccPersona;
  readonly delegatedFromPrincipalKey?: string;
  readonly delegationAllowed?: boolean;
  /** ISO 8601 UTC; populated when the participant has acknowledged. */
  readonly acknowledgedAtUtc?: string;
}

export interface IApprovalStep {
  readonly id: PccApprovalStepId;
  readonly routeId: PccApprovalRouteId;
  readonly stepNumber: number;
  readonly mode: ApprovalMode;
  readonly assignedRole: PccPersona;
  readonly assignedPrincipalKey?: string;
  readonly delegationAllowed?: boolean;
  readonly participants?: readonly IApprovalParticipant[];
  readonly completionRule?: string;
}

export interface IApprovalRoute {
  readonly id: PccApprovalRouteId;
  readonly approvalRequestId: PccApprovalRequestId;
  readonly approvalPolicyId: PccApprovalPolicyId;
  readonly steps: readonly IApprovalStep[];
  readonly name?: string;
  readonly priority?: 'low' | 'normal' | 'high' | 'urgent';
  readonly delegationAllowed?: boolean;
}

// ---------------------------------------------------------------------------
// Wave 14 — Validation rules + role-action matrix
// ---------------------------------------------------------------------------

export const APPROVAL_VALIDATION_RULE_IDS = [
  'APR-VAL-001',
  'APR-VAL-002',
  'APR-VAL-003',
  'APR-VAL-004',
  'APR-VAL-005',
  'APR-VAL-006',
  'APR-VAL-007',
  'APR-VAL-008',
  'APR-VAL-009',
  'APR-VAL-010',
  'APR-VAL-011',
  'APR-VAL-012',
  'APR-VAL-013',
  'APR-VAL-014',
  'APR-VAL-015',
  'APR-VAL-016',
  'APR-VAL-017',
  'APR-VAL-018',
  'APR-VAL-019',
  'APR-VAL-020',
] as const;

export type ApprovalValidationRuleId = (typeof APPROVAL_VALIDATION_RULE_IDS)[number];

export const APPROVAL_VALIDATION_SEVERITIES = ['critical', 'error', 'warning'] as const;
export type ApprovalValidationSeverity = (typeof APPROVAL_VALIDATION_SEVERITIES)[number];

export interface IApprovalValidationRule {
  readonly id: ApprovalValidationRuleId;
  readonly severity: ApprovalValidationSeverity;
  readonly description: string;
  readonly appliesTo: string;
  readonly blocksRelease: boolean;
  readonly ownerRole: string;
  readonly remediation: string;
}

export const APPROVAL_VALIDATION_RULES: Readonly<
  Record<ApprovalValidationRuleId, IApprovalValidationRule>
> = {
  'APR-VAL-001': {
    id: 'APR-VAL-001',
    severity: 'error',
    description: 'missing approver',
    appliesTo: 'ApprovalRoute/ApprovalStep',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'assign required approver role or principal',
  },
  'APR-VAL-002': {
    id: 'APR-VAL-002',
    severity: 'error',
    description: 'invalid actor role',
    appliesTo: 'Command',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'resolve actor PCC role before command',
  },
  'APR-VAL-003': {
    id: 'APR-VAL-003',
    severity: 'error',
    description: 'invalid state transition',
    appliesTo: 'StateMachine',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'use canonical transition table',
  },
  'APR-VAL-004': {
    id: 'APR-VAL-004',
    severity: 'error',
    description: 'missing reason for waiver/override',
    appliesTo: 'Decision',
    blocksRelease: true,
    ownerRole: 'Approver',
    remediation: 'provide required reason code',
  },
  'APR-VAL-005': {
    id: 'APR-VAL-005',
    severity: 'error',
    description: 'missing evidence link where required',
    appliesTo: 'Decision',
    blocksRelease: true,
    ownerRole: 'Approver',
    remediation: 'attach or reference required evidence',
  },
  'APR-VAL-006': {
    id: 'APR-VAL-006',
    severity: 'error',
    description: 'stale source item reference',
    appliesTo: 'SourceReference',
    blocksRelease: true,
    ownerRole: 'Source Owner',
    remediation: 'revalidate or supersede checkpoint',
  },
  'APR-VAL-007': {
    id: 'APR-VAL-007',
    severity: 'error',
    description: 'superseded source item reference',
    appliesTo: 'SourceReference',
    blocksRelease: true,
    ownerRole: 'Source Owner',
    remediation: 'link replacement approval request',
  },
  'APR-VAL-008': {
    id: 'APR-VAL-008',
    severity: 'error',
    description: 'unresolved blocker before gate approval',
    appliesTo: 'ReadinessGate',
    blocksRelease: true,
    ownerRole: 'Project Executive',
    remediation: 'resolve, defer, waive, or override with reason',
  },
  'APR-VAL-009': {
    id: 'APR-VAL-009',
    severity: 'error',
    description: 'approval mode mismatch',
    appliesTo: 'ApprovalRoute',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'correct route mode/step completion rule',
  },
  'APR-VAL-010': {
    id: 'APR-VAL-010',
    severity: 'error',
    description: 'missing downstream target',
    appliesTo: 'Handoff/Freeze',
    blocksRelease: true,
    ownerRole: 'Source Owner',
    remediation: 'define downstream target',
  },
  'APR-VAL-011': {
    id: 'APR-VAL-011',
    severity: 'error',
    description: 'decision attempted by unauthorized role',
    appliesTo: 'Command',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'deny and audit',
  },
  'APR-VAL-012': {
    id: 'APR-VAL-012',
    severity: 'critical',
    description: 'HBI attempted decision',
    appliesTo: 'Command/HBI',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'refuse and audit',
  },
  'APR-VAL-013': {
    id: 'APR-VAL-013',
    severity: 'critical',
    description: 'external-system writeback attempted',
    appliesTo: 'Command/Integration',
    blocksRelease: true,
    ownerRole: 'Integration Admin',
    remediation: 'block command and audit',
  },
  'APR-VAL-014': {
    id: 'APR-VAL-014',
    severity: 'critical',
    description: 'direct tenant mutation attempted',
    appliesTo: 'Command/Admin',
    blocksRelease: true,
    ownerRole: 'IT / Tenant Admin',
    remediation: 'block command and audit',
  },
  'APR-VAL-015': {
    id: 'APR-VAL-015',
    severity: 'critical',
    description: 'package/dependency mutation attempted',
    appliesTo: 'Execution',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'revert package/lockfile mutation',
  },
  'APR-VAL-016': {
    id: 'APR-VAL-016',
    severity: 'error',
    description: 'invalid Wave 13G handoff/freeze checkpoint',
    appliesTo: 'Estimating',
    blocksRelease: true,
    ownerRole: 'Director of Preconstruction',
    remediation: 'align with Wave 13G authority and Phase 14 semantics',
  },
  'APR-VAL-017': {
    id: 'APR-VAL-017',
    severity: 'warning',
    description: 'missing disabled action reason',
    appliesTo: 'UX',
    blocksRelease: true,
    ownerRole: 'UX Owner',
    remediation: 'add disabled action reason',
  },
  'APR-VAL-018': {
    id: 'APR-VAL-018',
    severity: 'warning',
    description: 'missing aria-sort for sortable queue',
    appliesTo: 'Accessibility',
    blocksRelease: true,
    ownerRole: 'UX Owner',
    remediation: 'add accessible sort semantics',
  },
  'APR-VAL-019': {
    id: 'APR-VAL-019',
    severity: 'error',
    description: 'default unique permission strategy detected',
    appliesTo: 'Storage/Security',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'use role-filtered read models/redaction instead',
  },
  'APR-VAL-020': {
    id: 'APR-VAL-020',
    severity: 'error',
    description: 'unpaged queue read',
    appliesTo: 'Storage/ReadModel',
    blocksRelease: true,
    ownerRole: 'PCC Admin',
    remediation: 'add server-side paging/filtering',
  },
};

export interface IApprovalValidationFinding {
  readonly ruleId: ApprovalValidationRuleId;
  readonly severity: ApprovalValidationSeverity;
  readonly message: string;
}

/**
 * Per-persona allowed decision actions, mapped onto `PccPersona` from
 * `_doc-updates/artifacts/approval_role_action_matrix.json`. Personas
 * named in the matrix JSON map to the documented decision rights;
 * personas not named in the matrix get an empty array (no decision
 * actions allowed). HBI is NOT a `PccPersona` and does not appear here —
 * HBI no-authority is enforced via `isHbiPrincipalKey` /
 * `assertNoHbiAuthorityOnDecision` below.
 *
 * Roles in the matrix JSON that are NOT current `PccPersona` literals
 * (Legal Reviewer, Compliance Reviewer, Leadership Reviewer, Integration
 * Admin) are governed by other mechanisms (advisory-review mode,
 * integration admin actor class) and are intentionally not represented
 * here; adding them would require extending `PCC_PERSONAS`, which is
 * out of scope for Prompt 02.
 */
export const APPROVAL_ROLE_ACTION_MATRIX: Readonly<
  Record<PccPersona, readonly ApprovalDecisionAction[]>
> = {
  'pcc-admin': [
    'approve',
    'request-revision',
    'defer',
    'waive-with-reason',
    'escalate',
    'cancel',
    'supersede',
    'manual-close',
  ],
  'it-admin': ['request-revision', 'escalate', 'manual-close'],
  'executive-oversight': [
    'approve',
    'waive-with-reason',
    'override-with-reason',
    'escalate',
    'manual-close',
  ],
  'project-executive': [
    'approve',
    'reject-return',
    'request-revision',
    'defer',
    'waive-with-reason',
    'override-with-reason',
    'escalate',
  ],
  'project-manager': [
    'approve',
    'reject-return',
    'request-revision',
    'defer',
    'escalate',
  ],
  superintendent: ['acknowledge', 'request-revision'],
  'project-accounting': ['approve', 'reject-return', 'request-revision', 'escalate'],
  'project-team-member': ['acknowledge'],
  'external-contributor': [],
  viewer: [],
  'estimating-coordinator': ['acknowledge', 'request-revision'],
  'lead-estimator': ['approve', 'request-revision', 'escalate'],
  estimator: ['acknowledge'],
  'chief-estimator': [
    'approve',
    'reject-return',
    'waive-with-reason',
    'escalate',
  ],
  'director-of-preconstruction': [
    'approve',
    'override-with-reason',
    'escalate',
  ],
  'project-coordinator': [],
  'external-design-team': [],
  'owner-client-viewer': ['acknowledge'],
  'subcontractor-limited': [],
  'manager-of-operational-excellence': ['escalate'],
  'safety-qaqc': ['approve', 'request-revision', 'escalate'],
};

/** True if `role` is allowed to perform `action` per the role-action matrix. */
export function isActionAllowedForRole(
  role: PccPersona,
  action: ApprovalDecisionAction,
): boolean {
  return APPROVAL_ROLE_ACTION_MATRIX[role].includes(action);
}

// ---------------------------------------------------------------------------
// Wave 14 — Pure helpers (only types defined in this file or upstream)
// ---------------------------------------------------------------------------

/**
 * Validate the structural shape of an `ApprovalDecision` per the
 * Wave 14 decision-action registry. Pure; no I/O.
 *
 * Returns findings keyed to `APR-VAL-004` (missing reason),
 * `APR-VAL-005` (missing evidence), and `APR-VAL-002` (invalid actor role)
 * where applicable. Does NOT validate state-machine or stale-source
 * concerns (those use other helpers).
 */
export function validateDecisionShape(
  decision: ApprovalDecision,
): readonly IApprovalValidationFinding[] {
  const findings: IApprovalValidationFinding[] = [];
  function missingEvidence(label: string): void {
    findings.push({
      ruleId: 'APR-VAL-005',
      severity: 'error',
      message: `${label} requires non-empty evidenceRefs`,
    });
  }
  switch (decision.action) {
    case 'waive-with-reason':
      if (decision.evidenceRefs.length === 0) missingEvidence('waive-with-reason');
      if (!decision.riskAcknowledgement) {
        findings.push({
          ruleId: 'APR-VAL-004',
          severity: 'error',
          message: 'waive-with-reason requires riskAcknowledgement',
        });
      }
      break;
    case 'override-with-reason':
      if (decision.evidenceRefs.length === 0) missingEvidence('override-with-reason');
      if (!decision.consequenceAcknowledgement) {
        findings.push({
          ruleId: 'APR-VAL-004',
          severity: 'error',
          message: 'override-with-reason requires consequenceAcknowledgement',
        });
      }
      break;
    case 'manual-close':
      if (decision.evidenceRefs.length === 0) missingEvidence('manual-close');
      break;
    case 'reject-return':
    case 'request-revision':
      if (!decision.comment) {
        findings.push({
          ruleId: 'APR-VAL-004',
          severity: 'error',
          message: `${decision.action} requires comment`,
        });
      }
      break;
    case 'defer':
      if (!decision.deferUntilUtc) {
        findings.push({
          ruleId: 'APR-VAL-004',
          severity: 'error',
          message: 'defer requires deferUntilUtc',
        });
      }
      if (!decision.followUpOwnerPrincipalKey) {
        findings.push({
          ruleId: 'APR-VAL-004',
          severity: 'error',
          message: 'defer requires followUpOwnerPrincipalKey',
        });
      }
      break;
    default:
      break;
  }
  return findings;
}

/** True if `req.state === 'superseded'`. */
export function isSupersededRequest(req: IApprovalRequest): boolean {
  return req.state === 'superseded';
}

/** Decision actions that always require non-empty evidence per APR-VAL-005. */
export const APPROVAL_ACTIONS_REQUIRING_EVIDENCE: readonly ApprovalDecisionAction[] = [
  'waive-with-reason',
  'override-with-reason',
  'manual-close',
];

/** True if `action` always requires non-empty evidence per APR-VAL-005. */
export function requiresEvidenceForAction(action: ApprovalDecisionAction): boolean {
  return APPROVAL_ACTIONS_REQUIRING_EVIDENCE.includes(action);
}

// ---------------------------------------------------------------------------
// Wave 14 — HBI no-authority refusal (principal-key based)
// ---------------------------------------------------------------------------

/**
 * Principal-key prefix that identifies an HBI assistant actor. HBI is
 * NOT a `PccPersona`; refusal is enforced at the principal-key layer
 * so the persona role-action matrix can remain pure.
 */
export const HBI_PRINCIPAL_KEY_PREFIX = 'hbi:' as const;

/**
 * All decision actions are forbidden for HBI (HBI has no decision
 * authority). Maintained as the full decision-action set so the test
 * `HBI_FORBIDDEN_DECISION_ACTIONS.length === APPROVAL_DECISION_ACTIONS.length`
 * is a structural invariant.
 */
export const HBI_FORBIDDEN_DECISION_ACTIONS: readonly ApprovalDecisionAction[] = [
  ...APPROVAL_DECISION_ACTIONS,
];

/** True if `principalKey` identifies an HBI assistant actor. */
export function isHbiPrincipalKey(principalKey: string): boolean {
  return principalKey.startsWith(HBI_PRINCIPAL_KEY_PREFIX);
}

/**
 * Returns an `APR-VAL-012` finding when the decision's actor principal
 * key identifies an HBI actor; returns `null` for any non-HBI principal.
 * Pure; no persona dependency.
 */
export function assertNoHbiAuthorityOnDecision(
  decision: ApprovalDecision,
): IApprovalValidationFinding | null {
  if (isHbiPrincipalKey(decision.actorPrincipalKey)) {
    return {
      ruleId: 'APR-VAL-012',
      severity: 'critical',
      message: `HBI principal '${decision.actorPrincipalKey}' attempted '${decision.action}' decision`,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Wave 14 — Audit event taxonomy + redaction vocabulary
// ---------------------------------------------------------------------------

/** Wave 14 approval audit-event types mirroring the state-machine artifact's `auditEvent` codes plus security/violation events. */
export const APPROVAL_AUDIT_EVENT_TYPES = [
  'approval.requested',
  'approval.queued',
  'approval.review-started',
  'approval.revision-requested',
  'approval.approved',
  'approval.rejected-returned',
  'approval.deferred',
  'approval.waived',
  'approval.overridden',
  'approval.escalated',
  'approval.cancelled',
  'approval.superseded',
  'approval.expired',
  'approval.execution-pending',
  'approval.manually-closed',
  'approval.archived',
  'approval.unauthorized-decision-attempted',
  'approval.hbi-decision-attempted',
  'approval.external-writeback-attempted',
  'approval.tenant-mutation-attempted',
  'approval.evidence-revalidation-required',
] as const;

export type ApprovalAuditEventType = (typeof APPROVAL_AUDIT_EVENT_TYPES)[number];

/** Wave 14 redaction categories (role-aware visibility on read-models and audit events). */
export const APPROVAL_REDACTION_CATEGORIES = [
  'financial-exposure',
  'legal-compliance-notes',
  'external-user-rationale',
  'executive-overrides',
  'restricted-source-identifiers',
  'restricted-hbi-citation-context',
] as const;

export type ApprovalRedactionCategory = (typeof APPROVAL_REDACTION_CATEGORIES)[number];

/**
 * Per-category context that UX must preserve when redacting (so
 * disabled-action reasons, stale-source holds, and escalation paths
 * remain explainable without exposing restricted detail). Pure data;
 * no UX runtime.
 */
export const APPROVAL_REDACTION_PRESERVED_CONTEXT: Readonly<
  Record<ApprovalRedactionCategory, readonly string[]>
> = {
  'financial-exposure': [
    'disabled-action-reason',
    'evidence-presence-without-amount',
  ],
  'legal-compliance-notes': [
    'disabled-action-reason',
    'evidence-presence-without-content',
  ],
  'external-user-rationale': [
    'disabled-action-reason',
    'route-step-state-without-comment',
  ],
  'executive-overrides': [
    'state-transition-marker',
    'override-occurred-without-reason-detail',
  ],
  'restricted-source-identifiers': [
    'source-module-without-item-id',
    'stale-source-hold-reason-without-detail',
  ],
  'restricted-hbi-citation-context': [
    'hbi-no-authority-reason',
    'redacted-citation-marker',
  ],
};

/** Categories of context that UX must preserve for the given redaction category. */
export function redactionContextPreservedFor(
  category: ApprovalRedactionCategory,
): readonly string[] {
  return APPROVAL_REDACTION_PRESERVED_CONTEXT[category];
}
