import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WAVE0_REQUIRED_CONFIG } from '../config/wave0-env-registry.js';
import { validateRequiredConfig } from '../utils/validate-config.js';

/**
 * Boot behavior verification for the startup validation refactor.
 *
 * These tests prove the backend boots correctly under realistic config
 * combinations for the Project Setup-only deployment posture.
 *
 * Each test sets up a realistic env snapshot matching the Azure Function App
 * target and verifies that validateRequiredConfig() does/doesn't throw.
 */

// The 7 core + Project Setup required settings (pinned contract)
const PROJECT_SETUP_BOOT_CONFIG: Record<string, string> = {
  AZURE_TENANT_ID: '91e238a3-4af4-42c0-9cb8-eb37861d82f3',
  AZURE_CLIENT_ID: '77ad3593-5414-4122-a649-74916f8c0d7a',
  AZURE_TABLE_ENDPOINT: 'https://hbintel-table-prod-01.table.cosmos.azure.com:443/',
  APPLICATIONINSIGHTS_CONNECTION_STRING: 'InstrumentationKey=test-key',
  HBC_ADAPTER_MODE: 'proxy',
  SHAREPOINT_TENANT_URL: 'https://hedrickbrotherscom.sharepoint.com',
  SHAREPOINT_PROJECTS_SITE_URL: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
};

describe('Boot behavior — Project Setup-only deployment posture', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    // Set core config
    for (const [key, value] of Object.entries(PROJECT_SETUP_BOOT_CONFIG)) {
      vi.stubEnv(key, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // === A. Core boot with minimal config ===

  it('A1: boots with only 7 core settings (Project Setup deployment)', () => {
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('A2: boots with core + all optional settings present', () => {
    vi.stubEnv('CONTROLLER_UPNS', 'ctrl@hb.com');
    vi.stubEnv('ADMIN_UPNS', 'admin@hb.com');
    vi.stubEnv('OPEX_MANAGER_UPN', 'opex@hb.com');
    vi.stubEnv('AzureSignalRConnectionString', 'Endpoint=https://test');
    vi.stubEnv('EMAIL_FROM_ADDRESS', 'test@hb.com');
    vi.stubEnv('EMAIL_DELIVERY_API_KEY', 'SG.test');
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  // === B. Optional integration missing — does not block boot ===

  it('B1: missing SignalR config does NOT block boot', () => {
    delete process.env.AzureSignalRConnectionString;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B2: missing email config does NOT block boot', () => {
    delete process.env.EMAIL_FROM_ADDRESS;
    delete process.env.EMAIL_DELIVERY_API_KEY;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B3: missing app catalog / SPFx config does NOT block boot', () => {
    delete process.env.SHAREPOINT_APP_CATALOG_URL;
    delete process.env.HB_INTEL_SPFX_APP_ID;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B4: missing Graph gating / background-access config does NOT block boot', () => {
    delete process.env.GRAPH_GROUP_PERMISSION_CONFIRMED;
    delete process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL;
    delete process.env.DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B5: missing NOTIFICATION_API_BASE_URL does NOT block boot', () => {
    delete process.env.NOTIFICATION_API_BASE_URL;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B6: missing OPEX_MANAGER_UPN does NOT block boot', () => {
    delete process.env.OPEX_MANAGER_UPN;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('B7: missing CONTROLLER_UPNS and ADMIN_UPNS does NOT block boot', () => {
    delete process.env.CONTROLLER_UPNS;
    delete process.env.ADMIN_UPNS;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  // === C. Auth mode behavior ===

  it('C1: managed-identity mode does NOT require AZURE_CLIENT_SECRET', () => {
    delete process.env.AZURE_CLIENT_SECRET;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  it('C2: missing AZURE_CLIENT_SECRET does not crash even if previously set', () => {
    vi.stubEnv('AZURE_CLIENT_SECRET', 'old-secret');
    delete process.env.AZURE_CLIENT_SECRET;
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  // === D. Core settings STILL block boot ===

  it('D1: missing AZURE_TENANT_ID blocks boot', () => {
    delete process.env.AZURE_TENANT_ID;
    expect(() => validateRequiredConfig()).toThrow('AZURE_TENANT_ID');
  });

  it('D2: missing AZURE_CLIENT_ID blocks boot', () => {
    delete process.env.AZURE_CLIENT_ID;
    expect(() => validateRequiredConfig()).toThrow('AZURE_CLIENT_ID');
  });

  it('D3: missing AZURE_TABLE_ENDPOINT blocks boot', () => {
    delete process.env.AZURE_TABLE_ENDPOINT;
    expect(() => validateRequiredConfig()).toThrow('AZURE_TABLE_ENDPOINT');
  });

  it('D4: missing APPLICATIONINSIGHTS_CONNECTION_STRING blocks boot', () => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    expect(() => validateRequiredConfig()).toThrow('APPLICATIONINSIGHTS_CONNECTION_STRING');
  });

  it('D5: missing HBC_ADAPTER_MODE blocks boot', () => {
    delete process.env.HBC_ADAPTER_MODE;
    // HBC_ADAPTER_MODE defaults to 'proxy' in adapter-mode-guard when unset,
    // but validateRequiredConfig checks presence from the registry.
    expect(() => validateRequiredConfig()).toThrow('HBC_ADAPTER_MODE');
  });

  it('D6: missing SHAREPOINT_TENANT_URL blocks boot', () => {
    delete process.env.SHAREPOINT_TENANT_URL;
    expect(() => validateRequiredConfig()).toThrow('SHAREPOINT_TENANT_URL');
  });

  it('D7: missing SHAREPOINT_PROJECTS_SITE_URL blocks boot', () => {
    delete process.env.SHAREPOINT_PROJECTS_SITE_URL;
    expect(() => validateRequiredConfig()).toThrow('SHAREPOINT_PROJECTS_SITE_URL');
  });

  // === E. Mock mode bypasses all validation ===

  it('E1: mock mode bypasses startup validation entirely', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => validateRequiredConfig()).not.toThrow();
  });

  // === F. Realistic Azure target config ===

  it('F1: exact live Azure Function App config boots successfully', () => {
    // Matches the actual app settings from hb-intel-function-app
    vi.stubEnv('AZURE_TENANT_ID', '91e238a3-4af4-42c0-9cb8-eb37861d82f3');
    vi.stubEnv('AZURE_CLIENT_ID', '77ad3593-5414-4122-a649-74916f8c0d7a');
    vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://hbintel-table-prod-01.table.cosmos.azure.com:443/');
    vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'InstrumentationKey=1df9279b-3091-4ae7-8291-015a732def00');
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://hedrickbrotherscom.sharepoint.com');
    vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    // Optional — present but not required
    vi.stubEnv('CONTROLLER_UPNS', 'bfetting@hedrickbrothers.com');
    vi.stubEnv('ADMIN_UPNS', 'bfetting@hedrickbrothers.com');
    expect(() => validateRequiredConfig()).not.toThrow();
  });
});

describe('Boot behavior — registry contract stability', () => {
  it('total requiredInProd: true count is exactly 7', () => {
    const requiredCount = WAVE0_REQUIRED_CONFIG.filter((e) => e.requiredInProd).length;
    expect(requiredCount).toBe(7);
  });

  it('total registry entries (required + optional arrays) covers all known settings', () => {
    expect(WAVE0_REQUIRED_CONFIG.length).toBeGreaterThanOrEqual(20);
  });
});
