import { describe, expect, it } from 'vitest';
import {
  resolveDegradedEligibility,
  resolveRestrictedZones,
  resolveSafeRecoveryState,
  resolveSectionFreshnessState,
  resolveSensitiveActionPolicy,
} from './degradedMode.js';

describe('resolveSectionFreshnessState', () => {
  it('returns fresh when last-known timestamp is inside freshness window', () => {
    const freshness = resolveSectionFreshnessState({
      lastKnownTimestamp: '2026-03-06T12:00:00.000Z',
      now: () => new Date('2026-03-06T12:30:00.000Z'),
    });
    expect(freshness).toBe('fresh');
  });

  it('returns stale when timestamp is outside freshness window', () => {
    const freshness = resolveSectionFreshnessState({
      lastKnownTimestamp: '2026-03-06T10:00:00.000Z',
      now: () => new Date('2026-03-06T12:30:00.000Z'),
    });
    expect(freshness).toBe('stale');
  });
});

describe('resolveDegradedEligibility', () => {
  it('allows degraded mode for recent session plus trusted fresh visible state', () => {
    const eligibility = resolveDegradedEligibility({
      lifecyclePhase: 'error',
      sessionValidatedAt: '2026-03-06T12:00:00.000Z',
      now: () => new Date('2026-03-06T13:00:00.000Z'),
      sections: [
        {
          sectionId: 'dashboard',
          sectionLabel: 'Dashboard',
          isTrustedLastKnownState: true,
          isVisible: true,
          lastKnownTimestamp: '2026-03-06T12:30:00.000Z',
        },
      ],
    });

    expect(eligibility).toEqual({ eligible: true, reason: 'eligible' });
  });

  it('rejects degraded mode when session validation is stale', () => {
    const eligibility = resolveDegradedEligibility({
      lifecyclePhase: 'error',
      sessionValidatedAt: '2026-03-06T00:00:00.000Z',
      now: () => new Date('2026-03-06T12:30:00.000Z'),
      sections: [
        {
          sectionId: 'dashboard',
          sectionLabel: 'Dashboard',
          isTrustedLastKnownState: true,
          isVisible: true,
          lastKnownTimestamp: '2026-03-06T12:10:00.000Z',
        },
      ],
    });

    expect(eligibility).toEqual({ eligible: false, reason: 'not-recently-authenticated' });
  });

  it('rejects degraded mode when trusted fresh visible state is missing', () => {
    const eligibility = resolveDegradedEligibility({
      lifecyclePhase: 'reauth-required',
      sessionValidatedAt: '2026-03-06T12:00:00.000Z',
      now: () => new Date('2026-03-06T12:30:00.000Z'),
      sections: [
        {
          sectionId: 'dashboard',
          sectionLabel: 'Dashboard',
          isTrustedLastKnownState: false,
          isVisible: true,
          lastKnownTimestamp: '2026-03-06T12:10:00.000Z',
        },
      ],
    });

    expect(eligibility).toEqual({ eligible: false, reason: 'missing-trusted-fresh-section' });
  });
});

describe('resolveSensitiveActionPolicy', () => {
  it('blocks sensitive and backend-validated operations in degraded mode', () => {
    const policy = resolveSensitiveActionPolicy({
      isDegradedMode: true,
      intents: [
        { actionId: 'view-dashboard', category: 'read' },
        { actionId: 'save-rfi', category: 'write' },
        { actionId: 'approve-submittal', category: 'approve' },
        { actionId: 'edit-permissions', category: 'permission-change' },
        {
          actionId: 'refresh-live-validation',
          category: 'read',
          requiresBackendValidation: true,
        },
      ],
    });

    expect(policy.allowedActionIds).toEqual(['view-dashboard']);
    expect(policy.blockedActionIds).toEqual([
      'save-rfi',
      'approve-submittal',
      'edit-permissions',
      'refresh-live-validation',
    ]);
  });
});

describe('resolveRestrictedZones', () => {
  it('marks zones as visibly restricted during degraded mode', () => {
    const zones = resolveRestrictedZones({
      isDegradedMode: true,
      zones: [
        {
          zoneId: 'approvals',
          zoneLabel: 'Approvals',
          reason: 'Current authorization is unavailable.',
        },
      ],
    });

    expect(zones[0]?.restricted).toBe(true);
    expect(zones[0]?.visible).toBe(true);
  });
});

describe('resolveSafeRecoveryState', () => {
  it('returns recovered only after explicit connected authenticated recovery', () => {
    const recovery = resolveSafeRecoveryState({
      wasDegraded: true,
      isDegraded: false,
      lifecyclePhase: 'authenticated',
      connectivitySignal: 'connected',
    });

    expect(recovery).toEqual({
      recovered: true,
      safeToResumeSensitiveActions: true,
    });
  });
});
