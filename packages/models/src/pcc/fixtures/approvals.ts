/**
 * PCC fixture — sample approval checkpoints and reviewer actions.
 *
 * Deterministic, non-secret. Phase 3 / Wave 1 / Prompt 06.
 *
 * Phase 3 / Wave 14 / Prompt 02 extends this fixture with eight
 * Wave 14 fixture families (queue, my-approvals, detail, registry,
 * history, escalation, admin-verification, policy, analytics) plus
 * bridge fixtures that compose the legacy `SAMPLE_APPROVAL_CHECKPOINTS`
 * records into Wave 14 `ICheckpointInstance` shapes via
 * `mapLegacyCheckpointToInstance`. Architecture is connected, not
 * parallel: Wave 14 fixtures reuse legacy ids where the records bridge.
 */

import type {
  ApprovalDecision,
  IApprovalCheckpoint,
  IApprovalParticipant,
  IApprovalPolicy,
  IApprovalPolicyVersion,
  IApprovalRequest,
  IApprovalRoute,
  IApprovalStep,
  IReviewerActionRecord,
} from '../ApprovalCheckpoint.js';
import type {
  ApprovalAnalyticsReadModel,
  ApprovalDetailReadModel,
  ApprovalPolicyReadModel,
  ApprovalQueueReadModel,
  AdminVerificationQueueReadModel,
  CheckpointRegistryReadModel,
  DecisionHistoryReadModel,
  EscalationQueueReadModel,
  IAdminVerificationQueueEntry,
  IApprovalPriorityActionLink,
  IApprovalQueueEntry,
  ICheckpointAuditEvent,
  ICheckpointDefinition,
  ICheckpointEvidenceLink,
  ICheckpointInstance,
  ICheckpointSourceReference,
  IEscalationQueueEntry,
  MyApprovalsReadModel,
} from '../CheckpointInstance.js';
import { mapLegacyCheckpointToInstance } from '../CheckpointInstance.js';
import type {
  PccApprovalCheckpointId,
  PccApprovalDecisionId,
  PccApprovalParticipantId,
  PccApprovalPolicyId,
  PccApprovalPolicyVersionId,
  PccApprovalPriorityActionLinkId,
  PccApprovalRequestId,
  PccApprovalRouteId,
  PccApprovalStepId,
  PccCheckpointAuditEventId,
  PccCheckpointDefinitionId,
  PccCheckpointEvidenceLinkId,
  PccCheckpointInstanceId,
  PccCheckpointSourceReferenceId,
  PccProjectId,
  PccWorkflowItemId,
} from '../types.js';

const PM_UPN = 'pm-sample@example.com';
const PE_UPN = 'pe-sample@example.com';
const SUPER_UPN = 'super-sample@example.com';

export const SAMPLE_APPROVAL_CHECKPOINTS: readonly IApprovalCheckpoint[] = [
  {
    id: 'fixture-cp-001' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-001' as PccWorkflowItemId,
    requiredPersona: 'project-executive',
    state: 'pending',
    requestedAtUtc: '2026-04-25T08:30:00Z',
    checkpointType: 'startup-readiness',
    authorityType: 'project-executive',
  },
  {
    id: 'fixture-cp-002' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-002' as PccWorkflowItemId,
    requiredPersona: 'pcc-admin',
    state: 'approved',
    requestedAtUtc: '2026-04-24T08:00:00Z',
    decidedAtUtc: '2026-04-26T10:15:00Z',
    decidedByUpn: 'admin-sample@example.com',
    decisionNote: 'Permit submission package complete.',
    checkpointType: 'permit-issuance',
    authorityType: 'pcc-admin',
  },
  {
    id: 'fixture-cp-003' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-003' as PccWorkflowItemId,
    requiredPersona: 'project-manager',
    state: 'rejected',
    requestedAtUtc: '2026-04-23T08:00:00Z',
    decidedAtUtc: '2026-04-23T16:00:00Z',
    decidedByUpn: PM_UPN,
    decisionNote: 'Inspection prerequisites incomplete; rework needed.',
    checkpointType: 'inspection-pass',
    authorityType: 'project-manager',
  },
  {
    id: 'fixture-cp-004' as PccApprovalCheckpointId,
    workflowItemId: 'fixture-wi-002' as PccWorkflowItemId,
    requiredPersona: 'project-executive',
    state: 'waived',
    requestedAtUtc: '2026-04-22T08:00:00Z',
    decidedAtUtc: '2026-04-22T11:00:00Z',
    decidedByUpn: PE_UPN,
    decisionNote: 'Waived per documented exception in startup register.',
    checkpointType: 'generic',
    authorityType: 'combined',
  },
];

export const SAMPLE_REVIEWER_ACTIONS: readonly IReviewerActionRecord[] = [
  {
    id: 'fixture-ra-001',
    checkpointId: 'fixture-cp-001' as PccApprovalCheckpointId,
    action: 'request-changes',
    actorUpn: PE_UPN,
    actorPersona: 'project-executive',
    occurredAtUtc: '2026-04-25T13:00:00Z',
    note: 'Need updated cost forecast before approval.',
  },
  {
    id: 'fixture-ra-002',
    checkpointId: 'fixture-cp-002' as PccApprovalCheckpointId,
    action: 'approve',
    actorUpn: 'admin-sample@example.com',
    actorPersona: 'pcc-admin',
    occurredAtUtc: '2026-04-26T10:15:00Z',
  },
  {
    id: 'fixture-ra-003',
    checkpointId: 'fixture-cp-001' as PccApprovalCheckpointId,
    action: 'delegate',
    actorUpn: PM_UPN,
    actorPersona: 'project-manager',
    delegatedToUpn: SUPER_UPN,
    occurredAtUtc: '2026-04-25T16:00:00Z',
    note: 'Delegating mobilization sub-checkpoint to superintendent.',
  },
];

// ===========================================================================
// Wave 14 — Approvals & Checkpoints fixtures
//
// Eight families: policy, registry, detail, history, queue, escalation,
// admin-verification, analytics. Plus bridge fixtures that demonstrate
// the legacy IApprovalCheckpoint -> ICheckpointInstance map.
//
// All deterministic. No live UPNs (only example.com). No live URLs
// (only example.invalid pseudo-paths or evidence:// pseudo-references).
// All branded ids via `as const` casts.
// ===========================================================================

const WAVE14_PROJECT_ID = 'p-wave14-approvals-sample' as PccProjectId;
const ADMIN_UPN = 'admin-sample@example.com';
const EXEC_UPN = 'exec-sample@example.com';
const CHIEF_EST_UPN = 'chief-est-sample@example.com';
const PRECON_DIR_UPN = 'precon-director-sample@example.com';
const ACCT_UPN = 'acct-sample@example.com';
const SAFETY_UPN = 'safety-sample@example.com';
const INTEGRATION_ADMIN_UPN = 'integration-admin-sample@example.com';
const POLICY_ENGINE_UPN = 'system:policy-engine@example.com';

// ---------------------------------------------------------------------------
// Policy family (3 policies covering all 8 modes across them)
// ---------------------------------------------------------------------------

export const SAMPLE_APPROVAL_POLICIES: readonly IApprovalPolicy[] = [
  {
    id: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    name: 'Startup Readiness Approval Policy',
    version: '1.0.0',
    approvalModes: ['sequential', 'single-approver', 'admin-verification'],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'defer',
      'escalate',
      'cancel',
      'supersede',
    ],
    escalationRules: [
      'overdue-by-3-business-days escalates to Project Executive',
      'high-risk projects escalate to Executive Oversight',
    ],
    description: 'Sequential review for startup readiness with admin verification of technical controls.',
    tags: ['startup', 'readiness', 'wave-14-fixture'],
  },
  {
    id: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    name: 'Permit Issuance Approval Policy',
    version: '1.1.0',
    approvalModes: ['parallel-all', 'admin-verification', 'escalation-review'],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'waive-with-reason',
      'override-with-reason',
      'escalate',
      'manual-close',
    ],
    escalationRules: [
      'AHJ-issued rejection escalates to Project Executive',
      'parallel-all rejection by any approver fails fast',
    ],
    description: 'Parallel-all approval for permit issuance; admin-verification for AHJ mapping.',
    tags: ['permit', 'parallel-all', 'wave-14-fixture'],
  },
  {
    id: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
    name: 'Estimating Workbench Handoff Policy',
    version: '0.9.0',
    approvalModes: [
      'parallel-any',
      'advisory-review',
      'acknowledgement-only',
      'escalation-review',
    ],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'acknowledge',
      'waive-with-reason',
      'escalate',
    ],
    escalationRules: [
      'Wave 13G handoff freeze escalates to Director of Preconstruction',
      'advisory-review captures legal/compliance comments without business approval',
    ],
    description: 'Estimating workbench handoff/freeze with advisory and acknowledgement gates.',
    tags: ['estimating', 'wave-13g', 'handoff', 'wave-14-fixture'],
  },
];

export const SAMPLE_APPROVAL_POLICY_VERSIONS: readonly IApprovalPolicyVersion[] = [
  {
    id: 'policy-version-startup-readiness-1-0-0' as PccApprovalPolicyVersionId,
    policyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    version: '1.0.0',
    effectiveFrom: '2026-04-01T00:00:00Z',
    approvalModes: ['sequential', 'single-approver', 'admin-verification'],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'defer',
      'escalate',
      'cancel',
      'supersede',
    ],
    notes: 'Initial Wave 14 policy version.',
  },
  {
    id: 'policy-version-permit-issuance-1-1-0' as PccApprovalPolicyVersionId,
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    version: '1.1.0',
    effectiveFrom: '2026-04-15T00:00:00Z',
    approvalModes: ['parallel-all', 'admin-verification', 'escalation-review'],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'waive-with-reason',
      'override-with-reason',
      'escalate',
      'manual-close',
    ],
    notes: 'Adds parallel-all rejection fail-fast.',
  },
  {
    id: 'policy-version-estimating-handoff-0-9-0' as PccApprovalPolicyVersionId,
    policyId: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
    version: '0.9.0',
    effectiveFrom: '2026-04-20T00:00:00Z',
    approvalModes: [
      'parallel-any',
      'advisory-review',
      'acknowledgement-only',
      'escalation-review',
    ],
    decisionActions: [
      'approve',
      'reject-return',
      'request-revision',
      'acknowledge',
      'waive-with-reason',
      'escalate',
    ],
    notes: 'Pre-1.0 policy aligned with Wave 13G handoff contract.',
  },
];

// ---------------------------------------------------------------------------
// Registry family — checkpoint definitions (one per kind family)
// ---------------------------------------------------------------------------

export const SAMPLE_CHECKPOINT_DEFINITIONS: readonly ICheckpointDefinition[] = [
  {
    id: 'def-access-security-approval' as PccCheckpointDefinitionId,
    sourceModule: 'team-and-access',
    kind: 'access-security-approval',
    validationRuleIds: ['APR-VAL-001', 'APR-VAL-011', 'APR-VAL-014'],
    ownerRole: 'pcc-admin',
    description: 'Access/security approval before tenant role grants.',
    defaultApprovalPolicyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
  },
  {
    id: 'def-technical-admin-checkpoint' as PccCheckpointDefinitionId,
    sourceModule: 'external-systems',
    kind: 'technical-admin-checkpoint',
    validationRuleIds: ['APR-VAL-013', 'APR-VAL-014'],
    ownerRole: 'it-admin',
    description: 'Technical admin verification of integration controls.',
  },
  {
    id: 'def-workflow-item-review' as PccCheckpointDefinitionId,
    sourceModule: 'document-control',
    kind: 'workflow-item-review',
    validationRuleIds: ['APR-VAL-001', 'APR-VAL-005'],
    ownerRole: 'project-manager',
    description: 'Workflow item review for document-control items.',
  },
  {
    id: 'def-external-system-mapping-correction' as PccCheckpointDefinitionId,
    sourceModule: 'external-systems',
    kind: 'external-system-mapping-correction',
    validationRuleIds: ['APR-VAL-013'],
    ownerRole: 'pcc-admin',
    description: 'Mapping correction for external system records.',
  },
  {
    id: 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId,
    sourceModule: 'project-readiness',
    kind: 'readiness-gate-checkpoint',
    validationRuleIds: ['APR-VAL-008', 'APR-VAL-006'],
    ownerRole: 'project-executive',
    description: 'Readiness gate approval for project lifecycle progression.',
  },
  {
    id: 'def-exception-waiver-override' as PccCheckpointDefinitionId,
    sourceModule: 'constraints-log',
    kind: 'exception-waiver-override',
    validationRuleIds: ['APR-VAL-004', 'APR-VAL-005', 'APR-VAL-008'],
    ownerRole: 'project-executive',
    description: 'Constraint exception via waiver/override decision.',
  },
  {
    id: 'def-executive-escalation' as PccCheckpointDefinitionId,
    sourceModule: 'responsibility-matrix',
    kind: 'executive-escalation',
    validationRuleIds: ['APR-VAL-011'],
    ownerRole: 'executive-oversight',
    description: 'Executive escalation review.',
  },
  {
    id: 'def-handoff-freeze-checkpoint' as PccCheckpointDefinitionId,
    sourceModule: 'estimating-workbench-wave-13g',
    kind: 'handoff-freeze-checkpoint',
    validationRuleIds: ['APR-VAL-010', 'APR-VAL-016'],
    ownerRole: 'director-of-preconstruction',
    description: 'Estimating handoff/freeze gate (Wave 13G aligned).',
    defaultApprovalPolicyId: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
  },
  {
    id: 'def-estimating-workbench-checkpoint' as PccCheckpointDefinitionId,
    sourceModule: 'estimating-workbench-wave-13g',
    kind: 'estimating-workbench-checkpoint',
    validationRuleIds: ['APR-VAL-016'],
    ownerRole: 'chief-estimator',
    description: 'Estimating workbench in-progress review checkpoint.',
  },
  {
    id: 'def-site-health-repair-request-review' as PccCheckpointDefinitionId,
    sourceModule: 'site-health',
    kind: 'site-health-repair-request-review',
    validationRuleIds: ['APR-VAL-005'],
    ownerRole: 'pcc-admin',
    description: 'Repair-request review prior to manual close.',
  },
];

// ---------------------------------------------------------------------------
// Detail family — fully structured approval requests covering 11 actions
// and a representative set of states. Each request is paired with one
// route, one step, one participant, and one decision.
// ---------------------------------------------------------------------------

const REQ_PE = 'project-executive' as const;
const REQ_PM = 'project-manager' as const;
const REQ_PCC_ADMIN = 'pcc-admin' as const;
const REQ_IT_ADMIN = 'it-admin' as const;
const REQ_EXEC = 'executive-oversight' as const;
const REQ_PRECON_DIR = 'director-of-preconstruction' as const;
const REQ_SAFETY = 'safety-qaqc' as const;
const REQ_OWNER = 'owner-client-viewer' as const;

interface RequestSeed {
  readonly key: string;
  readonly state: IApprovalRequest['state'];
  readonly policyId: PccApprovalPolicyId;
  readonly mode: IApprovalStep['mode'];
  readonly assignedRole: IApprovalParticipant['role'];
  readonly priority?: IApprovalRequest['priority'];
}

const REQUEST_SEEDS: readonly RequestSeed[] = [
  {
    key: 'A-approve',
    state: 'approved',
    policyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    mode: 'single-approver',
    assignedRole: REQ_PE,
    priority: 'high',
  },
  {
    key: 'B-reject-return',
    state: 'rejected-returned',
    policyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    mode: 'single-approver',
    assignedRole: REQ_PM,
  },
  {
    key: 'C-request-revision',
    state: 'in-review',
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    mode: 'sequential',
    assignedRole: REQ_PM,
  },
  {
    key: 'D-acknowledge',
    state: 'approved',
    policyId: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
    mode: 'acknowledgement-only',
    assignedRole: REQ_OWNER,
  },
  {
    key: 'E-defer',
    state: 'deferred',
    policyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    mode: 'single-approver',
    assignedRole: REQ_PE,
  },
  {
    key: 'F-waive',
    state: 'waived',
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    mode: 'parallel-all',
    assignedRole: REQ_PE,
    priority: 'urgent',
  },
  {
    key: 'G-override',
    state: 'overridden',
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    mode: 'parallel-all',
    assignedRole: REQ_EXEC,
  },
  {
    key: 'H-escalate',
    state: 'escalated',
    policyId: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
    mode: 'escalation-review',
    assignedRole: REQ_PRECON_DIR,
  },
  {
    key: 'I-cancel',
    state: 'cancelled',
    policyId: 'policy-pcc-startup-readiness' as PccApprovalPolicyId,
    mode: 'sequential',
    assignedRole: REQ_PCC_ADMIN,
  },
  {
    key: 'J-supersede',
    state: 'superseded',
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    mode: 'parallel-any',
    assignedRole: REQ_PCC_ADMIN,
  },
  {
    key: 'K-manual-close',
    state: 'manually-closed',
    policyId: 'policy-pcc-permit-issuance' as PccApprovalPolicyId,
    mode: 'admin-verification',
    assignedRole: REQ_IT_ADMIN,
  },
  {
    key: 'L-advisory-review',
    state: 'in-review',
    policyId: 'policy-pcc-estimating-handoff' as PccApprovalPolicyId,
    mode: 'advisory-review',
    assignedRole: REQ_SAFETY,
  },
];

function reqId(key: string): PccApprovalRequestId {
  return `req-w14-${key}` as PccApprovalRequestId;
}
function routeId(key: string): PccApprovalRouteId {
  return `route-w14-${key}` as PccApprovalRouteId;
}
function stepId(key: string): PccApprovalStepId {
  return `step-w14-${key}` as PccApprovalStepId;
}
function participantId(key: string): PccApprovalParticipantId {
  return `participant-w14-${key}` as PccApprovalParticipantId;
}
function decisionId(key: string): PccApprovalDecisionId {
  return `decision-w14-${key}` as PccApprovalDecisionId;
}
function srcRefId(key: string): PccCheckpointSourceReferenceId {
  return `srcref-w14-${key}` as PccCheckpointSourceReferenceId;
}

const REQUEST_CREATED_AT_BASE = '2026-04-15T08:00:00Z';
const DECISION_AT_BASE = '2026-04-20T10:00:00Z';

export const SAMPLE_APPROVAL_REQUESTS: readonly IApprovalRequest[] = REQUEST_SEEDS.map(
  (seed, i): IApprovalRequest => ({
    id: reqId(seed.key),
    projectId: WAVE14_PROJECT_ID,
    sourceReferenceIds: [srcRefId(seed.key) as unknown as string],
    approvalPolicyId: seed.policyId,
    routeId: routeId(seed.key),
    createdByPrincipalKey: ADMIN_UPN,
    createdAtUtc: addMinutes(REQUEST_CREATED_AT_BASE, i),
    state: seed.state,
    title: `Wave 14 fixture request ${seed.key}`,
    description: `Deterministic Wave 14 ${seed.state} fixture demonstrating the ${seed.key} action path.`,
    tags: ['wave-14-fixture', seed.mode],
    currentStepId: stepId(seed.key),
    priority: seed.priority,
  }),
);

export const SAMPLE_APPROVAL_STEPS: readonly IApprovalStep[] = REQUEST_SEEDS.map(
  (seed): IApprovalStep => ({
    id: stepId(seed.key),
    routeId: routeId(seed.key),
    stepNumber: 1,
    mode: seed.mode,
    assignedRole: seed.assignedRole,
    assignedPrincipalKey: principalForRole(seed.assignedRole),
    delegationAllowed: false,
    completionRule: `Wave 14 fixture step (${seed.mode})`,
  }),
);

export const SAMPLE_APPROVAL_PARTICIPANTS: readonly IApprovalParticipant[] = REQUEST_SEEDS.map(
  (seed): IApprovalParticipant => ({
    id: participantId(seed.key),
    stepId: stepId(seed.key),
    principalKey: principalForRole(seed.assignedRole),
    role: seed.assignedRole,
    delegationAllowed: false,
  }),
);

export const SAMPLE_APPROVAL_ROUTES: readonly IApprovalRoute[] = REQUEST_SEEDS.map(
  (seed): IApprovalRoute => {
    const step = SAMPLE_APPROVAL_STEPS.find((s) => s.id === stepId(seed.key));
    if (!step) {
      throw new Error(`SAMPLE_APPROVAL_ROUTES: missing step for ${seed.key}`);
    }
    return {
      id: routeId(seed.key),
      approvalRequestId: reqId(seed.key),
      approvalPolicyId: seed.policyId,
      steps: [step],
      name: `Wave 14 fixture route ${seed.key}`,
      priority: seed.priority,
      delegationAllowed: false,
    };
  },
);

// ---------------------------------------------------------------------------
// History family — one decision per action plus audit events
// ---------------------------------------------------------------------------

function makeDecision(seed: RequestSeed, i: number): ApprovalDecision {
  const base = {
    id: decisionId(seed.key),
    approvalRequestId: reqId(seed.key),
    stepId: stepId(seed.key),
    participantId: participantId(seed.key),
    actorPrincipalKey: principalForRole(seed.assignedRole),
    actorRole: seed.assignedRole,
    decisionAtUtc: addMinutes(DECISION_AT_BASE, i),
  } as const;
  switch (seed.key) {
    case 'A-approve':
      return { ...base, action: 'approve', evidenceRefs: ['evidence://fixture-doc-A'] };
    case 'B-reject-return':
      return {
        ...base,
        action: 'reject-return',
        reasonCode: 'incomplete-evidence',
        comment: 'Need updated cost forecast and signed approver list.',
      };
    case 'C-request-revision':
      return {
        ...base,
        action: 'request-revision',
        reasonCode: 'evidence-update-required',
        comment: 'Attach permit application receipts.',
      };
    case 'D-acknowledge':
      return { ...base, action: 'acknowledge', comment: 'Acknowledged.' };
    case 'E-defer':
      return {
        ...base,
        action: 'defer',
        reasonCode: 'external-dependency',
        deferUntilUtc: '2026-05-15T08:00:00Z',
        followUpOwnerPrincipalKey: PE_UPN,
      };
    case 'F-waive':
      return {
        ...base,
        action: 'waive-with-reason',
        reasonCode: 'documented-alternate-control',
        evidenceRefs: ['evidence://fixture-doc-F-1', 'evidence://fixture-doc-F-2'],
        riskAcknowledgement: 'Acknowledged moderate risk; mitigation captured in alternate control.',
      };
    case 'G-override':
      return {
        ...base,
        action: 'override-with-reason',
        reasonCode: 'executive-direction',
        evidenceRefs: ['evidence://fixture-doc-G'],
        consequenceAcknowledgement: 'Executive accepts schedule consequence per project-critical-path-impact.',
      };
    case 'H-escalate':
      return {
        ...base,
        action: 'escalate',
        escalationReason: 'disputed-decision',
        escalationTargetRole: 'executive-oversight',
        comment: 'Estimating handoff disputed; escalating per policy.',
      };
    case 'I-cancel':
      return {
        ...base,
        action: 'cancel',
        reasonCode: 'duplicate-request',
        comment: 'Duplicate of req-w14-A-approve; canceling.',
      };
    case 'J-supersede':
      return {
        ...base,
        action: 'supersede',
        reasonCode: 'source-version-changed',
        replacementSourceReferenceId: 'srcref-w14-A-approve',
      };
    case 'K-manual-close':
      return {
        ...base,
        action: 'manual-close',
        reasonCode: 'admin-cleanup',
        evidenceRefs: ['evidence://fixture-doc-K'],
        comment: 'Manual close after execution-pending mapping completed.',
      };
    case 'L-advisory-review':
      return {
        ...base,
        action: 'request-revision',
        reasonCode: 'evidence-update-required',
        comment: 'Advisory reviewer requests updated evidence before continuing.',
      };
    default:
      throw new Error(`makeDecision: unhandled seed ${seed.key}`);
  }
}

export const SAMPLE_APPROVAL_DECISIONS: readonly ApprovalDecision[] = REQUEST_SEEDS.map(
  (seed, i) => makeDecision(seed, i),
);

const AUDIT_EVENT_AT_BASE = '2026-04-22T12:00:00Z';

export const SAMPLE_CHECKPOINT_AUDIT_EVENTS: readonly ICheckpointAuditEvent[] = [
  ...REQUEST_SEEDS.map((seed, i): ICheckpointAuditEvent => ({
    id: `audit-w14-${seed.key}` as PccCheckpointAuditEventId,
    approvalRequestId: reqId(seed.key),
    eventType: auditEventForState(seed.state),
    timestamp: addMinutes(AUDIT_EVENT_AT_BASE, i),
    actorPrincipalKey: principalForRole(seed.assignedRole),
    actorRole: seed.assignedRole,
  })),
  // Posture-only audit fixtures demonstrating refusal/blocked attempts.
  {
    id: 'audit-w14-hbi-attempt' as PccCheckpointAuditEventId,
    approvalRequestId: reqId('A-approve'),
    eventType: 'approval.hbi-decision-attempted',
    timestamp: '2026-04-23T09:00:00Z',
    actorPrincipalKey: 'hbi:assistant',
    actorRole: null,
    details: { ruleId: 'APR-VAL-012', attemptedAction: 'approve' },
  },
  {
    id: 'audit-w14-unauthorized-attempt' as PccCheckpointAuditEventId,
    approvalRequestId: reqId('B-reject-return'),
    eventType: 'approval.unauthorized-decision-attempted',
    timestamp: '2026-04-23T09:30:00Z',
    actorPrincipalKey: 'viewer-sample@example.com',
    actorRole: 'viewer',
    details: { ruleId: 'APR-VAL-011', attemptedAction: 'approve' },
  },
  {
    id: 'audit-w14-external-writeback' as PccCheckpointAuditEventId,
    approvalRequestId: reqId('K-manual-close'),
    eventType: 'approval.external-writeback-attempted',
    timestamp: '2026-04-23T10:00:00Z',
    actorPrincipalKey: INTEGRATION_ADMIN_UPN,
    actorRole: 'it-admin',
    details: { ruleId: 'APR-VAL-013', attemptedAction: 'manual-close' },
  },
  {
    id: 'audit-w14-tenant-mutation' as PccCheckpointAuditEventId,
    approvalRequestId: reqId('I-cancel'),
    eventType: 'approval.tenant-mutation-attempted',
    timestamp: '2026-04-23T10:30:00Z',
    actorPrincipalKey: ADMIN_UPN,
    actorRole: 'pcc-admin',
    details: { ruleId: 'APR-VAL-014', attemptedAction: 'cancel' },
  },
];

// ---------------------------------------------------------------------------
// Source references + evidence + priority-action links
// ---------------------------------------------------------------------------

export const SAMPLE_CHECKPOINT_SOURCE_REFERENCES: readonly ICheckpointSourceReference[] =
  REQUEST_SEEDS.map((seed): ICheckpointSourceReference => ({
    id: srcRefId(seed.key),
    approvalRequestId: reqId(seed.key),
    sourceModule: sourceModuleForKey(seed.key),
    sourceItemId: `source-item-${seed.key}`,
    sourceItemVersion: 'v1',
  }));

export const SAMPLE_CHECKPOINT_EVIDENCE_LINKS: readonly ICheckpointEvidenceLink[] = [
  {
    id: 'evidence-w14-A' as PccCheckpointEvidenceLinkId,
    decisionId: decisionId('A-approve') as unknown as string,
    evidenceType: 'document',
    evidenceReference: 'evidence://fixture-doc-A',
  },
  {
    id: 'evidence-w14-F-1' as PccCheckpointEvidenceLinkId,
    decisionId: decisionId('F-waive') as unknown as string,
    evidenceType: 'document',
    evidenceReference: 'evidence://fixture-doc-F-1',
  },
  {
    id: 'evidence-w14-F-2' as PccCheckpointEvidenceLinkId,
    decisionId: decisionId('F-waive') as unknown as string,
    evidenceType: 'risk-acknowledgement',
    evidenceReference: 'evidence://fixture-doc-F-2',
  },
  {
    id: 'evidence-w14-G' as PccCheckpointEvidenceLinkId,
    decisionId: decisionId('G-override') as unknown as string,
    evidenceType: 'executive-memo',
    evidenceReference: 'evidence://fixture-doc-G',
  },
  {
    id: 'evidence-w14-K' as PccCheckpointEvidenceLinkId,
    decisionId: decisionId('K-manual-close') as unknown as string,
    evidenceType: 'integration-mapping',
    evidenceReference: 'evidence://fixture-doc-K',
  },
];

export const SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS: readonly IApprovalPriorityActionLink[] = [
  {
    id: 'priority-link-w14-A' as PccApprovalPriorityActionLinkId,
    projectId: WAVE14_PROJECT_ID,
    approvalRequestId: reqId('A-approve'),
    currentStepId: stepId('A-approve'),
    actionType: 'approval-pending',
    createdAtUtc: '2026-04-15T08:01:00Z',
    state: 'resolved',
    resolvedAtUtc: '2026-04-20T10:00:00Z',
  },
  {
    id: 'priority-link-w14-C' as PccApprovalPriorityActionLinkId,
    projectId: WAVE14_PROJECT_ID,
    approvalRequestId: reqId('C-request-revision'),
    currentStepId: stepId('C-request-revision'),
    actionType: 'revision-required',
    createdAtUtc: '2026-04-15T08:03:00Z',
    state: 'open',
  },
  {
    id: 'priority-link-w14-H' as PccApprovalPriorityActionLinkId,
    projectId: WAVE14_PROJECT_ID,
    approvalRequestId: reqId('H-escalate'),
    currentStepId: stepId('H-escalate'),
    actionType: 'escalation-pending',
    createdAtUtc: '2026-04-15T08:08:00Z',
    state: 'open',
  },
  {
    id: 'priority-link-w14-K' as PccApprovalPriorityActionLinkId,
    projectId: WAVE14_PROJECT_ID,
    approvalRequestId: reqId('K-manual-close'),
    currentStepId: stepId('K-manual-close'),
    actionType: 'execution-pending',
    createdAtUtc: '2026-04-15T08:11:00Z',
    state: 'resolved',
    resolvedAtUtc: '2026-04-22T12:11:00Z',
  },
];

// ---------------------------------------------------------------------------
// Bridge fixtures — legacy IApprovalCheckpoint -> ICheckpointInstance
// ---------------------------------------------------------------------------

const LEGACY_BRIDGE_DEFINITION_BY_TYPE: Readonly<Record<string, PccCheckpointDefinitionId>> = {
  'startup-readiness': 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId,
  'permit-issuance': 'def-workflow-item-review' as PccCheckpointDefinitionId,
  'inspection-pass': 'def-workflow-item-review' as PccCheckpointDefinitionId,
  generic: 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId,
};

export const SAMPLE_LEGACY_CHECKPOINTS_AS_INSTANCES: readonly ICheckpointInstance[] =
  SAMPLE_APPROVAL_CHECKPOINTS.map((legacy) => {
    const kind = legacy.checkpointType ?? 'generic';
    return mapLegacyCheckpointToInstance(legacy, {
      definitionId:
        LEGACY_BRIDGE_DEFINITION_BY_TYPE[kind] ??
        ('def-readiness-gate-checkpoint' as PccCheckpointDefinitionId),
      sourceModule: 'project-readiness',
    });
  });

// ---------------------------------------------------------------------------
// Checkpoint instances — Wave 14 + state-coverage fillers + legacy bridges
// ---------------------------------------------------------------------------

const STATE_COVERAGE_FILLER_INSTANCES: readonly ICheckpointInstance[] = [
  {
    id: 'ci-state-draft' as PccCheckpointInstanceId,
    definitionId: 'def-workflow-item-review' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-draft',
    sourceModule: 'document-control',
    state: 'draft',
    createdAtUtc: '2026-04-10T08:00:00Z',
  },
  {
    id: 'ci-state-requested' as PccCheckpointInstanceId,
    definitionId: 'def-workflow-item-review' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-requested',
    sourceModule: 'document-control',
    state: 'requested',
    createdAtUtc: '2026-04-10T08:30:00Z',
  },
  {
    id: 'ci-state-revision-requested' as PccCheckpointInstanceId,
    definitionId: 'def-workflow-item-review' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-revision',
    sourceModule: 'document-control',
    state: 'revision-requested',
    createdAtUtc: '2026-04-10T09:00:00Z',
  },
  {
    id: 'ci-state-expired' as PccCheckpointInstanceId,
    definitionId: 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-expired',
    sourceModule: 'project-readiness',
    state: 'expired',
    createdAtUtc: '2026-04-10T09:30:00Z',
  },
  {
    id: 'ci-state-execution-pending' as PccCheckpointInstanceId,
    definitionId: 'def-technical-admin-checkpoint' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-execution',
    sourceModule: 'external-systems',
    state: 'execution-pending',
    createdAtUtc: '2026-04-10T10:00:00Z',
  },
  {
    id: 'ci-state-archived' as PccCheckpointInstanceId,
    definitionId: 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId,
    sourceItemId: 'source-item-state-archived',
    sourceModule: 'project-readiness',
    state: 'archived',
    createdAtUtc: '2026-04-10T10:30:00Z',
  },
];

const REQUEST_BACKED_INSTANCES: readonly ICheckpointInstance[] = REQUEST_SEEDS.map((seed) => ({
  id: `ci-w14-${seed.key}` as PccCheckpointInstanceId,
  definitionId: definitionForKey(seed.key),
  sourceItemId: `source-item-${seed.key}`,
  sourceModule: sourceModuleForKey(seed.key),
  state: seed.state,
  createdAtUtc: '2026-04-15T07:30:00Z',
  approvalRequestId: reqId(seed.key),
  priority: seed.priority,
}));

export const SAMPLE_CHECKPOINT_INSTANCES: readonly ICheckpointInstance[] = [
  ...REQUEST_BACKED_INSTANCES,
  ...STATE_COVERAGE_FILLER_INSTANCES,
  ...SAMPLE_LEGACY_CHECKPOINTS_AS_INSTANCES,
];

// ---------------------------------------------------------------------------
// Queue family — IApprovalQueueEntry views
// ---------------------------------------------------------------------------

const QUEUE_ENTRY_KEYS: readonly RequestSeed['key'][] = [
  'A-approve',
  'C-request-revision',
  'E-defer',
  'F-waive',
  'H-escalate',
];

export const SAMPLE_APPROVAL_QUEUE_ENTRIES: readonly IApprovalQueueEntry[] =
  REQUEST_SEEDS.filter((seed) => QUEUE_ENTRY_KEYS.includes(seed.key)).map(
    (seed): IApprovalQueueEntry => ({
      approvalRequestId: reqId(seed.key),
      projectId: WAVE14_PROJECT_ID,
      state: seed.state,
      currentStepId: stepId(seed.key),
      assignedRole: seed.assignedRole,
      priority: seed.priority,
      createdAtUtc: '2026-04-15T08:00:00Z',
      title: `Wave 14 fixture queue entry ${seed.key}`,
    }),
  );

export const SAMPLE_APPROVAL_QUEUE_VIEW: ApprovalQueueReadModel = {
  entries: SAMPLE_APPROVAL_QUEUE_ENTRIES,
};

export const SAMPLE_MY_APPROVALS_VIEW: MyApprovalsReadModel = {
  viewerPrincipalKey: PE_UPN,
  viewerRole: 'project-executive',
  entries: SAMPLE_APPROVAL_QUEUE_ENTRIES.filter((e) => e.assignedRole === 'project-executive'),
};

// ---------------------------------------------------------------------------
// Escalation family
// ---------------------------------------------------------------------------

export const SAMPLE_ESCALATION_QUEUE_ENTRIES: readonly IEscalationQueueEntry[] = [
  {
    approvalRequestId: reqId('H-escalate'),
    projectId: WAVE14_PROJECT_ID,
    state: 'escalated',
    currentStepId: stepId('H-escalate'),
    assignedRole: 'executive-oversight',
    priority: 'high',
    createdAtUtc: '2026-04-15T08:08:00Z',
    title: 'Wave 14 fixture escalation entry H',
    escalationReason: 'disputed-decision',
    escalationTargetRole: 'executive-oversight',
  },
];

export const SAMPLE_ESCALATION_QUEUE_VIEW: EscalationQueueReadModel = {
  entries: SAMPLE_ESCALATION_QUEUE_ENTRIES,
};

// ---------------------------------------------------------------------------
// Admin verification family
// ---------------------------------------------------------------------------

export const SAMPLE_ADMIN_VERIFICATION_QUEUE_ENTRIES: readonly IAdminVerificationQueueEntry[] = [
  {
    approvalRequestId: reqId('K-manual-close'),
    projectId: WAVE14_PROJECT_ID,
    state: 'manually-closed',
    currentStepId: stepId('K-manual-close'),
    assignedRole: 'it-admin',
    priority: 'normal',
    createdAtUtc: '2026-04-15T08:11:00Z',
    title: 'Wave 14 fixture admin-verification entry K',
    verificationKind: 'technical-admin-checkpoint',
  },
];

export const SAMPLE_ADMIN_VERIFICATION_QUEUE_VIEW: AdminVerificationQueueReadModel = {
  entries: SAMPLE_ADMIN_VERIFICATION_QUEUE_ENTRIES,
};

// ---------------------------------------------------------------------------
// Detail family — full read model assembled from above
// ---------------------------------------------------------------------------

export const SAMPLE_APPROVAL_DETAIL_VIEW: ApprovalDetailReadModel = {
  request: SAMPLE_APPROVAL_REQUESTS[0]!,
  route: SAMPLE_APPROVAL_ROUTES[0]!,
  steps: SAMPLE_APPROVAL_STEPS.filter((s) => s.routeId === SAMPLE_APPROVAL_ROUTES[0]!.id),
  participants: SAMPLE_APPROVAL_PARTICIPANTS.filter(
    (p) => p.stepId === SAMPLE_APPROVAL_STEPS[0]!.id,
  ),
  decisions: SAMPLE_APPROVAL_DECISIONS.filter(
    (d) => d.approvalRequestId === SAMPLE_APPROVAL_REQUESTS[0]!.id,
  ),
  evidenceLinks: SAMPLE_CHECKPOINT_EVIDENCE_LINKS.filter(
    (e) =>
      e.decisionId ===
      (decisionId(REQUEST_SEEDS[0]!.key) as unknown as string),
  ),
  sourceReferences: SAMPLE_CHECKPOINT_SOURCE_REFERENCES.filter(
    (r) => r.approvalRequestId === SAMPLE_APPROVAL_REQUESTS[0]!.id,
  ),
};

// ---------------------------------------------------------------------------
// Registry view + decision history view
// ---------------------------------------------------------------------------

export const SAMPLE_CHECKPOINT_REGISTRY_VIEW: CheckpointRegistryReadModel = {
  definitions: SAMPLE_CHECKPOINT_DEFINITIONS,
  checkpointInstances: SAMPLE_CHECKPOINT_INSTANCES,
};

export const SAMPLE_DECISION_HISTORY_VIEW: DecisionHistoryReadModel = {
  approvalRequestId: SAMPLE_APPROVAL_REQUESTS[0]!.id,
  decisions: SAMPLE_APPROVAL_DECISIONS.filter(
    (d) => d.approvalRequestId === SAMPLE_APPROVAL_REQUESTS[0]!.id,
  ),
  auditEvents: SAMPLE_CHECKPOINT_AUDIT_EVENTS.filter(
    (e) => e.approvalRequestId === SAMPLE_APPROVAL_REQUESTS[0]!.id,
  ),
};

// ---------------------------------------------------------------------------
// Policy view + analytics view
// ---------------------------------------------------------------------------

export const SAMPLE_APPROVAL_POLICY_VIEW: ApprovalPolicyReadModel = {
  policies: SAMPLE_APPROVAL_POLICIES,
  versions: SAMPLE_APPROVAL_POLICY_VERSIONS,
};

function buildAnalyticsView(): ApprovalAnalyticsReadModel {
  const countsByState: Record<string, number> = {
    draft: 0,
    requested: 0,
    'pending-review': 0,
    'in-review': 0,
    'revision-requested': 0,
    approved: 0,
    'rejected-returned': 0,
    deferred: 0,
    waived: 0,
    overridden: 0,
    escalated: 0,
    cancelled: 0,
    superseded: 0,
    expired: 0,
    'execution-pending': 0,
    'manually-closed': 0,
    archived: 0,
  };
  for (const ci of SAMPLE_CHECKPOINT_INSTANCES) {
    countsByState[ci.state] = (countsByState[ci.state] ?? 0) + 1;
  }
  const countsByMode: Record<string, number> = {};
  for (const step of SAMPLE_APPROVAL_STEPS) {
    countsByMode[step.mode] = (countsByMode[step.mode] ?? 0) + 1;
  }
  const countsBySourceModule: Record<string, number> = {
    'team-and-access': 0,
    'document-control': 0,
    'project-lifecycle-readiness-center': 0,
    'permit-and-inspection-control-center': 0,
    'responsibility-matrix': 0,
    'constraints-log': 0,
    'buyout-log': 0,
    'estimating-workbench-wave-13g': 0,
    'external-systems': 0,
    'site-health': 0,
    'priority-actions': 0,
    'project-readiness': 0,
    'executive-oversight': 0,
    'admin-review-surfaces': 0,
  };
  for (const ci of SAMPLE_CHECKPOINT_INSTANCES) {
    countsBySourceModule[ci.sourceModule] =
      (countsBySourceModule[ci.sourceModule] ?? 0) + 1;
  }
  return {
    totalRequests: SAMPLE_APPROVAL_REQUESTS.length,
    countsByState: countsByState as ApprovalAnalyticsReadModel['countsByState'],
    countsByMode,
    countsBySourceModule:
      countsBySourceModule as ApprovalAnalyticsReadModel['countsBySourceModule'],
  };
}

export const SAMPLE_APPROVAL_ANALYTICS_VIEW: ApprovalAnalyticsReadModel = buildAnalyticsView();

// ---------------------------------------------------------------------------
// Helpers (module-private)
// ---------------------------------------------------------------------------

function principalForRole(role: IApprovalParticipant['role']): string {
  switch (role) {
    case 'pcc-admin':
      return ADMIN_UPN;
    case 'it-admin':
      return INTEGRATION_ADMIN_UPN;
    case 'executive-oversight':
      return EXEC_UPN;
    case 'project-executive':
      return PE_UPN;
    case 'project-manager':
      return PM_UPN;
    case 'superintendent':
      return SUPER_UPN;
    case 'project-accounting':
      return ACCT_UPN;
    case 'safety-qaqc':
      return SAFETY_UPN;
    case 'chief-estimator':
      return CHIEF_EST_UPN;
    case 'director-of-preconstruction':
      return PRECON_DIR_UPN;
    case 'owner-client-viewer':
      return 'owner-sample@example.com';
    default:
      return POLICY_ENGINE_UPN;
  }
}

function definitionForKey(key: string): PccCheckpointDefinitionId {
  switch (key) {
    case 'A-approve':
    case 'E-defer':
      return 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId;
    case 'B-reject-return':
      return 'def-workflow-item-review' as PccCheckpointDefinitionId;
    case 'C-request-revision':
    case 'F-waive':
    case 'G-override':
    case 'J-supersede':
      return 'def-workflow-item-review' as PccCheckpointDefinitionId;
    case 'D-acknowledge':
    case 'H-escalate':
    case 'L-advisory-review':
      return 'def-handoff-freeze-checkpoint' as PccCheckpointDefinitionId;
    case 'I-cancel':
      return 'def-exception-waiver-override' as PccCheckpointDefinitionId;
    case 'K-manual-close':
      return 'def-technical-admin-checkpoint' as PccCheckpointDefinitionId;
    default:
      return 'def-readiness-gate-checkpoint' as PccCheckpointDefinitionId;
  }
}

function sourceModuleForKey(
  key: string,
): ICheckpointInstance['sourceModule'] {
  switch (key) {
    case 'A-approve':
    case 'E-defer':
      return 'project-readiness';
    case 'B-reject-return':
    case 'C-request-revision':
    case 'F-waive':
    case 'G-override':
    case 'J-supersede':
      return 'document-control';
    case 'D-acknowledge':
    case 'H-escalate':
    case 'L-advisory-review':
      return 'estimating-workbench-wave-13g';
    case 'I-cancel':
      return 'constraints-log';
    case 'K-manual-close':
      return 'external-systems';
    default:
      return 'project-readiness';
  }
}

function auditEventForState(
  state: IApprovalRequest['state'],
): ICheckpointAuditEvent['eventType'] {
  switch (state) {
    case 'approved':
      return 'approval.approved';
    case 'rejected-returned':
      return 'approval.rejected-returned';
    case 'deferred':
      return 'approval.deferred';
    case 'waived':
      return 'approval.waived';
    case 'overridden':
      return 'approval.overridden';
    case 'escalated':
      return 'approval.escalated';
    case 'cancelled':
      return 'approval.cancelled';
    case 'superseded':
      return 'approval.superseded';
    case 'manually-closed':
      return 'approval.manually-closed';
    case 'in-review':
      return 'approval.review-started';
    default:
      return 'approval.queued';
  }
}

/**
 * Add `minutes` to an ISO 8601 UTC string. Pure; deterministic; uses
 * Date math against the supplied input only. No clock reads, no random
 * sources (per fixture determinism guard).
 */
function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString();
}
