import { describe, it, expect } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';

/**
 * P3-05: Auth release-readiness checks.
 *
 * These tests verify that the Phase 3 auth contract is preserved in the
 * configuration registry and cannot silently regress.
 */
describe('P3-05 Auth release-readiness', () => {
  it('API_AUDIENCE is required in production', () => {
    const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === 'API_AUDIENCE');
    expect(entry, 'API_AUDIENCE must be in WAVE0_REQUIRED_CONFIG').toBeDefined();
    expect(entry!.requiredInProd).toBe(true);
  });

  it('AZURE_TENANT_ID is required in production', () => {
    const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === 'AZURE_TENANT_ID');
    expect(entry).toBeDefined();
    expect(entry!.requiredInProd).toBe(true);
  });

  it('AZURE_CLIENT_ID is required in production', () => {
    const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === 'AZURE_CLIENT_ID');
    expect(entry).toBeDefined();
    expect(entry!.requiredInProd).toBe(true);
  });

  it('all 8 production-required settings are present', () => {
    const required = WAVE0_REQUIRED_CONFIG
      .filter((e) => e.requiredInProd)
      .map((e) => e.name)
      .sort();

    expect(required).toEqual([
      'API_AUDIENCE',
      'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'AZURE_CLIENT_ID',
      'AZURE_TABLE_ENDPOINT',
      'AZURE_TENANT_ID',
      'HBC_ADAPTER_MODE',
      'SHAREPOINT_PROJECTS_SITE_URL',
      'SHAREPOINT_TENANT_URL',
    ]);
  });

  it('auth-critical settings are in the infrastructure governance bucket', () => {
    const authSettings = ['AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'API_AUDIENCE'];
    for (const name of authSettings) {
      const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === name);
      expect(entry, `${name} must exist`).toBeDefined();
      expect(entry!.bucket, `${name} must be infrastructure-governed`).toBe('infrastructure');
    }
  });
});
