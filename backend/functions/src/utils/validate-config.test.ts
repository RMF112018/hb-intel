import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';
import { validateRequiredConfig } from './validate-config.js';

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

describe('validateRequiredConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set all required vars to valid values
    process.env = { ...originalEnv };
    for (const entry of WAVE0_REQUIRED_CONFIG) {
      if (entry.requiredInProd) {
        process.env[entry.name] = `test-value-${entry.name}`;
      }
    }
  });

  afterEach(() => {
    process.env = originalEnv;
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
});
