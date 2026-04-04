/**
 * P9.1-07: NinjaOne adapter lane unit tests.
 *
 * Covers API connectivity, standardization operations, bundle mapping,
 * readiness probes, and failure paths.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WhiteGlovePackageFamily, WhiteGloveDevicePlatform } from '@hbc/models/admin-control-plane';
import { NinjaOneApiService, MockNinjaOneApiService } from '../ninjaone-api-service.js';
import { NinjaOneStandardizationService, MockNinjaOneStandardizationService } from '../ninjaone-standardization-service.js';
import { resolveBundlesForDevice, DEFAULT_BUNDLE_MAPPINGS } from '../ninjaone-bundle-mapping.js';
import { runNinjaOnePreflightChecks } from '../ninjaone-readiness-probes.js';
import { MockConnectionRegistryService } from '../../../connection-registry-service.js';

// ─── API Service Tests ──────────────────────────────────────────────────────

describe('NinjaOneApiService', () => {
  describe('checkNinjaOneReadiness', () => {
    it('reports not ready when connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new NinjaOneApiService(connRegistry);

      const result = await service.checkNinjaOneReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('reports ready when connector is healthy', async () => {
      const connRegistry = new MockConnectionRegistryService();
      await connRegistry.upsertConnection('n1-1', { connectorClass: 'ninjaone-api', displayName: 'NinjaOne', config: {} }, 'admin@test.com');
      await connRegistry.testConnection('n1-1', 'admin@test.com');

      const service = new NinjaOneApiService(connRegistry);
      const result = await service.checkNinjaOneReadiness();
      expect(result.ready).toBe(true);
      expect(result.connectorConfigured).toBe(true);
      expect(result.apiAccessible).toBe(true);
    });
  });

  describe('mock organization', () => {
    it('returns organization in mock', async () => {
      const service = new MockNinjaOneApiService();
      const org = await service.getOrganization();
      expect(org).not.toBeNull();
      expect(org!.organizationName).toBeTruthy();
    });

    it('validates API connection in mock', async () => {
      const service = new MockNinjaOneApiService();
      const result = await service.validateApiConnection();
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeTypeOf('number');
    });
  });
});

// ─── Standardization Service Tests ──────────────────────────────────────────

describe('NinjaOneStandardizationService', () => {
  describe('normalizeStandardizationStatus', () => {
    let service: NinjaOneStandardizationService;

    beforeEach(() => {
      service = new NinjaOneStandardizationService(new MockConnectionRegistryService());
    });

    it('normalizes completed status', () => {
      expect(service.normalizeStandardizationStatus('Completed')).toBe('completed');
      expect(service.normalizeStandardizationStatus('success')).toBe('completed');
      expect(service.normalizeStandardizationStatus('done')).toBe('completed');
    });

    it('normalizes in-progress status', () => {
      expect(service.normalizeStandardizationStatus('In-Progress')).toBe('in-progress');
      expect(service.normalizeStandardizationStatus('running')).toBe('in-progress');
    });

    it('normalizes pending status', () => {
      expect(service.normalizeStandardizationStatus('Pending')).toBe('pending');
      expect(service.normalizeStandardizationStatus('queued')).toBe('pending');
    });

    it('normalizes failed status', () => {
      expect(service.normalizeStandardizationStatus('Failed')).toBe('failed');
      expect(service.normalizeStandardizationStatus('error')).toBe('failed');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeStandardizationStatus('xyz')).toBe('unknown');
    });
  });

  describe('mock happy path', () => {
    let service: MockNinjaOneStandardizationService;

    beforeEach(() => {
      service = new MockNinjaOneStandardizationService();
    });

    it('assigns policy bundle successfully', async () => {
      const result = await service.assignPolicyBundle('dev-1', 'bundle-1');
      expect(result.success).toBe(true);
      expect(result.taskId).toBeTruthy();
    });

    it('triggers software bundle successfully', async () => {
      const result = await service.triggerSoftwareBundle('dev-1', 'sw-bundle-1');
      expect(result.success).toBe(true);
    });

    it('triggers script successfully', async () => {
      const result = await service.triggerScript('dev-1', 'script-1', { param1: 'value1' });
      expect(result.success).toBe(true);
      expect(result.executionId).toBeTruthy();
    });

    it('returns completed standardization status', async () => {
      const status = await service.getStandardizationStatus('dev-1');
      expect(status.overallStatus).toBe('completed');
      expect(status.validationOutcome).toBe('pass');
    });

    it('returns passing validation result', async () => {
      const result = await service.getValidationResult('dev-1', 'val-1');
      expect(result.outcome).toBe('pass');
      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.checks.every(c => c.passed)).toBe(true);
    });
  });
});

// ─── Bundle Mapping Tests ───────────────────────────────────────────────────

describe('NinjaOne Bundle Mapping', () => {
  it('resolves Windows bundles for VDC Personnel desktop', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.VdcPersonnel, WhiteGloveDevicePlatform.WindowsDesktop);
    expect(bundles.length).toBe(4);
    expect(bundles.some(b => b.bundleType === 'policy')).toBe(true);
    expect(bundles.some(b => b.bundleType === 'software')).toBe(true);
    expect(bundles.some(b => b.bundleType === 'script')).toBe(true);
    expect(bundles.some(b => b.bundleType === 'validation')).toBe(true);
  });

  it('resolves iPhone bundles for Operations Management', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.OperationsManagement, WhiteGloveDevicePlatform.IPhone);
    expect(bundles.length).toBe(2);
    expect(bundles.some(b => b.bundleType === 'policy')).toBe(true);
    expect(bundles.some(b => b.bundleType === 'validation')).toBe(true);
  });

  it('resolves iPad bundles for VDC Personnel', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.VdcPersonnel, WhiteGloveDevicePlatform.IPad);
    expect(bundles.length).toBe(2);
    expect(bundles.some(b => b.bundleId.includes('ipados'))).toBe(true);
  });

  it('resolves macOS bundles for Operations Management Alt', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.OperationsManagementAlt, WhiteGloveDevicePlatform.MacOsLaptop);
    expect(bundles.length).toBe(4);
    expect(bundles.some(b => b.bundleId.includes('mac'))).toBe(true);
  });

  it('returns empty for Office Personnel iPhone (no iPhone in package)', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.OfficePersonnel, WhiteGloveDevicePlatform.IPhone);
    expect(bundles).toHaveLength(0);
  });

  it('does not include WindowsLaptop bundles for VDC Personnel (desktop only)', () => {
    const bundles = resolveBundlesForDevice(WhiteGlovePackageFamily.VdcPersonnel, WhiteGloveDevicePlatform.WindowsLaptop);
    expect(bundles).toHaveLength(0);
  });

  it('all default bundles are required', () => {
    for (const mapping of DEFAULT_BUNDLE_MAPPINGS) {
      expect(mapping.bundles.every(b => b.required)).toBe(true);
    }
  });
});

// ─── Readiness Probes Tests ─────────────────────────────────────────────────

describe('runNinjaOnePreflightChecks', () => {
  it('returns check failing when connector not configured', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runNinjaOnePreflightChecks(connRegistry);

    expect(checks).toHaveLength(1);
    expect(checks[0].checkId).toBe('ninjaone-api-connector');
    expect(checks[0].passed).toBe(false);
    expect(checks[0].message).toContain('not configured');
  });

  it('returns check passing when connector configured and tested', async () => {
    const connRegistry = new MockConnectionRegistryService();
    await connRegistry.upsertConnection('n1-1', { connectorClass: 'ninjaone-api', displayName: 'NinjaOne', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('n1-1', 'admin@test.com');

    const checks = await runNinjaOnePreflightChecks(connRegistry);
    expect(checks[0].passed).toBe(true);
  });

  it('check is blocking', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runNinjaOnePreflightChecks(connRegistry);
    expect(checks[0].blocking).toBe(true);
  });

  it('check is platform-agnostic', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runNinjaOnePreflightChecks(connRegistry);
    expect(checks[0].platform).toBeNull();
  });
});
