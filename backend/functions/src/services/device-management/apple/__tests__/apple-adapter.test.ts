/**
 * P9.1-06: Apple adapter lane unit tests.
 *
 * Covers ABM assignment, ADE enrollment, MDM supervised state,
 * platform-specific posture validation, readiness probes,
 * and failure paths.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AppleAbmService, MockAppleAbmService } from '../apple-abm-service.js';
import { AppleAdeService, MockAppleAdeService } from '../apple-ade-service.js';
import { AppleMdmService, MockAppleMdmService } from '../apple-mdm-service.js';
import { runApplePreflightChecks } from '../apple-readiness-probes.js';
import { MockConnectionRegistryService } from '../../../connection-registry-service.js';

// ─── ABM Service Tests ──────────────────────────────────────────────────────

describe('AppleAbmService', () => {
  describe('normalizeAbmStatus', () => {
    let service: AppleAbmService;

    beforeEach(() => {
      service = new AppleAbmService(new MockConnectionRegistryService());
    });

    it('normalizes assigned status', () => {
      expect(service.normalizeAbmStatus('Assigned')).toBe('assigned');
      expect(service.normalizeAbmStatus('active')).toBe('assigned');
    });

    it('normalizes pending status', () => {
      expect(service.normalizeAbmStatus('Pending')).toBe('pending');
      expect(service.normalizeAbmStatus('assigning')).toBe('pending');
    });

    it('normalizes removed status', () => {
      expect(service.normalizeAbmStatus('Removed')).toBe('removed');
      expect(service.normalizeAbmStatus('disowned')).toBe('removed');
    });

    it('normalizes not-assigned status', () => {
      expect(service.normalizeAbmStatus('Not Assigned')).toBe('not-assigned');
      expect(service.normalizeAbmStatus('not-assigned')).toBe('not-assigned');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeAbmStatus('xyz')).toBe('unknown');
    });
  });

  describe('checkAbmReadiness', () => {
    it('reports not ready when connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new AppleAbmService(connRegistry);

      const result = await service.checkAbmReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('reports ready when connector is healthy', async () => {
      const connRegistry = new MockConnectionRegistryService();
      await connRegistry.upsertConnection('abm-1', { connectorClass: 'apple-abm', displayName: 'ABM', config: {} }, 'admin@test.com');
      await connRegistry.testConnection('abm-1', 'admin@test.com');

      const service = new AppleAbmService(connRegistry);
      const result = await service.checkAbmReadiness();
      expect(result.ready).toBe(true);
      expect(result.connectorConfigured).toBe(true);
      expect(result.tokenValid).toBe(true);
    });
  });

  describe('mock happy path', () => {
    let service: MockAppleAbmService;

    beforeEach(() => {
      service = new MockAppleAbmService();
    });

    it('returns assigned device in mock', async () => {
      const assignment = await service.getDeviceAssignment('SN-APPLE-1');
      expect(assignment.assignmentState).toBe('assigned');
      expect(assignment.assignedMdmServer).toBeTruthy();
    });

    it('validates ABM token in mock', async () => {
      const result = await service.validateAbmToken();
      expect(result.valid).toBe(true);
      expect(result.expiresAt).toBeTruthy();
    });

    it('returns assignment profile in mock', async () => {
      const profile = await service.getAssignmentProfile('SN-APPLE-1');
      expect(profile).toBeTruthy();
    });
  });
});

// ─── ADE Service Tests ──────────────────────────────────────────────────────

describe('AppleAdeService', () => {
  describe('normalizeAdeStatus', () => {
    let service: AppleAdeService;

    beforeEach(() => {
      service = new AppleAdeService(new MockConnectionRegistryService());
    });

    it('normalizes enrolled status', () => {
      expect(service.normalizeAdeStatus('Enrolled')).toBe('enrolled');
      expect(service.normalizeAdeStatus('managed')).toBe('enrolled');
    });

    it('normalizes not-enrolled status', () => {
      expect(service.normalizeAdeStatus('Not Enrolled')).toBe('not-enrolled');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeAdeStatus('xyz')).toBe('unknown');
    });
  });

  describe('checkAdeReadiness', () => {
    it('reports not ready when connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new AppleAdeService(connRegistry);

      const result = await service.checkAdeReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
    });
  });

  describe('platform-specific posture validation', () => {
    describe('stub implementation (not-enrolled)', () => {
      let service: AppleAdeService;

      beforeEach(() => {
        service = new AppleAdeService(new MockConnectionRegistryService());
      });

      it('reports issues for iPhone when not enrolled', async () => {
        const result = await service.validateAdeAssignmentPosture('SN-1', 'iphone');
        expect(result.valid).toBe(false);
        expect(result.platform).toBe('iphone');
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.issues.some(i => i.includes('iPhone'))).toBe(true);
      });

      it('reports issues for iPad when not enrolled', async () => {
        const result = await service.validateAdeAssignmentPosture('SN-2', 'ipad');
        expect(result.valid).toBe(false);
        expect(result.platform).toBe('ipad');
        expect(result.issues.some(i => i.includes('iPad'))).toBe(true);
      });

      it('reports issues for macOS when not enrolled', async () => {
        const result = await service.validateAdeAssignmentPosture('SN-3', 'macos');
        expect(result.valid).toBe(false);
        expect(result.platform).toBe('macos');
        expect(result.issues.some(i => i.includes('macOS'))).toBe(true);
      });
    });

    describe('mock implementation (enrolled)', () => {
      it('validates posture as valid in mock', async () => {
        const service = new MockAppleAdeService();
        const result = await service.validateAdeAssignmentPosture('SN-1', 'iphone');
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
      });
    });
  });
});

// ─── MDM Service Tests ──────────────────────────────────────────────────────

describe('AppleMdmService', () => {
  describe('normalizeAppleMdmStatus', () => {
    let service: AppleMdmService;

    beforeEach(() => {
      service = new AppleMdmService(new MockConnectionRegistryService());
    });

    it('normalizes enrolled status', () => {
      expect(service.normalizeAppleMdmStatus('Enrolled')).toBe('enrolled');
    });

    it('normalizes not-enrolled status', () => {
      expect(service.normalizeAppleMdmStatus('not enrolled')).toBe('not-enrolled');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeAppleMdmStatus('xyz')).toBe('unknown');
    });
  });

  describe('checkApnReadiness', () => {
    it('reports not ready when APNs connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new AppleMdmService(connRegistry);

      const result = await service.checkApnReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('reports ready when APNs connector is healthy', async () => {
      const connRegistry = new MockConnectionRegistryService();
      await connRegistry.upsertConnection('apns-1', { connectorClass: 'apple-apns', displayName: 'APNs', config: {} }, 'admin@test.com');
      await connRegistry.testConnection('apns-1', 'admin@test.com');

      const service = new AppleMdmService(connRegistry);
      const result = await service.checkApnReadiness();
      expect(result.ready).toBe(true);
    });
  });

  describe('mock supervised state', () => {
    let service: MockAppleMdmService;

    beforeEach(() => {
      service = new MockAppleMdmService();
    });

    it('returns supervised for iPhone/iPad in mock', async () => {
      const iphoneStatus = await service.getDeviceEnrollmentStatus('SN-1', 'iphone');
      expect(iphoneStatus.supervisedState).toBe('supervised');

      const ipadStatus = await service.getDeviceEnrollmentStatus('SN-2', 'ipad');
      expect(ipadStatus.supervisedState).toBe('supervised');
    });

    it('returns unsupervised for macOS in mock', async () => {
      const macStatus = await service.getDeviceEnrollmentStatus('SN-3', 'macos');
      expect(macStatus.supervisedState).toBe('unsupervised');
    });

    it('returns enrolled for all platforms in mock', async () => {
      const status = await service.getDeviceEnrollmentStatus('SN-1', 'iphone');
      expect(status.enrollmentState).toBe('enrolled');
      expect(status.complianceState).toBe('compliant');
    });
  });
});

// ─── Readiness Probes Tests ─────────────────────────────────────────────────

describe('runApplePreflightChecks', () => {
  it('returns all checks failing when no connectors configured', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runApplePreflightChecks(connRegistry);

    expect(checks).toHaveLength(3);

    const abmCheck = checks.find(c => c.checkId === 'apple-abm-connector');
    expect(abmCheck?.passed).toBe(false);
    expect(abmCheck?.message).toContain('not configured');

    const adeCheck = checks.find(c => c.checkId === 'apple-ade-connector');
    expect(adeCheck?.passed).toBe(false);

    const apnsCheck = checks.find(c => c.checkId === 'apple-apns-connector');
    expect(apnsCheck?.passed).toBe(false);
  });

  it('returns all checks passing when connectors configured and tested', async () => {
    const connRegistry = new MockConnectionRegistryService();

    await connRegistry.upsertConnection('abm-1', { connectorClass: 'apple-abm', displayName: 'ABM', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('abm-1', 'admin@test.com');

    await connRegistry.upsertConnection('ade-1', { connectorClass: 'apple-ade', displayName: 'ADE', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('ade-1', 'admin@test.com');

    await connRegistry.upsertConnection('apns-1', { connectorClass: 'apple-apns', displayName: 'APNs', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('apns-1', 'admin@test.com');

    const checks = await runApplePreflightChecks(connRegistry);

    expect(checks.find(c => c.checkId === 'apple-abm-connector')?.passed).toBe(true);
    expect(checks.find(c => c.checkId === 'apple-ade-connector')?.passed).toBe(true);
    expect(checks.find(c => c.checkId === 'apple-apns-connector')?.passed).toBe(true);
  });

  it('all checks are blocking', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runApplePreflightChecks(connRegistry);
    expect(checks.every(c => c.blocking)).toBe(true);
  });
});
