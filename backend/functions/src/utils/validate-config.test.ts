import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';
import {
  shouldValidateConfig,
  validateProvisioningPrerequisites,
  validateRequiredConfig,
  validateSafetyBackendBindings,
} from './validate-config.js';

vi.mock('../config/wave0-env-registry.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/wave0-env-registry.js')>();
  return {
    ...actual,
    WAVE0_REQUIRED_CONFIG: [
      ...actual.WAVE0_REQUIRED_CONFIG,
      // Synthetic entry with requiredInProd: false to exercise the skip branch
      { name: '_TEST_OPTIONAL_VAR', bucket: 'infrastructure', description: 'test', requiredInProd: false },
    ],
  };
});

const requiredNames = WAVE0_REQUIRED_CONFIG.filter((e) => e.requiredInProd).map((e) => e.name);

describe('shouldValidateConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when adapter mode is proxy and not test', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(true);
  });

  it('returns false when adapter mode is mock', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(false);
  });

  it('returns false when NODE_ENV is test', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'test');
    expect(shouldValidateConfig()).toBe(false);
  });

  it('defaults to proxy mode when HBC_ADAPTER_MODE is unset', () => {
    delete process.env.HBC_ADAPTER_MODE;
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(true);
  });
});

describe('validateRequiredConfig', () => {
  beforeEach(() => {
    // Force proxy/production mode so validation runs
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'production');
    // Set all required vars to valid placeholder values
    for (const name of requiredNames) {
      vi.stubEnv(name, `test-value-${name}`);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not throw when all required vars are set', () => {
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('throws when a single required var is missing', () => {
    delete process.env.AZURE_TENANT_ID;
    expect(() => validateRequiredConfig()).toThrow('AZURE_TENANT_ID');
  });

  it('aggregates all missing vars in the error message', () => {
    delete process.env.AZURE_TENANT_ID;
    delete process.env.AZURE_CLIENT_ID;

    try {
      validateRequiredConfig();
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('AZURE_TENANT_ID');
      expect(message).toContain('AZURE_CLIENT_ID');
      expect(message).toContain('Missing 2 required');
    }
  });

  it('treats empty string as missing', () => {
    process.env.AZURE_TENANT_ID = '';
    expect(() => validateRequiredConfig()).toThrow('AZURE_TENANT_ID');
  });

  it('does not throw when optional vars are absent', () => {
    // All required are set in beforeEach; optional vars are never set
    delete process.env.SITES_PERMISSION_MODEL;
    delete process.env.AzureWebJobsStorage;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('skips validation entirely in mock mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'production');
    // All required vars are unset — would throw if validation ran
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('skips validation entirely in test mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'test');
    // All required vars are unset — would throw if validation ran
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  // P4-03: AZURE_CLIENT_SECRET removed from registry — pure MI deployment.

  it('does NOT require deferred provisioning/notification/role settings for Project Setup boot', () => {
    // All of these are requiredInProd: false — deferred beyond Project Setup lifecycle
    const deferredSettings = [
      'AzureSignalRConnectionString', 'SHAREPOINT_HUB_SITE_ID',
      'EMAIL_DELIVERY_API_KEY', 'SHAREPOINT_APP_CATALOG_URL',
      'HB_INTEL_SPFX_APP_ID', 'GRAPH_GROUP_PERMISSION_CONFIRMED',
      'DEPT_BACKGROUND_ACCESS_COMMERCIAL', 'DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL',
      // Newly demoted for Project Setup-only deployment:
      'NOTIFICATION_API_BASE_URL', 'EMAIL_FROM_ADDRESS', 'OPEX_MANAGER_UPN',
      'CONTROLLER_UPNS', 'ADMIN_UPNS',
    ];
    for (const name of deferredSettings) {
      delete process.env[name];
    }
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('error message references config docs for operator guidance', () => {
    delete process.env.AZURE_TENANT_ID;
    try {
      validateRequiredConfig();
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('wave-0-config-registry');
    }
  });
});

describe('validateProvisioningPrerequisites — Sites.Selected gate', () => {
  beforeEach(() => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'production');
    // Set all existing prerequisites to valid values
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
    vi.stubEnv('AZURE_TENANT_ID', 'tenant-id');
    vi.stubEnv('AZURE_CLIENT_ID', 'client-id');
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://example.sharepoint.com');
    vi.stubEnv('SHAREPOINT_HUB_SITE_ID', 'hub-id');
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://example.sharepoint.com/sites/appcatalog');
    vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-id');
    vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    vi.stubEnv('SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID', 'safety-proof-run-001');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC', '2026-04-22T13:00:00Z');
    vi.stubEnv('SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_ROLLOUT_GATE_ENABLED', 'true');
    vi.stubEnv('SAFETY_ROLLOUT_CHECKPOINT_ID', 'safety-rollout-2026-04-23');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when sites-selected is active and SITES_SELECTED_GRANT_CONFIRMED is not set', () => {
    delete process.env.SITES_PERMISSION_MODEL; // defaults to sites-selected
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    expect(() => validateProvisioningPrerequisites()).toThrow('SITES_SELECTED_GRANT_CONFIRMED');
  });

  it('does not throw when sites-selected is active and SITES_SELECTED_GRANT_CONFIRMED=true', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SITES_SELECTED_GRANT_CONFIRMED', 'true');
    expect(() => validateProvisioningPrerequisites()).not.toThrow();
  });

  it('does not throw when fullcontrol is active even without SITES_SELECTED_GRANT_CONFIRMED', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'fullcontrol');
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'staging-broad');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED', 'true');
    vi.stubEnv('SAFETY_STAGING_BROAD_EXCEPTION_REASON', 'Temporary staging exception until 2026-05-15');
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    expect(() => validateProvisioningPrerequisites()).not.toThrow();
  });

  it('throws when tightened Safety posture proof flags are missing', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    delete process.env.SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED;
    delete process.env.SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED;
    expect(() => validateProvisioningPrerequisites()).toThrow('SAFETY_TIGHTENED_POSTURE_PROOF_NOT_CONFIRMED');
  });

  it('throws when tightened Safety proof bundle metadata is missing', () => {
    vi.stubEnv('SITES_PERMISSION_MODEL', 'sites-selected');
    vi.stubEnv('SAFETY_PERMISSION_POSTURE', 'pre-rollout-tightened');
    delete process.env.SAFETY_TIGHTENED_PROOF_EVIDENCE_ID;
    delete process.env.SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC;
    delete process.env.SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL;
    expect(() => validateProvisioningPrerequisites()).toThrow('SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING');
  });

  it('skips validation in mock mode', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    expect(() => validateProvisioningPrerequisites()).not.toThrow();
  });

  it('error message includes actionable operator guidance', () => {
    delete process.env.SITES_PERMISSION_MODEL;
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    try {
      validateProvisioningPrerequisites();
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('sites-selected-validation.md');
      expect(message).toContain('grant-site-access.sh');
    }
  });
});

describe('validateSafetyBackendBindings preflight', () => {
  beforeEach(() => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://example.sharepoint.com');
    vi.stubEnv('AZURE_CLIENT_ID', 'client-id');
    vi.stubEnv('AZURE_TENANT_ID', 'tenant-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes cleanly when all Safety bindings are present and well-formed', () => {
    expect(validateSafetyBackendBindings()).toEqual([]);
  });

  it('skips validation in mock/test mode', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    delete process.env.SHAREPOINT_TENANT_URL;
    delete process.env.AZURE_CLIENT_ID;
    expect(validateSafetyBackendBindings()).toEqual([]);
  });

  it('reports site-binding-missing when SHAREPOINT_TENANT_URL is absent', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    const issues = validateSafetyBackendBindings();
    const codes = issues.map((i) => i.code);
    expect(codes).toContain('SAFETY_BINDING_TENANT_URL_MISSING');
    expect(issues.find((i) => i.code === 'SAFETY_BINDING_TENANT_URL_MISSING')?.failureClass).toBe('site-binding-missing');
  });

  it('reports site-binding-malformed when SHAREPOINT_TENANT_URL is not https sharepoint.com', () => {
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'http://example.com');
    const issues = validateSafetyBackendBindings();
    const classes = issues.map((i) => i.failureClass);
    expect(classes).toContain('site-binding-malformed');
  });

  it('reports site-binding-malformed for an unparseable URL', () => {
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'not-a-url');
    const issues = validateSafetyBackendBindings();
    expect(issues.map((i) => i.code)).toContain('SAFETY_BINDING_TENANT_URL_MALFORMED');
  });

  it('reports identity-binding-missing when AZURE_CLIENT_ID is absent', () => {
    delete process.env.AZURE_CLIENT_ID;
    const issues = validateSafetyBackendBindings();
    const missingClientId = issues.find((i) => i.code === 'SAFETY_BINDING_AZURE_CLIENT_ID_MISSING');
    expect(missingClientId).toBeDefined();
    expect(missingClientId?.failureClass).toBe('identity-binding-missing');
  });

  it('reports identity-binding-missing when AZURE_TENANT_ID is absent', () => {
    delete process.env.AZURE_TENANT_ID;
    const issues = validateSafetyBackendBindings();
    const missingTenantId = issues.find((i) => i.code === 'SAFETY_BINDING_AZURE_TENANT_ID_MISSING');
    expect(missingTenantId).toBeDefined();
    expect(missingTenantId?.failureClass).toBe('identity-binding-missing');
  });

  it('aggregates all classes when multiple bindings are missing/malformed', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    delete process.env.AZURE_CLIENT_ID;
    const issues = validateSafetyBackendBindings();
    const classes = new Set(issues.map((i) => i.failureClass));
    expect(classes.has('site-binding-missing')).toBe(true);
    expect(classes.has('identity-binding-missing')).toBe(true);
  });
});
