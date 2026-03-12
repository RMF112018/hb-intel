import { describe, it, expect, vi } from 'vitest';
import {
  ReferenceBicNextMoveAdapter,
  ReferenceNotificationDispatchAdapter,
  ReferenceAcknowledgmentAdapter,
  ReferenceGovernanceSnapshotAdapter,
  ReferenceComplexityGatingAdapter,
} from '../integrations/index.js';
import type {
  IBicNextMoveAdapter,
  INotificationDispatchAdapter,
  IAcknowledgmentApprovalAdapter,
  IGovernanceSnapshotAdapter,
  IAdminComplexityGatingAdapter,
  AdminComplexityTier,
} from '../integrations/index.js';
import { createMockAdminAlert, createMockApprovalAuthorityRule } from '@hbc/features-admin/testing';
import { ApprovalAuthorityApi } from '../api/ApprovalAuthorityApi.js';

// ─── BIC Next-Move Adapter ───────────────────────────────────────────

describe('ReferenceBicNextMoveAdapter', () => {
  it('creates an instance', () => {
    const adapter = new ReferenceBicNextMoveAdapter();
    expect(adapter).toBeDefined();
  });

  it('satisfies IBicNextMoveAdapter contract', () => {
    const adapter: IBicNextMoveAdapter = new ReferenceBicNextMoveAdapter();
    expect(typeof adapter.getBlockedWorkflows).toBe('function');
  });

  it('returns empty array from stub', async () => {
    const adapter = new ReferenceBicNextMoveAdapter();
    const result = await adapter.getBlockedWorkflows();
    expect(result).toEqual([]);
  });
});

// ─── Notification Dispatch Adapter ───────────────────────────────────

describe('ReferenceNotificationDispatchAdapter', () => {
  it('creates an instance', () => {
    const adapter = new ReferenceNotificationDispatchAdapter();
    expect(adapter).toBeDefined();
  });

  it('satisfies INotificationDispatchAdapter contract', () => {
    const adapter: INotificationDispatchAdapter = new ReferenceNotificationDispatchAdapter();
    expect(typeof adapter.dispatch).toBe('function');
  });

  it('dispatches critical alert as immediate', () => {
    const adapter = new ReferenceNotificationDispatchAdapter();
    const alert = createMockAdminAlert({ severity: 'critical' });
    const event = adapter.dispatch(alert);
    expect(event.route).toBe('immediate');
    expect(event.alert).toBe(alert);
    expect(event.dispatchedAt).toBeDefined();
  });

  it('dispatches low alert as digest', () => {
    const adapter = new ReferenceNotificationDispatchAdapter();
    const alert = createMockAdminAlert({ severity: 'low' });
    const event = adapter.dispatch(alert);
    expect(event.route).toBe('digest');
  });

  it('dispatches acknowledged alert with escalation as immediate', () => {
    const adapter = new ReferenceNotificationDispatchAdapter();
    const alert = createMockAdminAlert({
      severity: 'critical',
      acknowledgedAt: '2026-01-01T00:00:00.000Z',
    });
    const event = adapter.dispatch(alert, 'medium');
    expect(event.route).toBe('immediate');
  });

  it('dispatches acknowledged alert without escalation as digest', () => {
    const adapter = new ReferenceNotificationDispatchAdapter();
    const alert = createMockAdminAlert({
      severity: 'high',
      acknowledgedAt: '2026-01-01T00:00:00.000Z',
    });
    const event = adapter.dispatch(alert, 'high');
    expect(event.route).toBe('digest');
  });
});

// ─── Acknowledgment Adapter ──────────────────────────────────────────

describe('ReferenceAcknowledgmentAdapter', () => {
  it('creates an instance with default API', () => {
    const adapter = new ReferenceAcknowledgmentAdapter();
    expect(adapter).toBeDefined();
  });

  it('creates an instance with injected API', () => {
    const api = new ApprovalAuthorityApi();
    const adapter = new ReferenceAcknowledgmentAdapter(api);
    expect(adapter).toBeDefined();
  });

  it('satisfies IAcknowledgmentApprovalAdapter contract', () => {
    const adapter: IAcknowledgmentApprovalAdapter = new ReferenceAcknowledgmentAdapter();
    expect(typeof adapter.resolveApprovalParties).toBe('function');
  });

  it('resolves eligible user via rules', async () => {
    const api = new ApprovalAuthorityApi();
    const rule = createMockApprovalAuthorityRule({
      approvalContext: 'provisioning-task-completion',
      approverUserIds: ['user-42'],
    });
    vi.spyOn(api, 'getRules').mockResolvedValue([rule]);

    const adapter = new ReferenceAcknowledgmentAdapter(api);
    const result = await adapter.resolveApprovalParties('provisioning-task-completion', 'user-42');

    expect(result.eligibility.eligible).toBe(true);
    expect(result.eligibility.matchedBy).toBe('direct-user');
    expect(result.context).toBe('provisioning-task-completion');
    expect(result.userId).toBe('user-42');
    expect(result.resolvedAt).toBeDefined();
  });

  it('resolves ineligible user when not in rule', async () => {
    const api = new ApprovalAuthorityApi();
    vi.spyOn(api, 'getRules').mockResolvedValue([]);

    const adapter = new ReferenceAcknowledgmentAdapter(api);
    const result = await adapter.resolveApprovalParties('provisioning-task-completion', 'user-99');

    expect(result.eligibility.eligible).toBe(false);
    expect(result.eligibility.matchedBy).toBe('none');
  });
});

// ─── Versioned Record / Governance Snapshot Adapter ──────────────────

describe('ReferenceGovernanceSnapshotAdapter', () => {
  it('creates an instance', () => {
    const adapter = new ReferenceGovernanceSnapshotAdapter();
    expect(adapter).toBeDefined();
  });

  it('satisfies IGovernanceSnapshotAdapter contract', () => {
    const adapter: IGovernanceSnapshotAdapter = new ReferenceGovernanceSnapshotAdapter();
    expect(typeof adapter.emitRuleChangeSnapshot).toBe('function');
  });

  it('builds snapshot payload from rule', () => {
    const adapter = new ReferenceGovernanceSnapshotAdapter();
    const rule = createMockApprovalAuthorityRule({
      ruleId: 'rule-abc',
      approvalContext: 'bd-scorecard-director-review',
      approverUserIds: ['user-1', 'user-2'],
    });
    const snapshot = adapter.emitRuleChangeSnapshot(rule, 'admin-user');

    expect(snapshot.ruleId).toBe('rule-abc');
    expect(snapshot.approvalContext).toBe('bd-scorecard-director-review');
    expect(snapshot.approverUserIds).toEqual(['user-1', 'user-2']);
    expect(snapshot.capturedBy).toBe('admin-user');
    expect(snapshot.snapshotId).toContain('snap-rule-abc-');
    expect(snapshot.capturedAt).toBeDefined();
  });
});

// ─── Complexity Gating Adapter ───────────────────────────────────────

describe('ReferenceComplexityGatingAdapter', () => {
  it('creates an instance', () => {
    const adapter = new ReferenceComplexityGatingAdapter();
    expect(adapter).toBeDefined();
  });

  it('satisfies IAdminComplexityGatingAdapter contract', () => {
    const adapter: IAdminComplexityGatingAdapter = new ReferenceComplexityGatingAdapter();
    expect(typeof adapter.resolveGating).toBe('function');
  });

  it('essential tier: badge only', () => {
    const adapter = new ReferenceComplexityGatingAdapter();
    const gating = adapter.resolveGating('essential');
    expect(gating.badgeVisible).toBe(true);
    expect(gating.dashboardVisible).toBe(false);
    expect(gating.truthVisible).toBe(false);
    expect(gating.simulationVisible).toBe(false);
  });

  it('standard tier: badge + dashboard', () => {
    const adapter = new ReferenceComplexityGatingAdapter();
    const gating = adapter.resolveGating('standard');
    expect(gating.badgeVisible).toBe(true);
    expect(gating.dashboardVisible).toBe(true);
    expect(gating.truthVisible).toBe(false);
    expect(gating.simulationVisible).toBe(false);
  });

  it('expert tier: all visible', () => {
    const adapter = new ReferenceComplexityGatingAdapter();
    const gating = adapter.resolveGating('expert');
    expect(gating.badgeVisible).toBe(true);
    expect(gating.dashboardVisible).toBe(true);
    expect(gating.truthVisible).toBe(true);
    expect(gating.simulationVisible).toBe(true);
  });

  it.each<AdminComplexityTier>(['essential', 'standard', 'expert'])(
    'badge is always visible for %s tier',
    (tier) => {
      const adapter = new ReferenceComplexityGatingAdapter();
      const gating = adapter.resolveGating(tier);
      expect(gating.badgeVisible).toBe(true);
    },
  );
});

// ─── Boundary Validation ─────────────────────────────────────────────

describe('Integration boundary validation', () => {
  it('all reference adapters are exported from barrel', async () => {
    const barrel = await import('../integrations/index.js');
    expect(barrel.ReferenceBicNextMoveAdapter).toBeDefined();
    expect(barrel.ReferenceNotificationDispatchAdapter).toBeDefined();
    expect(barrel.ReferenceAcknowledgmentAdapter).toBeDefined();
    expect(barrel.ReferenceGovernanceSnapshotAdapter).toBeDefined();
    expect(barrel.ReferenceComplexityGatingAdapter).toBeDefined();
  });
});
