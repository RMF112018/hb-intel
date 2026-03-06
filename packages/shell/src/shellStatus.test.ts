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
        lastKnownDataLabel: '2 min ago',
        limitedValidation: true,
      },
    ]);

    expect(labels).toEqual([
      {
        sectionId: 'dashboard',
        label: 'Dashboard: Limited validation (2 min ago)',
      },
    ]);
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
