import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';
import { validateRequiredConfig, shouldValidateConfig } from './validate-config.js';

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

  it('returns true when adapter mode is real and not test', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(true);
  });

  it('returns false when adapter mode is mock', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(false);
  });

  it('returns false when NODE_ENV is test', () => {
    vi.stubEnv('HBC_ADAPTER_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'test');
    expect(shouldValidateConfig()).toBe(false);
  });

  it('defaults to real mode when HBC_ADAPTER_MODE is unset', () => {
    delete process.env.HBC_ADAPTER_MODE;
    vi.stubEnv('NODE_ENV', 'production');
    expect(shouldValidateConfig()).toBe(true);
  });
});

describe('validateRequiredConfig', () => {
  beforeEach(() => {
    // Force real/production mode so validation runs
    vi.stubEnv('HBC_ADAPTER_MODE', 'real');
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
    delete process.env.AZURE_CLIENT_SECRET;

    try {
      validateRequiredConfig();
      expect.fail('should have thrown');
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain('AZURE_TENANT_ID');
      expect(message).toContain('AZURE_CLIENT_ID');
      expect(message).toContain('AZURE_CLIENT_SECRET');
      expect(message).toContain('Missing 3 required');
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
    vi.stubEnv('HBC_ADAPTER_MODE', 'real');
    vi.stubEnv('NODE_ENV', 'test');
    // All required vars are unset — would throw if validation ran
    expect(() => validateRequiredConfig()).not.toThrow();
  });
});
