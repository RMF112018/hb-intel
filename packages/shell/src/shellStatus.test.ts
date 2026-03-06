import { describe, expect, it } from 'vitest';
import {
  deriveDegradedSectionLabels,
  isShellStatusActionAllowed,
  resolveShellStatusSnapshot,
} from './shellStatus.js';

describe('resolveShellStatusSnapshot', () => {
  it('uses fixed priority hierarchy when multiple states are active', () => {
    const snapshot = resolveShellStatusSnapshot({
      lifecyclePhase: 'restoring',
      experienceState: 'degraded',
      hasAccessValidationIssue: false,
      hasFatalError: true,
      connectivitySignal: 'reconnecting',
      degradedSections: [],
    });

    expect(snapshot.kind).toBe('error-failure');
  });

  it('returns plain-language copy and approved actions', () => {
    const snapshot = resolveShellStatusSnapshot({
      lifecyclePhase: 'reauth-required',
      experienceState: 'ready',
      hasAccessValidationIssue: true,
      hasFatalError: false,
      connectivitySignal: 'connected',
      degradedSections: [],
    });

    expect(snapshot.kind).toBe('access-validation-issue');
    expect(snapshot.message).toContain('validate your access');
    expect(snapshot.actions).toEqual(['sign-in-again', 'learn-more']);
  });
});

describe('degraded labels and action allowlist', () => {
  it('derives section-level degraded labels', () => {
    const labels = deriveDegradedSectionLabels([
      {
        sectionId: 'dashboard',
        sectionLabel: 'Dashboard',
        lastKnownTimestamp: '2026-03-06T10:00:00.000Z',
        lastKnownDataLabel: '2 min ago',
        limitedValidation: true,
        restrictedInDegradedMode: true,
      },
    ]);

    expect(labels[0]?.sectionId).toBe('dashboard');
    expect(labels[0]?.label).toContain('Validation limited');
    expect(labels[0]?.label).toContain('Restricted zone');
    expect(labels[0]?.label).toContain('2 min ago');
    expect(labels[0]?.validation).toBe('limited');
    expect(labels[0]?.restricted).toBe(true);
  });

  it('resolves recovered state copy when returning from degraded mode', () => {
    const snapshot = resolveShellStatusSnapshot({
      lifecyclePhase: 'authenticated',
      experienceState: 'ready',
      hasAccessValidationIssue: false,
      hasFatalError: false,
      connectivitySignal: 'connected',
      hasRecoveredFromDegraded: true,
      degradedSections: [],
    });

    expect(snapshot.kind).toBe('recovered');
    expect(snapshot.message).toContain('Connection restored');
  });

  it('enforces approved action allowlist', () => {
    const snapshot = resolveShellStatusSnapshot({
      lifecyclePhase: 'restoring',
      experienceState: 'recovery',
      hasAccessValidationIssue: false,
      hasFatalError: false,
      connectivitySignal: 'connected',
      degradedSections: [],
    });

    expect(isShellStatusActionAllowed(snapshot, 'retry')).toBe(true);
    expect(isShellStatusActionAllowed(snapshot, 'sign-in-again')).toBe(false);
  });
});
