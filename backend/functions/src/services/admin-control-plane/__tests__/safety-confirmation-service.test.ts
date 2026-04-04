import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminDomain,
  AdminRiskLevel,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  IAdminActorContext,
  IAdminExecutionScope,
} from '@hbc/models/admin-control-plane';
import {
  validateConfirmation,
  recordConfirmation,
  executeConfirmationFlow,
  requiresCheckpointExecution,
  requiresDestructiveConfirmation,
} from '../safety-confirmation-service.js';
import {
  registerSafetyProfile,
  clearSafetyRegistry,
  buildSafetyProfile,
} from '../safety-policy-registry.js';

/**
 * P11-07: Destructive-action confirmation service tests.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@test.com',
  oid: 'oid-001',
  displayName: 'Test Admin',
  timestamp: '2026-04-04T10:00:00.000Z',
};

const TEST_SCOPE: IAdminExecutionScope = {
  domain: 'entra-control' as AdminDomain,
  targetEntityId: 'user-001',
  targetEntityLabel: 'John Doe',
  affectedResourceCount: 1,
  scopeDescription: 'Delete user identity.',
};

const DESTRUCTIVE_ACTION = 'entra-control:user:delete' as AdminActionKey;
const ROUTINE_ACTION = 'provisioning-rollout:failure:archive' as AdminActionKey;
const ELEVATED_ACTION = 'app-binding:binding:publish' as AdminActionKey;

beforeEach(() => {
  clearSafetyRegistry();
  // Register profiles for test actions
  registerSafetyProfile(buildSafetyProfile(DESTRUCTIVE_ACTION, AdminDomain.EntraControl, AdminRiskLevel.High));
  registerSafetyProfile(buildSafetyProfile(ROUTINE_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.Low));
  registerSafetyProfile(buildSafetyProfile(ELEVATED_ACTION, AdminDomain.AppBinding, AdminRiskLevel.Moderate));
});

// ─── Confirmation Validation ───────────────────────────────────────────────────

describe('P11-07 validateConfirmation', () => {
  it('passes for routine actions (no confirmation required)', () => {
    const result = validateConfirmation({ actionKey: ROUTINE_ACTION, operatorAcknowledgment: '' });
    expect(result.valid).toBe(true);
    expect(result.confirmationType).toBe('none');
  });

  it('passes for elevated actions with standard acknowledgment', () => {
    const result = validateConfirmation({
      actionKey: ELEVATED_ACTION,
      operatorAcknowledgment: 'confirm',
      previewEvidenceId: 'ev-001',
    });
    expect(result.valid).toBe(true);
    expect(result.confirmationType).toBe('standard');
  });

  it('fails for elevated actions with empty acknowledgment', () => {
    const result = validateConfirmation({
      actionKey: ELEVATED_ACTION,
      operatorAcknowledgment: '',
      previewEvidenceId: 'ev-001',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('acknowledgment'))).toBe(true);
  });

  it('fails for destructive actions with wrong phrase', () => {
    const result = validateConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'wrong-phrase',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      'DELETE',
    );
    expect(result.valid).toBe(false);
    expect(result.confirmationType).toBe('enhanced');
    expect(result.errors.some(e => e.includes('DELETE'))).toBe(true);
  });

  it('passes for destructive actions with correct phrase', () => {
    const result = validateConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      'DELETE',
    );
    expect(result.valid).toBe(true);
    expect(result.confirmationType).toBe('enhanced');
  });

  it('defaults to CONFIRM when no phrase specified for enhanced', () => {
    const result = validateConfirmation({
      actionKey: DESTRUCTIVE_ACTION,
      operatorAcknowledgment: 'CONFIRM',
      previewEvidenceId: 'ev-001',
      scopeDeclared: true,
    });
    expect(result.valid).toBe(true);
  });

  it('fails for destructive actions without scope declaration', () => {
    const result = validateConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: false,
      },
      'DELETE',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Scope'))).toBe(true);
  });

  it('fails for destructive actions without preview evidence', () => {
    const result = validateConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        scopeDeclared: true,
      },
      'DELETE',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Preview evidence'))).toBe(true);
  });

  it('fails for unregistered actions', () => {
    const result = validateConfirmation({
      actionKey: 'unknown:action:key' as AdminActionKey,
      operatorAcknowledgment: 'confirm',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('No safety profile'))).toBe(true);
  });
});

// ─── Confirmation Recording ────────────────────────────────────────────────────

describe('P11-07 recordConfirmation', () => {
  it('returns evidence ID and confirmation payload', async () => {
    const result = await recordConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      TEST_ACTOR,
      TEST_SCOPE,
    );
    expect(result.confirmationEvidenceId).toBeTruthy();
    expect(result.confirmationPayload.actionKey).toBe(DESTRUCTIVE_ACTION);
    expect(result.confirmationPayload.confirmationType).toBe('enhanced');
    expect(result.confirmationPayload.operatorAcknowledgment).toBe('DELETE');
    expect(result.confirmationPayload.previewEvidenceId).toBe('ev-001');
    expect(result.confirmationPayload.confirmedBy).toBe(TEST_ACTOR);
  });

  it('records audit and evidence when services provided', async () => {
    const auditRecords: unknown[] = [];
    const evidenceRecords: unknown[] = [];

    const mockAudit = {
      recordEvent: async (r: unknown) => { auditRecords.push(r); },
      listByRunId: async () => [],
      listByEventType: async () => [],
    };

    const mockEvidence = {
      recordEvidence: async (r: unknown) => { evidenceRecords.push(r); },
      listByRunId: async () => [],
      getEvidence: async () => null,
    };

    await recordConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      TEST_ACTOR,
      TEST_SCOPE,
      mockAudit,
      mockEvidence,
    );

    expect(auditRecords).toHaveLength(1);
    expect(evidenceRecords).toHaveLength(1);
  });

  it('includes rationale when provided', async () => {
    const result = await recordConfirmation(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
        rationale: { reason: 'User requested account deletion', externalReference: 'TICKET-123' },
      },
      TEST_ACTOR,
      TEST_SCOPE,
    );
    expect(result.confirmationPayload.rationale).not.toBeNull();
    expect(result.confirmationPayload.rationale!.reason).toBe('User requested account deletion');
    expect(result.confirmationPayload.rationale!.externalReference).toBe('TICKET-123');
  });
});

// ─── Full Confirmation Flow ────────────────────────────────────────────────────

describe('P11-07 executeConfirmationFlow', () => {
  it('returns valid result for correct destructive confirmation', async () => {
    const result = await executeConfirmationFlow(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'DELETE',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      TEST_ACTOR,
      TEST_SCOPE,
      'DELETE',
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.confirmationEvidenceId).toBeTruthy();
    expect(result.confirmationPayload).not.toBeNull();
  });

  it('returns invalid result with errors for failed validation', async () => {
    const result = await executeConfirmationFlow(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'wrong',
        previewEvidenceId: 'ev-001',
        scopeDeclared: true,
      },
      TEST_ACTOR,
      TEST_SCOPE,
      'DELETE',
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.confirmationEvidenceId).toBeNull();
    expect(result.confirmationPayload).toBeNull();
  });

  it('skips recording when validation fails', async () => {
    const auditRecords: unknown[] = [];
    const mockAudit = {
      recordEvent: async (r: unknown) => { auditRecords.push(r); },
      listByRunId: async () => [],
      listByEventType: async () => [],
    };

    await executeConfirmationFlow(
      {
        actionKey: DESTRUCTIVE_ACTION,
        operatorAcknowledgment: 'wrong',
        scopeDeclared: true,
      },
      TEST_ACTOR,
      TEST_SCOPE,
      'DELETE',
      mockAudit,
    );

    expect(auditRecords).toHaveLength(0); // no recording for invalid confirmation
  });
});

// ─── Checkpoint Bridge ─────────────────────────────────────────────────────────

describe('P11-07 checkpoint bridge helpers', () => {
  it('requiresCheckpointExecution returns true for checkpointed mode', () => {
    const profile = buildSafetyProfile(ELEVATED_ACTION, AdminDomain.AppBinding, AdminRiskLevel.Moderate);
    expect(requiresCheckpointExecution(profile)).toBe(true);
  });

  it('requiresCheckpointExecution returns false for destructive mode', () => {
    const profile = buildSafetyProfile(DESTRUCTIVE_ACTION, AdminDomain.EntraControl, AdminRiskLevel.High);
    expect(requiresCheckpointExecution(profile)).toBe(false);
  });

  it('requiresDestructiveConfirmation returns true for enhanced confirmation', () => {
    const profile = buildSafetyProfile(DESTRUCTIVE_ACTION, AdminDomain.EntraControl, AdminRiskLevel.High);
    expect(requiresDestructiveConfirmation(profile)).toBe(true);
  });

  it('requiresDestructiveConfirmation returns false for standard confirmation', () => {
    const profile = buildSafetyProfile(ELEVATED_ACTION, AdminDomain.AppBinding, AdminRiskLevel.Moderate);
    expect(requiresDestructiveConfirmation(profile)).toBe(false);
  });

  it('requiresDestructiveConfirmation returns false for no confirmation', () => {
    const profile = buildSafetyProfile(ROUTINE_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.Low);
    expect(requiresDestructiveConfirmation(profile)).toBe(false);
  });
});
