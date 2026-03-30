import { describe, it, expect } from 'vitest';
import {
  WAVE0_REQUIRED_CONFIG,
  WAVE0_OPTIONAL_CONFIG,
  type IConfigEntry,
} from './wave0-env-registry.js';

describe('WAVE0_REQUIRED_CONFIG', () => {
  it('has at least 10 entries', () => {
    expect(WAVE0_REQUIRED_CONFIG.length).toBeGreaterThanOrEqual(10);
  });

  it('core request-lifecycle entries have requiredInProd: true', () => {
    const coreRequired = [
      'AZURE_TENANT_ID', 'AZURE_CLIENT_ID', 'AZURE_TABLE_ENDPOINT',
      'APPLICATIONINSIGHTS_CONNECTION_STRING', 'SHAREPOINT_TENANT_URL',
      'SHAREPOINT_PROJECTS_SITE_URL', 'HBC_ADAPTER_MODE',
      'NOTIFICATION_API_BASE_URL', 'EMAIL_FROM_ADDRESS',
      'OPEX_MANAGER_UPN', 'CONTROLLER_UPNS', 'ADMIN_UPNS',
    ];
    for (const name of coreRequired) {
      const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === name);
      expect(entry, `${name} should exist in registry`).toBeDefined();
      expect(entry!.requiredInProd, `${name} should be requiredInProd`).toBe(true);
    }
  });

  it('deferred provisioning/notification entries have requiredInProd: false', () => {
    const deferred = [
      'AZURE_CLIENT_SECRET', 'AzureSignalRConnectionString',
      'SHAREPOINT_HUB_SITE_ID', 'EMAIL_DELIVERY_API_KEY',
      'SHAREPOINT_APP_CATALOG_URL', 'HB_INTEL_SPFX_APP_ID',
      'GRAPH_GROUP_PERMISSION_CONFIRMED',
    ];
    for (const name of deferred) {
      const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === name);
      expect(entry, `${name} should exist in registry`).toBeDefined();
      expect(entry!.requiredInProd, `${name} should be deferred (not requiredInProd)`).toBe(false);
    }
  });

  it('AZURE_CLIENT_ID description reflects managed-identity role', () => {
    const entry = WAVE0_REQUIRED_CONFIG.find((e) => e.name === 'AZURE_CLIENT_ID');
    expect(entry!.description).toContain('Managed identity client ID');
    expect(entry!.description).toContain('DefaultAzureCredential');
    expect(entry!.description).toContain('API_AUDIENCE');
  });

  it('exact requiredInProd=true set matches managed-identity boot contract', () => {
    const required = WAVE0_REQUIRED_CONFIG
      .filter((e) => e.requiredInProd)
      .map((e) => e.name)
      .sort();
    // This is the pinned contract — if this changes, deployment docs must update
    expect(required).toEqual([
      'ADMIN_UPNS',
      'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'AZURE_CLIENT_ID',
      'AZURE_TABLE_ENDPOINT',
      'AZURE_TENANT_ID',
      'CONTROLLER_UPNS',
      'EMAIL_FROM_ADDRESS',
      'HBC_ADAPTER_MODE',
      'NOTIFICATION_API_BASE_URL',
      'OPEX_MANAGER_UPN',
      'SHAREPOINT_PROJECTS_SITE_URL',
      'SHAREPOINT_TENANT_URL',
    ]);
  });

  it('contains both infrastructure and business bucket entries', () => {
    const buckets = new Set(WAVE0_REQUIRED_CONFIG.map((e) => e.bucket));
    expect(buckets.has('infrastructure')).toBe(true);
    expect(buckets.has('business')).toBe(true);
  });

  it('has no duplicate names', () => {
    const names = WAVE0_REQUIRED_CONFIG.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every entry satisfies IConfigEntry shape', () => {
    for (const entry of WAVE0_REQUIRED_CONFIG) {
      const typed: IConfigEntry = entry;
      expect(typeof typed.name).toBe('string');
      expect(typeof typed.bucket).toBe('string');
      expect(typeof typed.description).toBe('string');
      expect(typeof typed.requiredInProd).toBe('boolean');
      expect(['infrastructure', 'business']).toContain(typed.bucket);
    }
  });
});

describe('WAVE0_OPTIONAL_CONFIG', () => {
  it('has at least 3 entries', () => {
    expect(WAVE0_OPTIONAL_CONFIG.length).toBeGreaterThanOrEqual(3);
  });

  it('all entries have requiredInProd: false', () => {
    for (const entry of WAVE0_OPTIONAL_CONFIG) {
      expect(entry.requiredInProd).toBe(false);
    }
  });

  it('includes SITES_PERMISSION_MODEL', () => {
    const names = WAVE0_OPTIONAL_CONFIG.map((e) => e.name);
    expect(names).toContain('SITES_PERMISSION_MODEL');
  });

  it('includes API_AUDIENCE as optional', () => {
    const entry = WAVE0_OPTIONAL_CONFIG.find((e) => e.name === 'API_AUDIENCE');
    expect(entry).toBeDefined();
    expect(entry!.requiredInProd).toBe(false);
    expect(entry!.description).toContain('inbound API audience');
  });

  it('every entry satisfies IConfigEntry shape', () => {
    for (const entry of WAVE0_OPTIONAL_CONFIG) {
      const typed: IConfigEntry = entry;
      expect(typeof typed.name).toBe('string');
      expect(typeof typed.bucket).toBe('string');
      expect(typeof typed.description).toBe('string');
      expect(typeof typed.requiredInProd).toBe('boolean');
    }
  });

  it('has no duplicate names', () => {
    const names = WAVE0_OPTIONAL_CONFIG.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('no overlap with required config names', () => {
    const requiredNames = new Set(WAVE0_REQUIRED_CONFIG.map((e) => e.name));
    for (const entry of WAVE0_OPTIONAL_CONFIG) {
      expect(requiredNames.has(entry.name)).toBe(false);
    }
  });
});
