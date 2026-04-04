import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminDomain,
  AdminRiskLevel,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  IAdminActorContext,
  IAdminPostRunValidationCheck,
  IAdminRecoveryGuidance,
} from '@hbc/models/admin-control-plane';
import {
  registerPostRunValidationProvider,
  clearPostRunValidationProviders,
  executePostRunValidation,
  registerRecoveryGuidanceProvider,
  clearRecoveryGuidanceProviders,
  generateRecoveryGuidance,
  assembleSafetyEvidenceSummary,
} from '../safety-post-run-service.js';
import type {
  IPostRunValidationProvider,
  IRecoveryGuidanceProvider,
} from '../safety-post-run-service.js';
import {
  registerSafetyProfile,
  clearSafetyRegistry,
  buildSafetyProfile,
} from '../safety-policy-registry.js';

/**
 * P11-08: Post-run validation, recovery guidance, and evidence tests.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@test.com',
  oid: 'oid-001',
  displayName: 'Test Admin',
  timestamp: '2026-04-04T10:00:00.000Z',
};

const DESTRUCTIVE_ACTION = 'entra-control:user:delete' as AdminActionKey;
const ELEVATED_ACTION = 'app-binding:binding:publish' as AdminActionKey;

beforeEach(() => {
  clearPostRunValidationProviders();
  clearRecoveryGuidanceProviders();
  clearSafetyRegistry();
  registerSafetyProfile(buildSafetyProfile(DESTRUCTIVE_ACTION, AdminDomain.EntraControl, AdminRiskLevel.High));
  registerSafetyProfile(buildSafetyProfile(ELEVATED_ACTION, AdminDomain.AppBinding, AdminRiskLevel.Moderate));
});

// ─── Post-Run Validation ───────────────────────────────────────────────────────

describe('P11-08 executePostRunValidation', () => {
  it('returns truthful result when no provider is registered', async () => {
    const result = await executePostRunValidation(
      { actionKey: DESTRUCTIVE_ACTION, runId: 'run-001', commandInput: {}, targetEntityId: null },
      TEST_ACTOR,
    );
    expect(result.allPassed).toBe(true);
    expect(result.summary.checks).toHaveLength(1);
    expect(result.summary.checks[0].checkId).toBe('no-provider');
    expect(result.summary.checks[0].message).toContain('Manual verification');
    expect(result.evidenceId).toBeTruthy();
  });

  it('uses domain-specific provider when registered', async () => {
    const provider: IPostRunValidationProvider = {
      generateChecks: async () => [
        { checkId: 'user-deleted', label: 'User removed', passed: true, message: 'User no longer exists in directory.' },
        { checkId: 'groups-cleaned', label: 'Group memberships removed', passed: false, message: 'User still listed in 2 security groups.' },
      ],
    };
    registerPostRunValidationProvider(DESTRUCTIVE_ACTION, provider);

    const result = await executePostRunValidation(
      { actionKey: DESTRUCTIVE_ACTION, runId: 'run-001', commandInput: {}, targetEntityId: 'user-001' },
      TEST_ACTOR,
    );
    expect(result.allPassed).toBe(false);
    expect(result.summary.checks).toHaveLength(2);
    expect(result.summary.checks[1].passed).toBe(false);
  });

  it('falls back to domain-level provider', async () => {
    const domainProvider: IPostRunValidationProvider = {
      generateChecks: async () => [
        { checkId: 'domain-check', label: 'Domain check', passed: true, message: 'OK' },
      ],
    };
    registerPostRunValidationProvider(AdminDomain.EntraControl, domainProvider);

    const result = await executePostRunValidation(
      { actionKey: DESTRUCTIVE_ACTION, runId: 'run-001', commandInput: {}, targetEntityId: null },
      TEST_ACTOR,
    );
    expect(result.summary.checks[0].checkId).toBe('domain-check');
  });

  it('captures evidence and audit when services provided', async () => {
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

    await executePostRunValidation(
      { actionKey: DESTRUCTIVE_ACTION, runId: 'run-001', commandInput: {}, targetEntityId: null },
      TEST_ACTOR,
      mockAudit,
      mockEvidence,
    );

    expect(auditRecords).toHaveLength(1);
    expect(evidenceRecords).toHaveLength(1);
  });
});

// ─── Recovery Guidance ─────────────────────────────────────────────────────────

describe('P11-08 generateRecoveryGuidance', () => {
  it('returns default guidance when no provider is registered', async () => {
    const result = await generateRecoveryGuidance(
      {
        actionKey: DESTRUCTIVE_ACTION,
        runId: 'run-001',
        failureClass: 'permissions',
        commandInput: {},
        targetEntityId: null,
      },
      TEST_ACTOR,
    );
    expect(result.guidance.steps.length).toBeGreaterThanOrEqual(3);
    expect(result.guidance.estimatedComplexity).toBe('moderate');
    expect(result.guidance.compensationAvailable).toBe(false);
    expect(result.guidance.failureClass).toBe('permissions');
    expect(result.evidenceId).toBeTruthy();
  });

  it('uses domain-specific provider when registered', async () => {
    const provider: IRecoveryGuidanceProvider = {
      generateGuidance: async (input) => ({
        runId: input.runId,
        actionKey: input.actionKey,
        failureClass: input.failureClass,
        steps: [
          { order: 1, label: 'Re-enable user', description: 'Re-enable the disabled user account.', actionType: 'automatic' as const, actionKey: 'entra-control:user:enable' as AdminActionKey },
        ],
        estimatedComplexity: 'simple' as const,
        compensationAvailable: true,
        externalActions: [],
      }),
    };
    registerRecoveryGuidanceProvider(DESTRUCTIVE_ACTION, provider);

    const result = await generateRecoveryGuidance(
      {
        actionKey: DESTRUCTIVE_ACTION,
        runId: 'run-001',
        failureClass: 'partial',
        commandInput: {},
        targetEntityId: 'user-001',
      },
      TEST_ACTOR,
    );
    expect(result.guidance.compensationAvailable).toBe(true);
    expect(result.guidance.steps[0].actionType).toBe('automatic');
    expect(result.guidance.estimatedComplexity).toBe('simple');
  });

  it('captures evidence and audit when services provided', async () => {
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

    await generateRecoveryGuidance(
      {
        actionKey: DESTRUCTIVE_ACTION,
        runId: 'run-001',
        failureClass: 'structural',
        commandInput: {},
        targetEntityId: null,
      },
      TEST_ACTOR,
      mockAudit,
      mockEvidence,
    );

    expect(auditRecords).toHaveLength(1);
    expect(evidenceRecords).toHaveLength(1);
  });

  it('includes failure class in default guidance description', async () => {
    const result = await generateRecoveryGuidance(
      {
        actionKey: DESTRUCTIVE_ACTION,
        runId: 'run-001',
        failureClass: 'admin-class',
        commandInput: {},
        targetEntityId: null,
      },
      TEST_ACTOR,
    );
    const step2 = result.guidance.steps.find(s => s.order === 2);
    expect(step2?.description).toContain('admin-class');
  });
});

// ─── Safety Evidence Summary ───────────────────────────────────────────────────

describe('P11-08 assembleSafetyEvidenceSummary', () => {
  it('assembles summary with all evidence IDs present', async () => {
    const summary = await assembleSafetyEvidenceSummary({
      runId: 'run-001',
      actionKey: DESTRUCTIVE_ACTION,
      previewEvidenceId: 'ev-preview',
      confirmationEvidenceId: 'ev-confirm',
      validationEvidenceId: 'ev-validate',
      recoveryEvidenceId: 'ev-recover',
    });

    expect(summary.runId).toBe('run-001');
    expect(summary.actionKey).toBe(DESTRUCTIVE_ACTION);
    expect(summary.previewCaptured).toBe(true);
    expect(summary.confirmationCaptured).toBe(true);
    expect(summary.validationCaptured).toBe(true);
    expect(summary.recoveryCaptured).toBe(true);
    expect(summary.controlsSkipped).toHaveLength(0);
  });

  it('reports skipped controls when evidence is missing', async () => {
    const summary = await assembleSafetyEvidenceSummary({
      runId: 'run-001',
      actionKey: DESTRUCTIVE_ACTION,
      // No preview, no confirmation, no validation, no recovery
    });

    expect(summary.previewCaptured).toBe(false);
    expect(summary.confirmationCaptured).toBe(false);
    expect(summary.validationCaptured).toBe(false);
    expect(summary.recoveryCaptured).toBe(false);
    expect(summary.controlsSkipped.length).toBeGreaterThan(0);
  });

  it('uses profile risk level', async () => {
    const summary = await assembleSafetyEvidenceSummary({
      runId: 'run-001',
      actionKey: DESTRUCTIVE_ACTION,
    });
    expect(summary.riskLevel).toBe(AdminRiskLevel.High);
  });

  it('queries evidence service for refs when provided', async () => {
    const mockEvidence = {
      recordEvidence: async () => {},
      listByRunId: async () => [
        {
          evidenceId: 'ev-001',
          evidenceType: 'preview-result' as const,
          label: 'Preview',
          runId: 'run-001',
          stepNumber: null,
          capturedAt: '2026-04-04T10:00:00.000Z',
          storageLocator: 'inline://test',
        },
      ],
      getEvidence: async () => null,
    };

    const summary = await assembleSafetyEvidenceSummary(
      { runId: 'run-001', actionKey: DESTRUCTIVE_ACTION },
      mockEvidence,
    );
    expect(summary.evidenceRefs).toHaveLength(1);
  });
});
