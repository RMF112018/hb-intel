/**
 * P6-07: Post-install verification service unit tests.
 *
 * Tests validate check count, pass/fail behavior, result structure,
 * audit recording, and evidence capture.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeVerificationChecks,
  runPostInstallVerification,
} from '../install-verification-service.js';
import {
  AdminAuditEventType,
  InstallVerificationCheckId,
} from '@hbc/models/admin-control-plane';
import type { IAdminActorContext } from '@hbc/models/admin-control-plane';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-123',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

describe('P6-07 executeVerificationChecks', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
  });

  it('produces exactly 6 checks matching InstallVerificationCheckId', () => {
    const checks = executeVerificationChecks();
    expect(checks).toHaveLength(6);
    const ids = checks.map((c) => c.checkId);
    for (const id of Object.values(InstallVerificationCheckId)) {
      expect(ids).toContain(id);
    }
  });

  describe('with no environment config', () => {
    beforeEach(() => {
      vi.stubEnv('AZURE_TABLE_ENDPOINT', '');
      vi.stubEnv('API_AUDIENCE', '');
      vi.stubEnv('AZURE_TENANT_ID', '');
      vi.stubEnv('AZURE_CLIENT_ID', '');
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', '');
      vi.stubEnv('HBC_ADAPTER_MODE', '');
      vi.stubEnv('SHAREPOINT_TENANT_URL', '');
      vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', '');
      vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', '');
      vi.stubEnv('HB_INTEL_SPFX_APP_ID', '');
    });

    it('all checks fail when config is missing', () => {
      const checks = executeVerificationChecks();
      const allFailed = checks.every((c) => !c.passed);
      expect(allFailed).toBe(true);
    });

    it('each failed check includes a descriptive message', () => {
      const checks = executeVerificationChecks();
      for (const check of checks) {
        expect(check.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('with full production config', () => {
    beforeEach(() => {
      vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://storage.table.core.windows.net');
      vi.stubEnv('API_AUDIENCE', 'api://test');
      vi.stubEnv('AZURE_TENANT_ID', 'tenant-123');
      vi.stubEnv('AZURE_CLIENT_ID', 'client-123');
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
      vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
      vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
      vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', 'https://contoso.sharepoint.com/sites/projects');
      vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://contoso.sharepoint.com/sites/appcatalog');
      vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-guid-123');
    });

    it('all checks pass when config is complete', () => {
      const checks = executeVerificationChecks();
      const allPassed = checks.every((c) => c.passed);
      expect(allPassed).toBe(true);
    });
  });

  describe('partial config', () => {
    beforeEach(() => {
      vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://storage.table.core.windows.net');
      vi.stubEnv('API_AUDIENCE', 'api://test');
      vi.stubEnv('AZURE_TENANT_ID', 'tenant-123');
      vi.stubEnv('AZURE_CLIENT_ID', 'client-123');
      vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
      vi.stubEnv('HBC_ADAPTER_MODE', 'mock');
      vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
      vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', 'https://contoso.sharepoint.com/sites/projects');
      vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', '');
      vi.stubEnv('HB_INTEL_SPFX_APP_ID', '');
    });

    it('SPFx package check fails when app catalog and app ID are missing', () => {
      const checks = executeVerificationChecks();
      const spfxCheck = checks.find((c) => c.checkId === InstallVerificationCheckId.SpfxPackageDeployed);
      expect(spfxCheck!.passed).toBe(false);
    });

    it('API permissions check fails when adapter mode is mock', () => {
      const checks = executeVerificationChecks();
      const apiCheck = checks.find((c) => c.checkId === InstallVerificationCheckId.ApiPermissionsGranted);
      expect(apiCheck!.passed).toBe(false);
    });
  });
});

describe('P6-07 runPostInstallVerification', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.stubEnv('AZURE_TABLE_ENDPOINT', 'https://storage.table.core.windows.net');
    vi.stubEnv('API_AUDIENCE', 'api://test');
    vi.stubEnv('AZURE_TENANT_ID', 'tenant-123');
    vi.stubEnv('AZURE_CLIENT_ID', 'client-123');
    vi.stubEnv('GRAPH_GROUP_PERMISSION_CONFIRMED', 'true');
    vi.stubEnv('HBC_ADAPTER_MODE', 'proxy');
    vi.stubEnv('SHAREPOINT_TENANT_URL', 'https://contoso.sharepoint.com');
    vi.stubEnv('SHAREPOINT_PROJECTS_SITE_URL', 'https://contoso.sharepoint.com/sites/projects');
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', 'https://contoso.sharepoint.com/sites/appcatalog');
    vi.stubEnv('HB_INTEL_SPFX_APP_ID', 'spfx-guid-123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
  });

  function makeMockServices() {
    return {
      auditService: {
        recordEvent: vi.fn().mockResolvedValue(undefined),
        listByRunId: vi.fn().mockResolvedValue([]),
        listByEventType: vi.fn().mockResolvedValue([]),
      },
      evidenceService: {
        recordEvidence: vi.fn().mockResolvedValue(undefined),
        listByRunId: vi.fn().mockResolvedValue([]),
        getEvidence: vi.fn().mockResolvedValue(null),
      },
    };
  }

  it('returns a structured summary with all checks', async () => {
    const { auditService, evidenceService } = makeMockServices();
    const summary = await runPostInstallVerification('run-001', TEST_ACTOR, auditService, evidenceService);
    expect(summary.runId).toBe('run-001');
    expect(summary.checks).toHaveLength(6);
    expect(summary.validatedBy).toBe(TEST_ACTOR);
    expect(summary.validatedAt).toBeDefined();
  });

  it('sets outcomeAccepted to true when all checks pass', async () => {
    const { auditService, evidenceService } = makeMockServices();
    const summary = await runPostInstallVerification('run-001', TEST_ACTOR, auditService, evidenceService);
    expect(summary.outcomeAccepted).toBe(true);
  });

  it('sets outcomeAccepted to false when any check fails', async () => {
    vi.stubEnv('SHAREPOINT_APP_CATALOG_URL', '');
    const { auditService, evidenceService } = makeMockServices();
    const summary = await runPostInstallVerification('run-001', TEST_ACTOR, auditService, evidenceService);
    expect(summary.outcomeAccepted).toBe(false);
  });

  it('records an audit event', async () => {
    const { auditService, evidenceService } = makeMockServices();
    await runPostInstallVerification('run-001', TEST_ACTOR, auditService, evidenceService);
    expect(auditService.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: AdminAuditEventType.RunCompleted,
        runId: 'run-001',
      }),
    );
  });

  it('captures verification report as evidence', async () => {
    const { auditService, evidenceService } = makeMockServices();
    await runPostInstallVerification('run-001', TEST_ACTOR, auditService, evidenceService);
    expect(evidenceService.recordEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-001',
        label: expect.stringContaining('Post-install verification'),
      }),
      expect.any(String),
      expect.objectContaining({
        verificationSummary: expect.objectContaining({ runId: 'run-001' }),
      }),
    );
  });
});
