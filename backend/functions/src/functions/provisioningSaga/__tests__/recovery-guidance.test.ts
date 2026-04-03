import { describe, it, expect } from 'vitest';
import { getRecoveryGuidance, type IRecoveryGuidance } from '../recovery-guidance.js';
import type { IProvisioningStatus } from '@hbc/models';

/** Minimal failed status for testing. */
function failedStatus(overrides?: Partial<IProvisioningStatus>): IProvisioningStatus {
  return {
    projectId: 'test-project',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'Failed',
    currentStep: 3,
    steps: [
      { stepNumber: 3, stepName: 'Upload Template Files', status: 'Failed', errorMessage: 'upload failed' },
    ],
    triggeredBy: 'admin@hb.com',
    submittedBy: 'coord@hb.com',
    groupMembers: ['m1@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

describe('getRecoveryGuidance', () => {
  // --- Non-failed runs ---

  it('returns no-action guidance for non-failed runs', () => {
    const status = failedStatus({ overallStatus: 'InProgress' });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.failureSummary).toContain('InProgress');
  });

  it('returns no-action guidance for completed runs', () => {
    const status = failedStatus({ overallStatus: 'Completed' });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
  });

  // --- Transient failures ---

  it('recommends retry for transient failure on first attempt', () => {
    const status = failedStatus({ failureClass: 'transient', retryCount: 0 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(true);
    expect(guidance.recommendedAction).toBe('retry');
    expect(guidance.escalationReason).toBeNull();
  });

  it('recommends escalation for transient failure after max retries', () => {
    const status = failedStatus({ failureClass: 'transient', retryCount: 3 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.recommendedAction).toBe('escalate');
    expect(guidance.escalationReason).toBeTruthy();
  });

  it('includes remaining retry count in guidance for transient', () => {
    const status = failedStatus({ failureClass: 'transient', retryCount: 1 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.nextStep).toContain('2 retry attempt(s) remain');
  });

  // --- Permissions failures ---

  it('advises against retry for permissions failure', () => {
    const status = failedStatus({ failureClass: 'permissions', currentStep: 6 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.recommendedAction).toBe('investigate-permissions');
    expect(guidance.escalationReason).toBeTruthy();
  });

  it('provides Graph-specific guidance for Step 6 permissions failure', () => {
    const status = failedStatus({ failureClass: 'permissions', currentStep: 6 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.likelyCause).toContain('Group.ReadWrite.All');
  });

  it('provides general permissions guidance for non-Step-6 failures', () => {
    const status = failedStatus({ failureClass: 'permissions', currentStep: 1 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.likelyCause).not.toContain('Group.ReadWrite.All');
    expect(guidance.recommendedAction).toBe('investigate-permissions');
  });

  // --- Structural failures ---

  it('advises fix-configuration for structural failure', () => {
    const status = failedStatus({ failureClass: 'structural', currentStep: 7 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.recommendedAction).toBe('fix-configuration');
  });

  it('provides hub-specific guidance for Step 7 structural failure', () => {
    const status = failedStatus({ failureClass: 'structural', currentStep: 7 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.likelyCause).toContain('hub site');
  });

  it('provides site-specific guidance for Step 1 structural failure', () => {
    const status = failedStatus({ failureClass: 'structural', currentStep: 1 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.likelyCause).toContain('site creation');
  });

  // --- Repeated failures ---

  it('recommends escalation for repeated failure', () => {
    const status = failedStatus({ failureClass: 'repeated', retryCount: 2 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.recommendedAction).toBe('escalate');
    expect(guidance.escalationReason).toContain('2 attempt(s)');
  });

  // --- Admin-class failures ---

  it('recommends one retry for admin-class on first attempt', () => {
    const status = failedStatus({ failureClass: 'admin-class', retryCount: 0 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(true);
    expect(guidance.recommendedAction).toBe('retry');
  });

  it('recommends escalation for admin-class on subsequent attempts', () => {
    const status = failedStatus({ failureClass: 'admin-class', retryCount: 1 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(false);
    expect(guidance.recommendedAction).toBe('escalate');
  });

  // --- Unclassified (no failureClass) ---

  it('treats missing failureClass as admin-class', () => {
    const status = failedStatus({ failureClass: undefined, retryCount: 0 });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.retryAdvisable).toBe(true);
    expect(guidance.recommendedAction).toBe('retry');
    expect(guidance.failureSummary).toContain('Unclassified');
  });

  // --- Guidance structure ---

  it('every guidance has all required fields', () => {
    const classes = ['transient', 'structural', 'permissions', 'repeated', 'admin-class'] as const;
    for (const fc of classes) {
      const status = failedStatus({ failureClass: fc });
      const guidance = getRecoveryGuidance(status);
      expect(guidance.failureSummary).toBeTruthy();
      expect(guidance.likelyCause).toBeTruthy();
      expect(guidance.nextStep).toBeTruthy();
      expect(guidance.runbookRef).toBeTruthy();
      expect(typeof guidance.retryAdvisable).toBe('boolean');
      expect(guidance.recommendedAction).toBeTruthy();
    }
  });

  it('includes runbook references', () => {
    const status = failedStatus({ failureClass: 'transient' });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.runbookRef).toContain('provisioning-runbook.md');
  });

  it('truncates long error messages in summary', () => {
    const longError = 'A'.repeat(300);
    const status = failedStatus({
      failureClass: 'transient',
      steps: [{ stepNumber: 3, stepName: 'Upload', status: 'Failed', errorMessage: longError }],
    });
    const guidance = getRecoveryGuidance(status);
    expect(guidance.failureSummary.length).toBeLessThan(350);
    expect(guidance.failureSummary).toContain('…');
  });
});
