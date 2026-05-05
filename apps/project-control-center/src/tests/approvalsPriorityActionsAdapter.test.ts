import { describe, expect, it } from 'vitest';
import {
  EMPTY_APPROVALS_READ_MODEL,
  SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS,
  SAMPLE_APPROVALS_READ_MODEL,
  type IApprovalPriorityActionLink,
  type IPriorityAction,
  type PccApprovalRequestId,
  type PccApprovalStepId,
  type PccApprovalsReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import {
  APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY,
  buildApprovalsDerivedPriorityActions,
} from '../viewModels/approvalsPriorityActionsAdapter';

const PROJECT_ID = 'p-w14-approvals-pa-test' as PccProjectId;

function envelope(
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
): PccReadModelEnvelope<PccApprovalsReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

describe('APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY — exact concatenation order', () => {
  it('concatenates projectId|approvalRequestId|currentStepId|actionType in pipe-delimited order', () => {
    expect(
      APPROVALS_DERIVED_PRIORITY_ACTION_DEDUPE_KEY({
        projectId: 'p-1' as PccProjectId,
        approvalRequestId: 'r-1' as PccApprovalRequestId,
        currentStepId: 's-1' as PccApprovalStepId,
        actionType: 'approval-pending',
      }),
    ).toBe('p-1|r-1|s-1|approval-pending');
  });
});

describe('buildApprovalsDerivedPriorityActions — runtime degraded path', () => {
  it('returns empty result when approvalsEnvelope is undefined and no test override is supplied', () => {
    const result = buildApprovalsDerivedPriorityActions({ projectId: PROJECT_ID });
    expect(result.priorityActions).toEqual([]);
    expect(result.suppressedKeys).toEqual([]);
  });

  it('does not auto-fall back to SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS at runtime', () => {
    // SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS publishes 4 records (Wave 14 fixture);
    // the runtime degraded path must produce zero, never four.
    expect(SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS.length).toBeGreaterThan(0);
    const result = buildApprovalsDerivedPriorityActions({ projectId: PROJECT_ID });
    expect(result.priorityActions).toHaveLength(0);
  });
});

describe('buildApprovalsDerivedPriorityActions — explicit links (test-only override)', () => {
  it('skips resolved links without recording a suppressed key', () => {
    const link: IApprovalPriorityActionLink = {
      id: 'pal-1' as IApprovalPriorityActionLink['id'],
      projectId: PROJECT_ID,
      approvalRequestId: 'r-r' as PccApprovalRequestId,
      currentStepId: 's-r' as PccApprovalStepId,
      actionType: 'approval-pending',
      createdAtUtc: '2026-04-15T08:00:00Z',
      state: 'resolved',
    };
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      priorityActionLinks: [link],
    });
    expect(result.priorityActions).toHaveLength(0);
    expect(result.suppressedKeys).toHaveLength(0);
  });

  it('skips suppressed links and records the dedupe key', () => {
    const link: IApprovalPriorityActionLink = {
      id: 'pal-2' as IApprovalPriorityActionLink['id'],
      projectId: PROJECT_ID,
      approvalRequestId: 'r-s' as PccApprovalRequestId,
      currentStepId: 's-s' as PccApprovalStepId,
      actionType: 'revision-required',
      createdAtUtc: '2026-04-15T08:00:00Z',
      state: 'suppressed',
    };
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      priorityActionLinks: [link],
    });
    expect(result.priorityActions).toHaveLength(0);
    expect(result.suppressedKeys).toEqual([
      `${String(PROJECT_ID)}|r-s|s-s|revision-required`,
    ]);
  });

  it('emits a candidate for an open link with stable id and category=approval', () => {
    const link: IApprovalPriorityActionLink = {
      id: 'pal-3' as IApprovalPriorityActionLink['id'],
      projectId: PROJECT_ID,
      approvalRequestId: 'r-o' as PccApprovalRequestId,
      currentStepId: 's-o' as PccApprovalStepId,
      actionType: 'escalation-pending',
      createdAtUtc: '2026-04-15T08:00:00Z',
      state: 'open',
    };
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      priorityActionLinks: [link],
    });
    expect(result.priorityActions).toHaveLength(1);
    const action = result.priorityActions[0]!;
    expect(action.id).toBe(`approval:${String(PROJECT_ID)}|r-o|s-o|escalation-pending`);
    expect(action.category).toBe('approval');
  });

  it('dedupes against existingActions and records the suppressed key', () => {
    const link: IApprovalPriorityActionLink = {
      id: 'pal-4' as IApprovalPriorityActionLink['id'],
      projectId: PROJECT_ID,
      approvalRequestId: 'r-d' as PccApprovalRequestId,
      currentStepId: 's-d' as PccApprovalStepId,
      actionType: 'admin-verify-pending',
      createdAtUtc: '2026-04-15T08:00:00Z',
      state: 'open',
    };
    const dedupeKey = `${String(PROJECT_ID)}|r-d|s-d|admin-verify-pending`;
    const existingActions: readonly IPriorityAction[] = [
      {
        id: `approval:${dedupeKey}`,
        category: 'approval',
        title: 'Existing pending approval',
      },
    ];
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      priorityActionLinks: [link],
      existingActions,
    });
    expect(result.priorityActions).toHaveLength(0);
    expect(result.suppressedKeys).toEqual([dedupeKey]);
  });

  it('does not emit command-vocabulary words in synthesized titles', () => {
    const links = SAMPLE_APPROVAL_PRIORITY_ACTION_LINKS.filter((l) => l.state !== 'resolved');
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      priorityActionLinks: links,
    });
    const forbidden = /\b(approve|reject|waive|override|defer|cancel|supersede|manual[-\s]?close)\b/i;
    for (const action of result.priorityActions) {
      expect(forbidden.test(action.title)).toBe(false);
    }
  });
});

describe('buildApprovalsDerivedPriorityActions — envelope-derived path', () => {
  it('produces zero candidates from EMPTY_APPROVALS_READ_MODEL envelope', () => {
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: envelope(EMPTY_APPROVALS_READ_MODEL),
    });
    expect(result.priorityActions).toHaveLength(0);
  });

  it('skips envelope queue entries whose currentStepId is missing — no synthesised step id', () => {
    const customEnvelope: PccReadModelEnvelope<PccApprovalsReadModel> = envelope({
      ...EMPTY_APPROVALS_READ_MODEL,
      queue: {
        entries: [
          {
            approvalRequestId: 'r-no-step' as PccApprovalRequestId,
            projectId: PROJECT_ID,
            state: 'pending-review',
            // currentStepId intentionally omitted (optional in the contract)
            createdAtUtc: '2026-04-15T08:00:00Z',
            title: 'Active approval missing currentStepId',
          },
        ],
      },
    });
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: customEnvelope,
    });
    expect(result.priorityActions).toHaveLength(0);
  });

  it('produces a candidate when a queue entry carries currentStepId', () => {
    const customEnvelope: PccReadModelEnvelope<PccApprovalsReadModel> = envelope({
      ...EMPTY_APPROVALS_READ_MODEL,
      queue: {
        entries: [
          {
            approvalRequestId: 'r-step' as PccApprovalRequestId,
            projectId: PROJECT_ID,
            state: 'pending-review',
            currentStepId: 's-step' as PccApprovalStepId,
            createdAtUtc: '2026-04-15T08:00:00Z',
            title: 'Active approval with currentStepId',
            priority: 'high',
          },
        ],
      },
    });
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: customEnvelope,
    });
    expect(result.priorityActions).toHaveLength(1);
    expect(result.priorityActions[0]!.id).toBe(
      `approval:${String(PROJECT_ID)}|r-step|s-step|approval-pending`,
    );
    expect(result.priorityActions[0]!.severity).toBe('Warning');
  });

  it('skips terminal-state queue entries even when currentStepId is present', () => {
    const customEnvelope: PccReadModelEnvelope<PccApprovalsReadModel> = envelope({
      ...EMPTY_APPROVALS_READ_MODEL,
      queue: {
        entries: [
          {
            approvalRequestId: 'r-term' as PccApprovalRequestId,
            projectId: PROJECT_ID,
            state: 'approved',
            currentStepId: 's-term' as PccApprovalStepId,
            createdAtUtc: '2026-04-15T08:00:00Z',
            title: 'Terminal-state queue entry',
          },
        ],
      },
    });
    const result = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: customEnvelope,
    });
    expect(result.priorityActions).toHaveLength(0);
  });
});

describe('buildApprovalsDerivedPriorityActions — purity', () => {
  it('returns identical results for identical inputs', () => {
    const env = envelope();
    const a = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: env,
    });
    const b = buildApprovalsDerivedPriorityActions({
      projectId: PROJECT_ID,
      approvalsEnvelope: env,
    });
    expect(a).toEqual(b);
  });
});
