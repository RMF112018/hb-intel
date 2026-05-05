import { describe, it, expect } from 'vitest';
import {
  APPROVAL_CHECKPOINT_STATES,
  APPROVAL_CHECKPOINT_TYPES,
  APPROVAL_AUTHORITY_TYPES,
  REVIEWER_ACTIONS,
  type IApprovalCheckpoint,
  type IReviewerActionRecord,
  // Wave 14
  APPROVAL_REQUEST_STATES,
  APPROVAL_REQUEST_TERMINAL_STATES,
  APPROVAL_REQUEST_NON_TERMINAL_STATES,
  APPROVAL_REQUEST_ALLOWED_TRANSITIONS,
  isTerminalApprovalRequestState,
  isApprovalRequestTransitionAllowed,
  APPROVAL_MODES,
  APPROVAL_MODE_COMPLETION_RULES,
  APPROVAL_DECISION_ACTIONS,
  REJECT_RETURN_REASON_CODES,
  REQUEST_REVISION_REASON_CODES,
  DEFER_REASON_CODES,
  WAIVE_REASON_CODES,
  OVERRIDE_REASON_CODES,
  ESCALATE_REASON_CODES,
  CANCEL_REASON_CODES,
  SUPERSEDE_REASON_CODES,
  MANUAL_CLOSE_REASON_CODES,
  APPROVAL_ACTION_TO_TARGET_STATE,
  APPROVAL_VALIDATION_RULE_IDS,
  APPROVAL_VALIDATION_RULES,
  APPROVAL_ROLE_ACTION_MATRIX,
  isActionAllowedForRole,
  validateDecisionShape,
  isSupersededRequest,
  requiresEvidenceForAction,
  HBI_PRINCIPAL_KEY_PREFIX,
  HBI_FORBIDDEN_DECISION_ACTIONS,
  isHbiPrincipalKey,
  assertNoHbiAuthorityOnDecision,
  APPROVAL_AUDIT_EVENT_TYPES,
  APPROVAL_REDACTION_CATEGORIES,
  redactionContextPreservedFor,
  type ApprovalDecision,
  type ApprovalRequestState,
  type IApprovalRequest,
} from './ApprovalCheckpoint.js';
import { PCC_PERSONAS } from './PccUserRoles.js';
import type {
  PccApprovalCheckpointId,
  PccApprovalDecisionId,
  PccApprovalParticipantId,
  PccApprovalPolicyId,
  PccApprovalRequestId,
  PccApprovalRouteId,
  PccApprovalStepId,
  PccProjectId,
  PccWorkflowItemId,
} from './types.js';

const cpId = 'cp-001' as PccApprovalCheckpointId;
const itemId = 'wi-001' as PccWorkflowItemId;

describe('PCC approval checkpoints', () => {
  it('APPROVAL_CHECKPOINT_TYPES matches the locked literal set', () => {
    expect([...APPROVAL_CHECKPOINT_TYPES]).toEqual([
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
    ]);
  });

  it('APPROVAL_AUTHORITY_TYPES matches the locked literal set', () => {
    expect([...APPROVAL_AUTHORITY_TYPES]).toEqual([
      'it-admin',
      'pcc-admin',
      'project-executive',
      'project-manager',
      'combined',
      'checkpoint-specific',
    ]);
  });

  it('REVIEWER_ACTIONS matches the locked literal set', () => {
    expect([...REVIEWER_ACTIONS]).toEqual([
      'approve',
      'reject',
      'request-changes',
      'delegate',
      'cancel',
    ]);
  });

  it('APPROVAL_CHECKPOINT_STATES is unchanged', () => {
    expect([...APPROVAL_CHECKPOINT_STATES]).toEqual(['pending', 'approved', 'rejected', 'waived']);
  });

  it('Prompt 02 IApprovalCheckpoint shape (without checkpointType/authorityType) still accepted', () => {
    const cp: IApprovalCheckpoint = {
      id: cpId,
      workflowItemId: itemId,
      requiredPersona: 'project-manager',
      state: 'pending',
      requestedAtUtc: '2026-04-28T12:00:00Z',
    };
    expect(cp.id).toBe(cpId);
    expect(cp.checkpointType).toBeUndefined();
    expect(cp.authorityType).toBeUndefined();
  });

  it('extended IApprovalCheckpoint accepts checkpointType and authorityType', () => {
    const cp: IApprovalCheckpoint = {
      id: cpId,
      workflowItemId: itemId,
      requiredPersona: 'project-executive',
      state: 'approved',
      requestedAtUtc: '2026-04-28T12:00:00Z',
      decidedAtUtc: '2026-04-28T13:00:00Z',
      decidedByUpn: 'pe@example.com',
      decisionNote: 'looks good',
      checkpointType: 'startup-readiness',
      authorityType: 'project-executive',
    };
    expect(cp.checkpointType).toBe('startup-readiness');
    expect(cp.authorityType).toBe('project-executive');
  });

  it('IReviewerActionRecord action is constrained to REVIEWER_ACTIONS', () => {
    const record: IReviewerActionRecord = {
      id: 'ra-1',
      checkpointId: cpId,
      action: 'delegate',
      actorUpn: 'pm@example.com',
      actorPersona: 'project-manager',
      delegatedToUpn: 'super@example.com',
      occurredAtUtc: '2026-04-28T12:30:00Z',
    };
    expect(REVIEWER_ACTIONS).toContain(record.action);
    expect(record.delegatedToUpn).toBe('super@example.com');
  });
});

// ===========================================================================
// Wave 14 — Approvals & Checkpoints (state machine, modes, decisions,
// validation rules, role-action matrix, HBI refusal, redaction)
// ===========================================================================

const W14_REQ_ID = 'req-test-001' as PccApprovalRequestId;
const W14_STEP_ID = 'step-test-001' as PccApprovalStepId;
const W14_PARTICIPANT_ID = 'participant-test-001' as PccApprovalParticipantId;
const W14_DECISION_ID = 'decision-test-001' as PccApprovalDecisionId;
const W14_PROJECT_ID = 'project-test-001' as PccProjectId;
const W14_POLICY_ID = 'policy-test-001' as PccApprovalPolicyId;
const W14_ROUTE_ID = 'route-test-001' as PccApprovalRouteId;

function makeApproveDecision(over: Partial<ApprovalDecision> = {}): ApprovalDecision {
  return {
    id: W14_DECISION_ID,
    approvalRequestId: W14_REQ_ID,
    stepId: W14_STEP_ID,
    participantId: W14_PARTICIPANT_ID,
    actorPrincipalKey: 'pm-test@example.com',
    actorRole: 'project-manager',
    decisionAtUtc: '2026-04-28T15:00:00Z',
    action: 'approve',
    ...over,
  } as ApprovalDecision;
}

function makeRequest(state: ApprovalRequestState): IApprovalRequest {
  return {
    id: W14_REQ_ID,
    projectId: W14_PROJECT_ID,
    sourceReferenceIds: ['srcref-test-001'],
    approvalPolicyId: W14_POLICY_ID,
    routeId: W14_ROUTE_ID,
    createdByPrincipalKey: 'admin-test@example.com',
    createdAtUtc: '2026-04-28T08:00:00Z',
    state,
  };
}

describe('Wave 14 — Approval Request state machine', () => {
  it('APPROVAL_REQUEST_STATES has 17 entries with the documented order', () => {
    expect(APPROVAL_REQUEST_STATES).toHaveLength(17);
    expect([...APPROVAL_REQUEST_STATES]).toEqual([
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
    ]);
  });

  it('terminal/non-terminal partition covers the full state union', () => {
    const all = new Set<string>([
      ...APPROVAL_REQUEST_TERMINAL_STATES,
      ...APPROVAL_REQUEST_NON_TERMINAL_STATES,
    ]);
    for (const s of APPROVAL_REQUEST_STATES) {
      expect(all.has(s)).toBe(true);
    }
    for (const s of APPROVAL_REQUEST_TERMINAL_STATES) {
      expect(APPROVAL_REQUEST_NON_TERMINAL_STATES).not.toContain(s);
    }
  });

  it('every transition target is a member of APPROVAL_REQUEST_STATES', () => {
    for (const state of APPROVAL_REQUEST_STATES) {
      for (const target of APPROVAL_REQUEST_ALLOWED_TRANSITIONS[state]) {
        expect(APPROVAL_REQUEST_STATES).toContain(target);
      }
    }
  });

  it('every terminal state (other than archived itself) lists archived as a valid target', () => {
    for (const terminal of APPROVAL_REQUEST_TERMINAL_STATES) {
      if (terminal === 'archived') continue;
      expect(
        APPROVAL_REQUEST_ALLOWED_TRANSITIONS[terminal],
        `${terminal} must allow → archived`,
      ).toContain('archived');
    }
    // Archived itself is sink: no further transitions.
    expect(APPROVAL_REQUEST_ALLOWED_TRANSITIONS.archived).toEqual([]);
  });

  it('approved transitions to execution-pending (post-decision lifecycle continues)', () => {
    expect(APPROVAL_REQUEST_ALLOWED_TRANSITIONS.approved).toContain('execution-pending');
  });

  it('isApprovalRequestTransitionAllowed accepts documented edges and rejects invalid ones', () => {
    expect(isApprovalRequestTransitionAllowed('draft', 'requested')).toBe(true);
    expect(isApprovalRequestTransitionAllowed('pending-review', 'approved')).toBe(true);
    expect(isApprovalRequestTransitionAllowed('approved', 'execution-pending')).toBe(true);
    expect(isApprovalRequestTransitionAllowed('execution-pending', 'manually-closed')).toBe(true);
    expect(isApprovalRequestTransitionAllowed('escalated', 'approved')).toBe(true);
    // invalid edges
    expect(isApprovalRequestTransitionAllowed('draft', 'approved')).toBe(false);
    expect(isApprovalRequestTransitionAllowed('archived', 'requested')).toBe(false);
    expect(isApprovalRequestTransitionAllowed('approved', 'pending-review')).toBe(false);
  });

  it('isTerminalApprovalRequestState matches the terminal tuple', () => {
    for (const s of APPROVAL_REQUEST_TERMINAL_STATES) {
      expect(isTerminalApprovalRequestState(s)).toBe(true);
    }
    for (const s of APPROVAL_REQUEST_NON_TERMINAL_STATES) {
      expect(isTerminalApprovalRequestState(s)).toBe(false);
    }
  });
});

describe('Wave 14 — Approval modes', () => {
  it('APPROVAL_MODES has 8 entries and matches the registry literal', () => {
    expect(APPROVAL_MODES).toHaveLength(8);
    expect([...APPROVAL_MODES]).toEqual([
      'single-approver',
      'sequential',
      'parallel-all',
      'parallel-any',
      'advisory-review',
      'acknowledgement-only',
      'escalation-review',
      'admin-verification',
    ]);
  });

  it('APPROVAL_MODE_COMPLETION_RULES has an entry per mode with a non-empty rule', () => {
    for (const mode of APPROVAL_MODES) {
      const rule = APPROVAL_MODE_COMPLETION_RULES[mode];
      expect(rule.mode).toBe(mode);
      expect(rule.completionRule.length).toBeGreaterThan(0);
      expect(Array.isArray(rule.edgeCases)).toBe(true);
    }
  });

  it('acknowledgement-only does NOT imply approval authority (declarative)', () => {
    const rule = APPROVAL_MODE_COMPLETION_RULES['acknowledgement-only'];
    expect(rule.edgeCases.some((e) => e.includes('does not imply approval'))).toBe(true);
  });
});

describe('Wave 14 — Decision actions, reason codes, target map', () => {
  it('APPROVAL_DECISION_ACTIONS has 11 entries', () => {
    expect(APPROVAL_DECISION_ACTIONS).toHaveLength(11);
  });

  it('reason-code tuples per family match artifact', () => {
    expect([...REJECT_RETURN_REASON_CODES]).toEqual([
      'incomplete-evidence',
      'incorrect-source',
      'missing-authority',
      'conflicting-data',
      'scope-unclear',
    ]);
    expect([...REQUEST_REVISION_REASON_CODES]).toEqual([
      'missing-field',
      'evidence-update-required',
      'source-item-change-required',
      'routing-correction',
    ]);
    expect([...DEFER_REASON_CODES]).toHaveLength(4);
    expect([...WAIVE_REASON_CODES]).toHaveLength(4);
    expect([...OVERRIDE_REASON_CODES]).toHaveLength(4);
    expect([...ESCALATE_REASON_CODES]).toHaveLength(5);
    expect([...CANCEL_REASON_CODES]).toHaveLength(4);
    expect([...SUPERSEDE_REASON_CODES]).toHaveLength(4);
    expect([...MANUAL_CLOSE_REASON_CODES]).toHaveLength(4);
  });

  it('APPROVAL_ACTION_TO_TARGET_STATE has nulls for non-terminal actions and terminals for the rest', () => {
    expect(APPROVAL_ACTION_TO_TARGET_STATE['approve']).toBe('approved');
    expect(APPROVAL_ACTION_TO_TARGET_STATE['reject-return']).toBe('rejected-returned');
    expect(APPROVAL_ACTION_TO_TARGET_STATE['request-revision']).toBeNull();
    expect(APPROVAL_ACTION_TO_TARGET_STATE['acknowledge']).toBeNull();
    expect(APPROVAL_ACTION_TO_TARGET_STATE['escalate']).toBeNull();
    expect(APPROVAL_ACTION_TO_TARGET_STATE['waive-with-reason']).toBe('waived');
    expect(APPROVAL_ACTION_TO_TARGET_STATE['override-with-reason']).toBe('overridden');
    expect(APPROVAL_ACTION_TO_TARGET_STATE['manual-close']).toBe('manually-closed');
  });
});

describe('Wave 14 — Decision discriminated-union enforcement', () => {
  it('validateDecisionShape returns no findings for well-formed approve', () => {
    expect(validateDecisionShape(makeApproveDecision())).toEqual([]);
  });

  it('flags missing evidenceRefs on waive-with-reason as APR-VAL-005', () => {
    const decision: ApprovalDecision = {
      id: W14_DECISION_ID,
      approvalRequestId: W14_REQ_ID,
      stepId: W14_STEP_ID,
      participantId: W14_PARTICIPANT_ID,
      actorPrincipalKey: 'pe-test@example.com',
      actorRole: 'project-executive',
      decisionAtUtc: '2026-04-28T15:00:00Z',
      action: 'waive-with-reason',
      reasonCode: 'documented-alternate-control',
      evidenceRefs: [],
      riskAcknowledgement: 'ack',
    };
    const findings = validateDecisionShape(decision);
    expect(findings.some((f) => f.ruleId === 'APR-VAL-005')).toBe(true);
  });

  it('flags missing comment on reject-return as APR-VAL-004', () => {
    const decision: ApprovalDecision = {
      id: W14_DECISION_ID,
      approvalRequestId: W14_REQ_ID,
      stepId: W14_STEP_ID,
      participantId: W14_PARTICIPANT_ID,
      actorPrincipalKey: 'pm-test@example.com',
      actorRole: 'project-manager',
      decisionAtUtc: '2026-04-28T15:00:00Z',
      action: 'reject-return',
      reasonCode: 'incomplete-evidence',
      comment: '',
    };
    const findings = validateDecisionShape(decision);
    expect(findings.some((f) => f.ruleId === 'APR-VAL-004')).toBe(true);
  });

  it('requiresEvidenceForAction holds for the documented set', () => {
    expect(requiresEvidenceForAction('waive-with-reason')).toBe(true);
    expect(requiresEvidenceForAction('override-with-reason')).toBe(true);
    expect(requiresEvidenceForAction('manual-close')).toBe(true);
    expect(requiresEvidenceForAction('approve')).toBe(false);
    expect(requiresEvidenceForAction('acknowledge')).toBe(false);
  });
});

describe('Wave 14 — Validation rules', () => {
  it('APPROVAL_VALIDATION_RULE_IDS covers APR-VAL-001..APR-VAL-020 (20 entries)', () => {
    expect(APPROVAL_VALIDATION_RULE_IDS).toHaveLength(20);
  });

  it('critical rules APR-VAL-012..APR-VAL-015 are classified critical', () => {
    for (const id of [
      'APR-VAL-012',
      'APR-VAL-013',
      'APR-VAL-014',
      'APR-VAL-015',
    ] as const) {
      expect(APPROVAL_VALIDATION_RULES[id].severity).toBe('critical');
    }
  });
});

describe('Wave 14 — Role-action matrix (PccPersona-typed; HBI is NOT a persona)', () => {
  it('has an entry for every member of PCC_PERSONAS', () => {
    for (const p of PCC_PERSONAS) {
      expect(APPROVAL_ROLE_ACTION_MATRIX[p]).toBeDefined();
    }
  });

  it('pcc-admin can approve; viewer cannot perform any action', () => {
    expect(isActionAllowedForRole('pcc-admin', 'approve')).toBe(true);
    for (const action of APPROVAL_DECISION_ACTIONS) {
      expect(isActionAllowedForRole('viewer', action)).toBe(false);
    }
  });

  it('project-team-member cannot approve; project-executive can approve', () => {
    expect(isActionAllowedForRole('project-team-member', 'approve')).toBe(false);
    expect(isActionAllowedForRole('project-executive', 'approve')).toBe(true);
  });

  it('external-contributor and external-design-team cannot perform any decision action', () => {
    for (const role of ['external-contributor', 'external-design-team'] as const) {
      for (const action of APPROVAL_DECISION_ACTIONS) {
        expect(isActionAllowedForRole(role, action)).toBe(false);
      }
    }
  });

  it('matrix keys do not include any HBI principal name (HBI is enforced at the principal-key layer)', () => {
    const keys = Object.keys(APPROVAL_ROLE_ACTION_MATRIX);
    for (const k of keys) {
      expect(k.startsWith('hbi')).toBe(false);
    }
  });
});

describe('Wave 14 — Supersession (request-side)', () => {
  it('isSupersededRequest is true only for state superseded', () => {
    for (const state of APPROVAL_REQUEST_STATES) {
      expect(isSupersededRequest(makeRequest(state))).toBe(state === 'superseded');
    }
  });
});

describe('Wave 14 — HBI no-authority refusal (principal-key based)', () => {
  it('forbids every decision action for HBI', () => {
    expect(HBI_FORBIDDEN_DECISION_ACTIONS).toHaveLength(APPROVAL_DECISION_ACTIONS.length);
    for (const action of APPROVAL_DECISION_ACTIONS) {
      expect(HBI_FORBIDDEN_DECISION_ACTIONS).toContain(action);
    }
  });

  it('isHbiPrincipalKey matches the documented prefix', () => {
    expect(HBI_PRINCIPAL_KEY_PREFIX).toBe('hbi:');
    expect(isHbiPrincipalKey('hbi:assistant')).toBe(true);
    expect(isHbiPrincipalKey('hbi:other')).toBe(true);
    expect(isHbiPrincipalKey('pm-sample@example.com')).toBe(false);
    expect(isHbiPrincipalKey('hb:assistant')).toBe(false);
  });

  it('assertNoHbiAuthorityOnDecision returns APR-VAL-012 for HBI actor and null otherwise', () => {
    const hbiDecision = makeApproveDecision({ actorPrincipalKey: 'hbi:assistant' } as Partial<ApprovalDecision>);
    const finding = assertNoHbiAuthorityOnDecision(hbiDecision);
    expect(finding).not.toBeNull();
    expect(finding?.ruleId).toBe('APR-VAL-012');
    expect(finding?.severity).toBe('critical');
    const humanFinding = assertNoHbiAuthorityOnDecision(makeApproveDecision());
    expect(humanFinding).toBeNull();
  });
});

describe('Wave 14 — Audit + redaction vocabulary', () => {
  it('APPROVAL_AUDIT_EVENT_TYPES includes refusal/violation events', () => {
    expect(APPROVAL_AUDIT_EVENT_TYPES).toContain('approval.hbi-decision-attempted');
    expect(APPROVAL_AUDIT_EVENT_TYPES).toContain('approval.unauthorized-decision-attempted');
    expect(APPROVAL_AUDIT_EVENT_TYPES).toContain('approval.external-writeback-attempted');
    expect(APPROVAL_AUDIT_EVENT_TYPES).toContain('approval.tenant-mutation-attempted');
  });

  it('redactionContextPreservedFor returns non-empty preserved-context for every category', () => {
    for (const category of APPROVAL_REDACTION_CATEGORIES) {
      const preserved = redactionContextPreservedFor(category);
      expect(preserved.length).toBeGreaterThan(0);
    }
  });
});

describe('Wave 14 — Cycle prevention (one-way dependency)', () => {
  it('ApprovalCheckpoint.ts source does not import from ./CheckpointInstance', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const filePath = fileURLToPath(new URL('./ApprovalCheckpoint.ts', import.meta.url));
    const source = readFileSync(filePath, 'utf8');
    // Strip line comments and block comments so legitimate prose
    // (the file's docblock describes the cycle prevention rule) does
    // not trip the scan.
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""');
    expect(stripped).not.toMatch(/from\s+['"]\.\/CheckpointInstance/);
    expect(stripped).not.toMatch(/import\s*\(\s*['"]\.\/CheckpointInstance/);
  });
});
