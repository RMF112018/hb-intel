/**
 * P6-04: AdminPreflightService unit tests.
 *
 * Tests validate that the preflight engine produces correct structured
 * findings across all 6 check categories based on environment config state.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdminPreflightService } from '../preflight-service.js';
import { InstallPreflightCheckId, INSTALL_ACTION_KEYS } from '@hbc/models/admin-control-plane';
import type { IAdminPreflightRequest, IAdminPreflightCheck } from '@hbc/models/admin-control-plane';

function makeRequest(overrides?: Partial<IAdminPreflightRequest>): IAdminPreflightRequest {
  return {
    actionKey: INSTALL_ACTION_KEYS.FULL_INSTALL,
    commandInput: {},
    ...overrides,
  };
}

describe('P6-04 AdminPreflightService', () => {
  const originalEnv = { ...process.env };
  let service: AdminPreflightService;

  beforeEach(() => {
    service = new AdminPreflightService();
    // Clear all env vars to start with a clean slate
    vi.stubEnv('AZURE_TENANT_ID', '');
    vi.stubEnv('AZURE_CLIENT_ID', '');
    vi.stubEnv('API_AUDIENCE', '');
    vi.stubEnv('AZURE_TABLE_ENDPOINT', '');
    vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', '');
    vi.stubEnv('HBC_ADAPTER_MODE', '');
    vi.stubEnv('SHAREPOINT_TENANT_URL', '');
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', '');
    vi.stubEnv('HB_INTEL_SPFX_APP_ID', '');
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
  });

  function findCheck(checks: readonly IAdminPreflightCheck[], checkId: string): IAdminPreflightCheck | undefined {
    return checks.find((c) => c.checkId === checkId);
  }

  describe('with no environment config', () => {
    it('returns not ready when all config is missing', async () => {
      const result = await service.validate(makeRequest());
      expect(result.ready).toBe(false);
    });

    it('reports blocking failures for core config', async () => {
      const result = await service.validate(makeRequest());
      const envCheck = findCheck(result.checks, InstallPreflightCheckId.EnvironmentConfigComplete);
      expect(envCheck).toBeDefined();
      expect(envCheck!.passed).toBe(false);
      expect(envCheck!.blocking).toBe(true);
      expect(envCheck!.category).toBe('backend-config');
      expect(envCheck!.severity).toBe('critical');
    });

    it('reports blocking failure for table storage', async () => {
      const result = await service.validate(makeRequest());
      const tsCheck = findCheck(result.checks, InstallPreflightCheckId.TableStorageAccessible);
      expect(tsCheck).toBeDefined();
      expect(tsCheck!.passed).toBe(false);
      expect(tsCheck!.blocking).toBe(true);
    });
  });

  describe('with full production config', () => {
    beforeEach(() => {
      vi.stubEnv('AZURE_TENANT_ID', 'tenant-123');
      vi.stubEnv('AZURE_CLIENT_ID', 'client-123');
      vi.stubEnv('API_AUDIENCE', 'api://test');
      vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://storage.table.core.windows.net');
      vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'InstrumentationKey=test');
      vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
      vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
      vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://contoso.sharepoint.com/sites/appcatalog');
      vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-guid-123');
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
    });

    it('returns ready when all config is present', async () => {
      const result = await service.validate(makeRequest());
      expect(result.ready).toBe(true);
    });

    it('all checks pass', async () => {
      const result = await service.validate(makeRequest());
      const failedBlocking = result.checks.filter((c) => !c.passed && c.blocking);
      expect(failedBlocking).toHaveLength(0);
    });

    it('produces checks across all categories', async () => {
      const result = await service.validate(makeRequest());
      const categories = new Set(result.checks.map((c) => c.category));
      expect(categories).toContain('backend-config');
      expect(categories).toContain('auth-identity');
      expect(categories).toContain('sharepoint');
      expect(categories).toContain('graph-entra');
      expect(categories).toContain('persistence');
      expect(categories).toContain('install-compatibility');
    });
  });

  describe('severity and blocking behavior', () => {
    beforeEach(() => {
      // Set most config but leave specific items to test individual check behavior
      vi.stubEnv('AZURE_TENANT_ID', 'tenant-123');
      vi.stubEnv('AZURE_CLIENT_ID', 'client-123');
      vi.stubEnv('API_AUDIENCE', 'api://test');
      vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://storage.table.core.windows.net');
      vi.stubEnv('APPLICATIONINSIGHTS_CONNECTION_STRING', 'InstrumentationKey=test');
      vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
      vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
      vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://contoso.sharepoint.com/sites/appcatalog');
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
    });

    it('SPFx app ID missing is a warning, not a blocker', async () => {
      vi.stubEnv('HB_INTEL_SPFX_APP_ID', '');
      const result = await service.validate(makeRequest());
      const spfxCheck = findCheck(result.checks, InstallPreflightCheckId.SpfxAppPackageAvailable);
      expect(spfxCheck!.passed).toBe(false);
      expect(spfxCheck!.blocking).toBe(false);
      expect(spfxCheck!.severity).toBe('warning');
      // Still ready because non-blocking
      expect(result.ready).toBe(true);
    });

    it('Graph permission not confirmed is a critical blocker', async () => {
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'false');
      const result = await service.validate(makeRequest());
      const graphCheck = findCheck(result.checks, InstallPreflightCheckId.GraphApiPermissions);
      expect(graphCheck!.passed).toBe(false);
      expect(graphCheck!.blocking).toBe(true);
      expect(graphCheck!.severity).toBe('critical');
      expect(graphCheck!.resolvableByCheckpoint).toBe(true);
      expect(result.ready).toBe(false);
    });

    it('mock adapter mode is a warning with info severity', async () => {
      vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
      const result = await service.validate(makeRequest());
      const modeCheck = findCheck(result.checks, InstallPreflightCheckId.ResourceGroupReachable);
      expect(modeCheck!.passed).toBe(false);
      expect(modeCheck!.blocking).toBe(false);
      expect(modeCheck!.severity).toBe('warning');
    });
  });

  describe('recommended actions', () => {
    it('failed checks include recommended operator actions', async () => {
      const result = await service.validate(makeRequest());
      const failedChecks = result.checks.filter((c) => !c.passed);
      for (const fc of failedChecks) {
        expect(fc.recommendedAction).toBeDefined();
        expect(fc.recommendedAction!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('check count stability', () => {
    it('produces exactly 9 checks matching InstallPreflightCheckId', async () => {
      const result = await service.validate(makeRequest());
      expect(result.checks.length).toBe(9);

      const expectedIds = Object.values(InstallPreflightCheckId);
      const actualIds = result.checks.map((c) => c.checkId);
      for (const id of expectedIds) {
        expect(actualIds).toContain(id);
      }
    });
  });
});
