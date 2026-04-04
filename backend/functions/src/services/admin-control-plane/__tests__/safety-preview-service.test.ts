import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminDomain,
  AdminRiskLevel,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  IAdminActorContext,
  IAdminSafetyImpactItem,
  IAdminSafetyWarning,
} from '@hbc/models/admin-control-plane';
import {
  registerPreviewProvider,
  getPreviewProvider,
  clearPreviewProviders,
  executeSafetyPreview,
} from '../safety-preview-service.js';
import type {
  IPreviewProvider,
  IPreviewProviderInput,
  IPreviewProviderOutput,
} from '../safety-preview-service.js';
import {
  registerSafetyProfile,
  clearSafetyRegistry,
  buildSafetyProfile,
} from '../safety-policy-registry.js';

/**
 * P11-05: Safety preview pipeline tests.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@test.com',
  oid: 'oid-001',
  displayName: 'Test Admin',
  timestamp: '2026-04-04T10:00:00.000Z',
};

const TEST_ACTION: AdminActionKey = 'provisioning-rollout:saga:force-state-transition' as AdminActionKey;

const TEST_IMPACT_ITEMS: IAdminSafetyImpactItem[] = [
  {
    resource: 'Project Site: PRJ-001',
    changeType: 'update',
    description: 'Force run state from Failed to Completed',
    reversible: false,
    itemRiskLevel: AdminRiskLevel.High,
  },
  {
    resource: 'Audit Record',
    changeType: 'create',
    description: 'Record state transition in audit log',
    reversible: true,
    itemRiskLevel: AdminRiskLevel.ReadOnly,
  },
];

const TEST_WARNINGS: IAdminSafetyWarning[] = [
  {
    severity: 'warning',
    code: 'state-override',
    message: 'Forcing state bypasses normal workflow validation.',
    resource: 'PRJ-001',
  },
];

function createMockProvider(output?: Partial<IPreviewProviderOutput>): IPreviewProvider {
  return {
    generateImpactItems: async (_input: IPreviewProviderInput): Promise<IPreviewProviderOutput> => ({
      impactItems: output?.impactItems ?? TEST_IMPACT_ITEMS,
      warnings: output?.warnings ?? TEST_WARNINGS,
      advisoryNotes: output?.advisoryNotes ?? ['Run will be marked as manually resolved.'],
      scope: output?.scope ?? {
        targetEntityId: 'prj-001',
        targetEntityLabel: 'Project PRJ-001',
        affectedResourceCount: 2,
        scopeDescription: 'Single provisioning run for project PRJ-001.',
      },
      limitations: output?.limitations ?? [],
    }),
  };
}

beforeEach(() => {
  clearPreviewProviders();
  clearSafetyRegistry();
});

// ─── Provider Registry ─────────────────────────────────────────────────────────

describe('P11-05 preview provider registry', () => {
  it('registers and retrieves a provider by action key', () => {
    const provider = createMockProvider();
    registerPreviewProvider(TEST_ACTION, provider);
    expect(getPreviewProvider(TEST_ACTION, AdminDomain.ProvisioningRollout)).toBe(provider);
  });

  it('falls back to domain-level provider', () => {
    const domainProvider = createMockProvider();
    registerPreviewProvider(AdminDomain.ProvisioningRollout, domainProvider);
    expect(getPreviewProvider('other:action:key' as AdminActionKey, AdminDomain.ProvisioningRollout)).toBe(domainProvider);
  });

  it('prefers action-key-specific provider over domain provider', () => {
    const actionProvider = createMockProvider();
    const domainProvider = createMockProvider();
    registerPreviewProvider(TEST_ACTION, actionProvider);
    registerPreviewProvider(AdminDomain.ProvisioningRollout, domainProvider);
    expect(getPreviewProvider(TEST_ACTION, AdminDomain.ProvisioningRollout)).toBe(actionProvider);
  });

  it('returns null for unregistered action and domain', () => {
    expect(getPreviewProvider('unknown:action:key' as AdminActionKey, AdminDomain.ProvisioningRollout)).toBeNull();
  });

  it('clear removes all providers', () => {
    registerPreviewProvider(TEST_ACTION, createMockProvider());
    clearPreviewProviders();
    expect(getPreviewProvider(TEST_ACTION, AdminDomain.ProvisioningRollout)).toBeNull();
  });
});

// ─── Preview Pipeline ──────────────────────────────────────────────────────────

describe('P11-05 executeSafetyPreview', () => {
  it('returns preview with provider output', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview, evidenceId } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: { runId: 'run-001' } },
      TEST_ACTOR,
    );

    expect(preview.actionKey).toBe(TEST_ACTION);
    expect(preview.dryRun).toBe(false);
    expect(preview.riskLevel).toBe(AdminRiskLevel.High);
    expect(preview.impactItems).toHaveLength(2);
    expect(preview.scope.targetEntityId).toBe('prj-001');
    expect(preview.scope.affectedResourceCount).toBe(2);
    expect(preview.previewedAt).toBeTruthy();
    expect(preview.evidenceId).toBe(evidenceId);
    expect(evidenceId).toBeTruthy();
  });

  it('marks as dry-run when requested', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High, {
      supportsDryRun: true,
    }));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {}, dryRun: true },
      TEST_ACTOR,
    );

    expect(preview.dryRun).toBe(true);
  });

  it('adds dry-run-unavailable warning when dry-run not supported', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High, {
      supportsDryRun: false,
    }));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {}, dryRun: true },
      TEST_ACTOR,
    );

    expect(preview.warnings.some(w => w.code === 'dry-run-unavailable')).toBe(true);
  });

  it('adds irreversible-changes warning for high-risk actions with irreversible items', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    expect(preview.warnings.some(w => w.code === 'contains-irreversible-changes')).toBe(true);
  });

  it('adds post-run-validation-required info when profile requires it', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    expect(preview.warnings.some(w => w.code === 'post-run-validation-required')).toBe(true);
  });

  it('does not recommend proceeding when critical warnings exist', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    // Has irreversible items → critical warning → proceedRecommended false
    expect(preview.proceedRecommended).toBe(false);
  });

  it('recommends proceeding when no critical warnings and no blocking limitations', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.Moderate));
    registerPreviewProvider(TEST_ACTION, createMockProvider({
      impactItems: [{ resource: 'Test', changeType: 'create', description: 'Create item', reversible: true, itemRiskLevel: AdminRiskLevel.Low }],
      warnings: [],
      limitations: [],
    }));

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    expect(preview.proceedRecommended).toBe(true);
  });

  it('handles no provider gracefully with truthful limitations', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    // No provider registered

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    expect(preview.impactItems).toHaveLength(0);
    expect(preview.warnings.some(w => w.code === 'preview-limitation')).toBe(true);
    expect(preview.proceedRecommended).toBe(false); // blocking limitation
  });

  it('includes limitation warnings for areas that could not be assessed', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.Moderate));
    registerPreviewProvider(TEST_ACTION, createMockProvider({
      impactItems: [],
      warnings: [],
      limitations: [{ area: 'permissions', reason: 'Insufficient access to check permission state.' }],
    }));

    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    const limitationWarning = preview.warnings.find(w => w.code === 'preview-limitation');
    expect(limitationWarning).toBeTruthy();
    expect(limitationWarning!.message).toContain('permissions');
    expect(limitationWarning!.message).toContain('Insufficient access');
  });

  it('handles missing safety profile gracefully', async () => {
    // No profile registered, no provider registered
    const { preview } = await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
    );

    expect(preview.riskLevel).toBe(AdminRiskLevel.Moderate); // fallback
    expect(preview.impactItems).toHaveLength(0);
    expect(preview.warnings.length).toBeGreaterThan(0);
  });

  it('captures evidence and audit when services provided', async () => {
    registerSafetyProfile(buildSafetyProfile(TEST_ACTION, AdminDomain.ProvisioningRollout, AdminRiskLevel.High));
    registerPreviewProvider(TEST_ACTION, createMockProvider());

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

    await executeSafetyPreview(
      { actionKey: TEST_ACTION, commandInput: {} },
      TEST_ACTOR,
      mockAudit,
      mockEvidence,
    );

    expect(auditRecords).toHaveLength(1);
    expect(evidenceRecords).toHaveLength(1);
  });
});
