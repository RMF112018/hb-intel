import { describe, it, expect } from 'vitest';
import { computeAlertBadge, buildProbeStatusMap, resolveEligibility } from '../hooks/helpers.js';
import { createMockAdminAlert } from '@hbc/features-admin/testing';
import { createMockProbeResult } from '@hbc/features-admin/testing';
import { createMockApprovalAuthorityRule } from '@hbc/features-admin/testing';

describe('computeAlertBadge', () => {
  it('returns zero counts for empty array', () => {
    const badge = computeAlertBadge([]);
    expect(badge).toEqual({
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      totalCount: 0,
    });
  });

  it('counts alerts by severity', () => {
    const alerts = [
      createMockAdminAlert({ alertId: '1', severity: 'critical' }),
      createMockAdminAlert({ alertId: '2', severity: 'critical' }),
      createMockAdminAlert({ alertId: '3', severity: 'high' }),
      createMockAdminAlert({ alertId: '4', severity: 'medium' }),
      createMockAdminAlert({ alertId: '5', severity: 'low' }),
      createMockAdminAlert({ alertId: '6', severity: 'low' }),
    ];
    const badge = computeAlertBadge(alerts);
    expect(badge).toEqual({
      criticalCount: 2,
      highCount: 1,
      mediumCount: 1,
      lowCount: 2,
      totalCount: 6,
    });
  });

  it('enforces monotonic badge when prev is supplied', () => {
    const prev = {
      criticalCount: 5,
      highCount: 3,
      mediumCount: 2,
      lowCount: 1,
      totalCount: 11,
    };
    const alerts = [
      createMockAdminAlert({ alertId: '1', severity: 'critical' }),
    ];
    const badge = computeAlertBadge(alerts, prev);
    expect(badge.criticalCount).toBe(5);
    expect(badge.highCount).toBe(3);
    expect(badge.mediumCount).toBe(2);
    expect(badge.lowCount).toBe(1);
    expect(badge.totalCount).toBe(11);
  });

  it('allows badge counts to increase beyond prev', () => {
    const prev = {
      criticalCount: 1,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      totalCount: 1,
    };
    const alerts = [
      createMockAdminAlert({ alertId: '1', severity: 'critical' }),
      createMockAdminAlert({ alertId: '2', severity: 'critical' }),
      createMockAdminAlert({ alertId: '3', severity: 'high' }),
    ];
    const badge = computeAlertBadge(alerts, prev);
    expect(badge.criticalCount).toBe(2);
    expect(badge.highCount).toBe(1);
    expect(badge.totalCount).toBe(3);
  });
});

describe('buildProbeStatusMap', () => {
  it('returns empty map for empty results', () => {
    const map = buildProbeStatusMap([]);
    expect(map.size).toBe(0);
  });

  it('maps probe keys to their status', () => {
    const results = [
      createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy' }),
      createMockProbeResult({ probeKey: 'azure-functions', status: 'degraded' }),
      createMockProbeResult({ probeKey: 'azure-search', status: 'error' }),
    ];
    const map = buildProbeStatusMap(results);
    expect(map.get('sharepoint-infrastructure')).toBe('healthy');
    expect(map.get('azure-functions')).toBe('degraded');
    expect(map.get('azure-search')).toBe('error');
    expect(map.size).toBe(3);
  });

  it('overwrites earlier entries with same key', () => {
    const results = [
      createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'error' }),
      createMockProbeResult({ probeKey: 'sharepoint-infrastructure', status: 'healthy' }),
    ];
    const map = buildProbeStatusMap(results);
    expect(map.get('sharepoint-infrastructure')).toBe('healthy');
    expect(map.size).toBe(1);
  });
});

describe('resolveEligibility', () => {
  it('returns none when no rules match context', () => {
    const rules = [
      createMockApprovalAuthorityRule({ approvalContext: 'provisioning-task-completion' }),
    ];
    const result = resolveEligibility(rules, 'bd-scorecard-director-review', 'user-001');
    expect(result.eligible).toBe(false);
    expect(result.matchedBy).toBe('none');
    expect(result.approvalContext).toBe('bd-scorecard-director-review');
    expect(result.userId).toBe('user-001');
  });

  it('returns direct-user when userId is in approverUserIds', () => {
    const rules = [
      createMockApprovalAuthorityRule({
        approvalContext: 'provisioning-task-completion',
        approverUserIds: ['user-001', 'user-002'],
      }),
    ];
    const result = resolveEligibility(rules, 'provisioning-task-completion', 'user-001');
    expect(result.eligible).toBe(true);
    expect(result.matchedBy).toBe('direct-user');
  });

  it('returns none when userId is not in approverUserIds', () => {
    const rules = [
      createMockApprovalAuthorityRule({
        approvalContext: 'provisioning-task-completion',
        approverUserIds: ['user-002'],
      }),
    ];
    const result = resolveEligibility(rules, 'provisioning-task-completion', 'user-001');
    expect(result.eligible).toBe(false);
    expect(result.matchedBy).toBe('none');
  });

  it('returns none when rules array is empty', () => {
    const result = resolveEligibility([], 'provisioning-task-completion', 'user-001');
    expect(result.eligible).toBe(false);
    expect(result.matchedBy).toBe('none');
  });
});
