/**
 * P9.1-12: White-glove retry semantics unit tests.
 *
 * Covers retry strategy resolution, failure classification,
 * compensation actions, and repair guidance.
 */

import { describe, it, expect } from 'vitest';
import { WhiteGloveFailureClass } from '@hbc/models';
import {
  getRetryStrategy,
  getCompensationActions,
  getRepairGuidance,
  classifyWhiteGloveFailure,
} from '../white-glove-retry-semantics.js';

// ─── Retry Strategy ─────────────────────────────────────────────────────────

describe('getRetryStrategy', () => {
  it('connector failure is retryable with max 3', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.ConnectorFailure);
    expect(strategy.eligible).toBe(true);
    expect(strategy.maxRetries).toBe(3);
  });

  it('enrollment failure is retryable with max 2', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.EnrollmentFailure);
    expect(strategy.eligible).toBe(true);
    expect(strategy.maxRetries).toBe(2);
  });

  it('operator cancellation is not retryable', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.OperatorCancellation);
    expect(strategy.eligible).toBe(false);
    expect(strategy.maxRetries).toBe(0);
  });

  it('permission denied is not retryable', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.PermissionDenied);
    expect(strategy.eligible).toBe(false);
  });

  it('transient is retryable with max 5', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.Transient);
    expect(strategy.eligible).toBe(true);
    expect(strategy.maxRetries).toBe(5);
  });

  it('standardization failure is retryable (NinjaOne idempotent)', () => {
    const strategy = getRetryStrategy(WhiteGloveFailureClass.StandardizationFailure);
    expect(strategy.eligible).toBe(true);
    expect(strategy.maxRetries).toBe(3);
  });
});

// ─── Compensation Actions ───────────────────────────────────────────────────

describe('getCompensationActions', () => {
  it('connector failure has no compensation', () => {
    const actions = getCompensationActions(WhiteGloveFailureClass.ConnectorFailure);
    expect(actions).toEqual(['none']);
  });

  it('enrollment failure includes unenroll', () => {
    const actions = getCompensationActions(WhiteGloveFailureClass.EnrollmentFailure);
    expect(actions).toContain('unenroll-device');
  });

  it('profile assignment failure includes unassign', () => {
    const actions = getCompensationActions(WhiteGloveFailureClass.ProfileAssignmentFailure);
    expect(actions).toContain('unassign-profile');
  });

  it('operator cancellation has full compensation', () => {
    const actions = getCompensationActions(WhiteGloveFailureClass.OperatorCancellation);
    expect(actions.length).toBeGreaterThan(1);
    expect(actions).toContain('unenroll-device');
    expect(actions).toContain('unassign-profile');
  });
});

// ─── Repair Guidance ────────────────────────────────────────────────────────

describe('getRepairGuidance', () => {
  it('returns guidance for each failure class', () => {
    for (const failureClass of Object.values(WhiteGloveFailureClass)) {
      const guidance = getRepairGuidance(failureClass);
      expect(guidance.summary).toBeTruthy();
      expect(guidance.steps.length).toBeGreaterThan(0);
      expect(typeof guidance.requiresAdminAction).toBe('boolean');
    }
  });

  it('connector failure requires admin action', () => {
    const guidance = getRepairGuidance(WhiteGloveFailureClass.ConnectorFailure);
    expect(guidance.requiresAdminAction).toBe(true);
  });

  it('permission denied requires admin action', () => {
    const guidance = getRepairGuidance(WhiteGloveFailureClass.PermissionDenied);
    expect(guidance.requiresAdminAction).toBe(true);
  });

  it('standardization failure does not require admin action', () => {
    const guidance = getRepairGuidance(WhiteGloveFailureClass.StandardizationFailure);
    expect(guidance.requiresAdminAction).toBe(false);
  });
});

// ─── Failure Classification ─────────────────────────────────────────────────

describe('classifyWhiteGloveFailure', () => {
  it('classifies permission errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Unauthorized access'), 'microsoft')).toBe(WhiteGloveFailureClass.PermissionDenied);
    expect(classifyWhiteGloveFailure(new Error('Forbidden'), 'apple')).toBe(WhiteGloveFailureClass.PermissionDenied);
  });

  it('classifies connector errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Connection refused'), 'microsoft')).toBe(WhiteGloveFailureClass.ConnectorFailure);
    expect(classifyWhiteGloveFailure(new Error('Request timeout'), 'ninjaone')).toBe(WhiteGloveFailureClass.ConnectorFailure);
  });

  it('classifies enrollment errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Enrollment rejected'), 'microsoft')).toBe(WhiteGloveFailureClass.EnrollmentFailure);
    expect(classifyWhiteGloveFailure(new Error('ADE registration failed'), 'apple')).toBe(WhiteGloveFailureClass.EnrollmentFailure);
  });

  it('classifies NinjaOne standardization errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Bundle deployment failed'), 'ninjaone')).toBe(WhiteGloveFailureClass.StandardizationFailure);
    expect(classifyWhiteGloveFailure(new Error('Policy apply error'), 'ninjaone')).toBe(WhiteGloveFailureClass.StandardizationFailure);
  });

  it('classifies profile assignment errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Profile assignment failed'), 'microsoft')).toBe(WhiteGloveFailureClass.ProfileAssignmentFailure);
  });

  it('defaults to transient for unknown errors', () => {
    expect(classifyWhiteGloveFailure(new Error('Something unexpected'), 'control-plane')).toBe(WhiteGloveFailureClass.Transient);
  });
});
