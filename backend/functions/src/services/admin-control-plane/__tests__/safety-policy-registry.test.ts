import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminDomain,
  AdminRiskLevel,
  AdminExecutionMode,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type { AdminActionKey, IAdminSafetyProfile } from '@hbc/models/admin-control-plane';
import {
  registerSafetyProfile,
  getSafetyProfile,
  listSafetyProfiles,
  clearSafetyRegistry,
  getDefaultControlsForRiskLevel,
  getDefaultConfirmationType,
  buildSafetyProfile,
  evaluateSafetyGates,
  requireSafetyGates,
  requireSafetyProfile,
  getRequiredEvidenceControls,
  isControlRequired,
  isPostRunValidationRequired,
  isRecoveryGuidanceRequired,
} from '../safety-policy-registry.js';
import { registerDefaultSafetyProfiles } from '../safety-action-catalog.js';

/**
 * P11-04: Safety policy registry and enforcement tests.
 */

const TEST_ACTION_KEY = 'provisioning-rollout:saga:launch' as AdminActionKey;

const TEST_PROFILE: IAdminSafetyProfile = {
  actionKey: TEST_ACTION_KEY,
  domain: AdminDomain.ProvisioningRollout,
  riskLevel: AdminRiskLevel.Moderate,
  executionMode: AdminExecutionMode.Checkpointed,
  requiredControls: [
    AdminSafetyControl.Preview,
    AdminSafetyControl.StandardConfirmation,
    AdminSafetyControl.AuditRecord,
    AdminSafetyControl.InputEvidence,
    AdminSafetyControl.PreviewEvidence,
    AdminSafetyControl.ExecutionEvidence,
  ],
  supportsPreview: true,
  supportsDryRun: false,
  confirmationType: 'standard',
  scopeDescription: 'Launches provisioning for a single project site.',
};

beforeEach(() => {
  clearSafetyRegistry();
});

// ─── Registry CRUD ─────────────────────────────────────────────────────────────

describe('P11-04 registerSafetyProfile', () => {
  it('registers and retrieves a profile', () => {
    registerSafetyProfile(TEST_PROFILE);
    expect(getSafetyProfile(TEST_ACTION_KEY)).toEqual(TEST_PROFILE);
  });

  it('returns null for unregistered action', () => {
    expect(getSafetyProfile('unknown:action:key' as AdminActionKey)).toBeNull();
  });

  it('overwrites existing profile for same key', () => {
    registerSafetyProfile(TEST_PROFILE);
    const updated = { ...TEST_PROFILE, riskLevel: AdminRiskLevel.High };
    registerSafetyProfile(updated);
    expect(getSafetyProfile(TEST_ACTION_KEY)?.riskLevel).toBe(AdminRiskLevel.High);
  });

  it('lists all registered profiles', () => {
    registerSafetyProfile(TEST_PROFILE);
    const profiles = listSafetyProfiles();
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toEqual(TEST_PROFILE);
  });

  it('clear removes all profiles', () => {
    registerSafetyProfile(TEST_PROFILE);
    clearSafetyRegistry();
    expect(listSafetyProfiles()).toHaveLength(0);
  });
});

// ─── Default Controls ──────────────────────────────────────────────────────────

describe('P11-04 getDefaultControlsForRiskLevel', () => {
  it('returns empty for read-only', () => {
    expect(getDefaultControlsForRiskLevel(AdminRiskLevel.ReadOnly)).toEqual([]);
  });

  it('returns audit + execution evidence for low/routine', () => {
    const controls = getDefaultControlsForRiskLevel(AdminRiskLevel.Low);
    expect(controls).toContain(AdminSafetyControl.AuditRecord);
    expect(controls).toContain(AdminSafetyControl.ExecutionEvidence);
    expect(controls).not.toContain(AdminSafetyControl.Preview);
  });

  it('returns preview + standard confirmation for moderate/elevated', () => {
    const controls = getDefaultControlsForRiskLevel(AdminRiskLevel.Moderate);
    expect(controls).toContain(AdminSafetyControl.Preview);
    expect(controls).toContain(AdminSafetyControl.StandardConfirmation);
    expect(controls).not.toContain(AdminSafetyControl.EnhancedConfirmation);
  });

  it('returns enhanced confirmation + post-run + recovery for high/destructive', () => {
    const controls = getDefaultControlsForRiskLevel(AdminRiskLevel.High);
    expect(controls).toContain(AdminSafetyControl.EnhancedConfirmation);
    expect(controls).toContain(AdminSafetyControl.PostRunValidation);
    expect(controls).toContain(AdminSafetyControl.RecoveryGuidance);
    expect(controls).toContain(AdminSafetyControl.ScopeRestriction);
  });

  it('includes dry-run for critical/tenant-sensitive', () => {
    const controls = getDefaultControlsForRiskLevel(AdminRiskLevel.Critical);
    expect(controls).toContain(AdminSafetyControl.DryRun);
    expect(controls).toContain(AdminSafetyControl.EnhancedConfirmation);
  });
});

describe('P11-04 getDefaultConfirmationType', () => {
  it('returns none for read-only and low', () => {
    expect(getDefaultConfirmationType(AdminRiskLevel.ReadOnly)).toBe('none');
    expect(getDefaultConfirmationType(AdminRiskLevel.Low)).toBe('none');
  });

  it('returns standard for moderate', () => {
    expect(getDefaultConfirmationType(AdminRiskLevel.Moderate)).toBe('standard');
  });

  it('returns enhanced for high and critical', () => {
    expect(getDefaultConfirmationType(AdminRiskLevel.High)).toBe('enhanced');
    expect(getDefaultConfirmationType(AdminRiskLevel.Critical)).toBe('enhanced');
  });
});

// ─── Profile Builder ───────────────────────────────────────────────────────────

describe('P11-04 buildSafetyProfile', () => {
  it('derives defaults from risk level', () => {
    const profile = buildSafetyProfile(
      'entra-control:user:delete' as AdminActionKey,
      AdminDomain.EntraControl,
      AdminRiskLevel.High,
    );
    expect(profile.executionMode).toBe(AdminExecutionMode.Destructive);
    expect(profile.confirmationType).toBe('enhanced');
    expect(profile.supportsPreview).toBe(true);
    expect(profile.requiredControls).toContain(AdminSafetyControl.PostRunValidation);
  });

  it('allows overrides', () => {
    const profile = buildSafetyProfile(
      'setup-install:checkpoint:approve' as AdminActionKey,
      AdminDomain.SetupInstall,
      AdminRiskLevel.Moderate,
      {
        supportsPreview: false,
        scopeDescription: 'Approves a checkpoint.',
      },
    );
    expect(profile.supportsPreview).toBe(false);
    expect(profile.scopeDescription).toBe('Approves a checkpoint.');
  });

  it('sets advisory mode for read-only', () => {
    const profile = buildSafetyProfile(
      'setup-install:preflight:run' as AdminActionKey,
      AdminDomain.SetupInstall,
      AdminRiskLevel.ReadOnly,
    );
    expect(profile.executionMode).toBe(AdminExecutionMode.Advisory);
    expect(profile.requiredControls).toEqual([]);
    expect(profile.supportsPreview).toBe(false);
    expect(profile.confirmationType).toBe('none');
  });
});

// ─── Safety Gate Evaluation ────────────────────────────────────────────────────

describe('P11-04 evaluateSafetyGates', () => {
  it('passes when all required controls are satisfied', () => {
    registerSafetyProfile(TEST_PROFILE);
    const result = evaluateSafetyGates(TEST_PROFILE, {
      previewCompleted: true,
      previewEvidenceId: 'ev-001',
      confirmationCaptured: true,
    });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('fails when preview is missing', () => {
    const result = evaluateSafetyGates(TEST_PROFILE, {
      confirmationCaptured: true,
    });
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('Preview'))).toBe(true);
  });

  it('fails when confirmation is missing', () => {
    const result = evaluateSafetyGates(TEST_PROFILE, {
      previewCompleted: true,
      previewEvidenceId: 'ev-001',
    });
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('confirmation'))).toBe(true);
  });

  it('fails when preview evidence ID is missing', () => {
    const result = evaluateSafetyGates(TEST_PROFILE, {
      previewCompleted: true,
      confirmationCaptured: true,
    });
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('evidence ID'))).toBe(true);
  });

  it('checks scope for destructive actions', () => {
    const destructive = buildSafetyProfile(
      'provisioning-rollout:saga:force-state-transition' as AdminActionKey,
      AdminDomain.ProvisioningRollout,
      AdminRiskLevel.High,
    );
    const result = evaluateSafetyGates(destructive, {
      previewCompleted: true,
      previewEvidenceId: 'ev-001',
      confirmationCaptured: true,
      // scopeDeclared is missing
    });
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('Scope'))).toBe(true);
  });

  it('passes empty controls for read-only', () => {
    const readOnly = buildSafetyProfile(
      'setup-install:preflight:run' as AdminActionKey,
      AdminDomain.SetupInstall,
      AdminRiskLevel.ReadOnly,
    );
    const result = evaluateSafetyGates(readOnly, {});
    expect(result.passed).toBe(true);
  });

  it('skips dry-run check when not supported even if in controls', () => {
    const profile: IAdminSafetyProfile = {
      ...TEST_PROFILE,
      requiredControls: [AdminSafetyControl.DryRun],
      supportsDryRun: false, // not supported
    };
    const result = evaluateSafetyGates(profile, {});
    expect(result.passed).toBe(true); // skipped because not supported
  });

  it('enforces dry-run when supported', () => {
    const profile: IAdminSafetyProfile = {
      ...TEST_PROFILE,
      requiredControls: [AdminSafetyControl.DryRun],
      supportsDryRun: true,
    };
    const result = evaluateSafetyGates(profile, {});
    expect(result.passed).toBe(false);
    expect(result.violations.some((v) => v.includes('Dry-run'))).toBe(true);
  });
});

// ─── HTTP Enforcement ──────────────────────────────────────────────────────────

describe('P11-04 requireSafetyGates', () => {
  it('returns null when no profile is registered', () => {
    expect(requireSafetyGates('unknown:action:key' as AdminActionKey, {})).toBeNull();
  });

  it('returns null when all gates pass', () => {
    registerSafetyProfile(TEST_PROFILE);
    const result = requireSafetyGates(TEST_ACTION_KEY, {
      previewCompleted: true,
      previewEvidenceId: 'ev-001',
      confirmationCaptured: true,
    });
    expect(result).toBeNull();
  });

  it('returns 422 when gates fail', () => {
    registerSafetyProfile(TEST_PROFILE);
    const result = requireSafetyGates(TEST_ACTION_KEY, {}, 'req-001');
    expect(result).not.toBeNull();
    expect(result?.status).toBe(422);
    const body = result?.jsonBody as Record<string, unknown>;
    expect(body.code).toBe('SAFETY_GATES_UNSATISFIED');
    expect(body.requestId).toBe('req-001');
  });
});

describe('P11-04 requireSafetyProfile', () => {
  it('returns profile when registered', () => {
    registerSafetyProfile(TEST_PROFILE);
    const [denied, profile] = requireSafetyProfile(TEST_ACTION_KEY);
    expect(denied).toBeNull();
    expect(profile).toEqual(TEST_PROFILE);
  });

  it('returns 400 when not registered', () => {
    const [denied, profile] = requireSafetyProfile('unknown:action:key' as AdminActionKey, 'req-001');
    expect(denied).not.toBeNull();
    expect(denied?.status).toBe(400);
    expect(profile).toBeNull();
  });
});

// ─── Query Helpers ─────────────────────────────────────────────────────────────

describe('P11-04 query helpers', () => {
  it('getRequiredEvidenceControls returns only evidence controls', () => {
    const evidence = getRequiredEvidenceControls(TEST_PROFILE);
    expect(evidence).toContain(AdminSafetyControl.InputEvidence);
    expect(evidence).toContain(AdminSafetyControl.PreviewEvidence);
    expect(evidence).toContain(AdminSafetyControl.ExecutionEvidence);
    expect(evidence).not.toContain(AdminSafetyControl.Preview);
    expect(evidence).not.toContain(AdminSafetyControl.AuditRecord);
  });

  it('isControlRequired returns correct boolean', () => {
    expect(isControlRequired(TEST_PROFILE, AdminSafetyControl.Preview)).toBe(true);
    expect(isControlRequired(TEST_PROFILE, AdminSafetyControl.DryRun)).toBe(false);
  });

  it('isPostRunValidationRequired returns correct boolean', () => {
    expect(isPostRunValidationRequired(TEST_PROFILE)).toBe(false);
    const destructive = buildSafetyProfile(
      'test:action:destructive' as AdminActionKey,
      AdminDomain.ProvisioningRollout,
      AdminRiskLevel.High,
    );
    expect(isPostRunValidationRequired(destructive)).toBe(true);
  });

  it('isRecoveryGuidanceRequired returns correct boolean', () => {
    expect(isRecoveryGuidanceRequired(TEST_PROFILE)).toBe(false);
    const destructive = buildSafetyProfile(
      'test:action:destructive' as AdminActionKey,
      AdminDomain.ProvisioningRollout,
      AdminRiskLevel.High,
    );
    expect(isRecoveryGuidanceRequired(destructive)).toBe(true);
  });
});

// ─── Action Catalog ────────────────────────────────────────────────────────────

describe('P11-04 registerDefaultSafetyProfiles', () => {
  it('registers all expected profiles', () => {
    registerDefaultSafetyProfiles();
    const profiles = listSafetyProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(20);
  });

  it('registers provisioning force-state-transition as high risk', () => {
    registerDefaultSafetyProfiles();
    const profile = getSafetyProfile('provisioning-rollout:saga:force-state-transition' as AdminActionKey);
    expect(profile).not.toBeNull();
    expect(profile!.riskLevel).toBe(AdminRiskLevel.High);
    expect(profile!.executionMode).toBe(AdminExecutionMode.Destructive);
    expect(profile!.requiredControls).toContain(AdminSafetyControl.EnhancedConfirmation);
    expect(profile!.requiredControls).toContain(AdminSafetyControl.PostRunValidation);
    expect(profile!.requiredControls).toContain(AdminSafetyControl.RecoveryGuidance);
  });

  it('registers entra user delete as high risk', () => {
    registerDefaultSafetyProfiles();
    const profile = getSafetyProfile('entra-control:user:delete' as AdminActionKey);
    expect(profile).not.toBeNull();
    expect(profile!.riskLevel).toBe(AdminRiskLevel.High);
    expect(profile!.confirmationType).toBe('enhanced');
  });

  it('registers entra user create AD DS as high risk', () => {
    registerDefaultSafetyProfiles();
    const profile = getSafetyProfile('entra-control:user:create-ad-ds' as AdminActionKey);
    expect(profile).not.toBeNull();
    expect(profile!.riskLevel).toBe(AdminRiskLevel.High);
  });

  it('registers provisioning archive as low risk', () => {
    registerDefaultSafetyProfiles();
    const profile = getSafetyProfile('provisioning-rollout:failure:archive' as AdminActionKey);
    expect(profile).not.toBeNull();
    expect(profile!.riskLevel).toBe(AdminRiskLevel.Low);
    expect(profile!.confirmationType).toBe('none');
  });

  it('registers SharePoint apply-repair as high with dry-run support', () => {
    registerDefaultSafetyProfiles();
    const profile = getSafetyProfile('sharepoint-control:site:apply-repair' as AdminActionKey);
    expect(profile).not.toBeNull();
    expect(profile!.riskLevel).toBe(AdminRiskLevel.High);
    expect(profile!.supportsDryRun).toBe(true);
  });

  it('covers all seven admin domains', () => {
    registerDefaultSafetyProfiles();
    const profiles = listSafetyProfiles();
    const domains = new Set(profiles.map((p) => p.domain));
    expect(domains.has(AdminDomain.ProvisioningRollout)).toBe(true);
    expect(domains.has(AdminDomain.SetupInstall)).toBe(true);
    expect(domains.has(AdminDomain.AppBinding)).toBe(true);
    expect(domains.has(AdminDomain.EntraControl)).toBe(true);
    expect(domains.has(AdminDomain.WhiteGloveDeployment)).toBe(true);
    expect(domains.has(AdminDomain.StandardsConfig)).toBe(true);
    expect(domains.has(AdminDomain.SharePointControl)).toBe(true);
  });
});
