import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';
import { validateRequiredConfig, shouldValidateConfig, validateProvisioningPrerequisites } from './validate-config.js';

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
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://example.sharepoint.com');
    vi.stubEnv('SHAREPOINT_HUB_SITE_ID', 'hub-id');
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://example.sharepoint.com/sites/appcatalog');
    vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-id');
    vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');
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
    delete process.env.SITES_SELECTED_GRANT_CONFIRMED;
    expect(() => validateProvisioningPrerequisites()).not.toThrow();
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
