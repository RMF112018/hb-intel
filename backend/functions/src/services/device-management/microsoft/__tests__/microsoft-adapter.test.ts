/**
 * P9.1-05: Microsoft adapter lane unit tests.
 *
 * Covers happy path, blocked, misconfigured, and partial-failure paths
 * for identity resolution, Intune enrollment, Autopilot registration,
 * and readiness probes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MicrosoftIntuneService } from '../microsoft-intune-service.js';
import { MicrosoftAutopilotService } from '../microsoft-autopilot-service.js';
import { MockMicrosoftIdentityService } from '../microsoft-identity-service.js';
import { MockMicrosoftIntuneService } from '../microsoft-intune-service.js';
import { MockMicrosoftAutopilotService } from '../microsoft-autopilot-service.js';
import { runMicrosoftPreflightChecks } from '../microsoft-readiness-probes.js';
import { MockConnectionRegistryService } from '../../../connection-registry-service.js';

// ─── Identity Service Tests ─────────────────────────────────────────────────

describe('MockMicrosoftIdentityService', () => {
  let service: MockMicrosoftIdentityService;

  beforeEach(() => {
    service = new MockMicrosoftIdentityService();
  });

  it('returns null for unknown employee', async () => {
    const result = await service.resolveEmployeeIdentity('unknown@test.com');
    expect(result).toBeNull();
  });

  it('creates a device group when none exists', async () => {
    const result = await service.resolveDeviceGroup('WG-Deploy-VDC');
    expect(result.created).toBe(true);
    expect(result.groupName).toBe('WG-Deploy-VDC');
    expect(result.groupId).toBeTruthy();
  });

  it('returns existing group on second call', async () => {
    const first = await service.resolveDeviceGroup('WG-Deploy-VDC');
    const second = await service.resolveDeviceGroup('WG-Deploy-VDC');
    expect(second.created).toBe(false);
    expect(second.groupId).toBe(first.groupId);
  });

  it('validates identity readiness as ready in mock', async () => {
    const result = await service.validateIdentityReadiness('user@test.com');
    expect(result.ready).toBe(true);
    expect(result.employeeFound).toBe(true);
    expect(result.accountEnabled).toBe(true);
  });
});

// ─── Intune Service Tests ───────────────────────────────────────────────────

describe('MicrosoftIntuneService', () => {
  describe('normalizeIntuneStatus', () => {
    let service: MicrosoftIntuneService;

    beforeEach(() => {
      service = new MicrosoftIntuneService(new MockConnectionRegistryService());
    });

    it('normalizes enrolled status', () => {
      expect(service.normalizeIntuneStatus('Enrolled')).toBe('enrolled');
      expect(service.normalizeIntuneStatus('managed')).toBe('enrolled');
    });

    it('normalizes pending status', () => {
      expect(service.normalizeIntuneStatus('Pending')).toBe('pending');
      expect(service.normalizeIntuneStatus('enrolling')).toBe('pending');
    });

    it('normalizes error status', () => {
      expect(service.normalizeIntuneStatus('Error')).toBe('error');
      expect(service.normalizeIntuneStatus('failed')).toBe('error');
    });

    it('normalizes not-enrolled status', () => {
      expect(service.normalizeIntuneStatus('NotEnrolled')).toBe('not-enrolled');
      expect(service.normalizeIntuneStatus('not enrolled')).toBe('not-enrolled');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeIntuneStatus('SomethingElse')).toBe('unknown');
    });
  });

  describe('checkIntuneReadiness', () => {
    it('reports not ready when connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new MicrosoftIntuneService(connRegistry);

      const result = await service.checkIntuneReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('reports ready when connector is healthy', async () => {
      const connRegistry = new MockConnectionRegistryService();
      await connRegistry.upsertConnection('intune-1', {
        connectorClass: 'microsoft-intune',
        displayName: 'Intune',
        config: {},
      }, 'admin@test.com');
      await connRegistry.testConnection('intune-1', 'admin@test.com');

      const service = new MicrosoftIntuneService(connRegistry);
      const result = await service.checkIntuneReadiness();
      expect(result.ready).toBe(true);
      expect(result.connectorConfigured).toBe(true);
      expect(result.connectorHealthy).toBe(true);
    });
  });

  describe('mock happy path', () => {
    let service: MockMicrosoftIntuneService;

    beforeEach(() => {
      service = new MockMicrosoftIntuneService();
    });

    it('returns enrolled status for mock device', async () => {
      const status = await service.getDeviceEnrollmentStatus('SN-12345');
      expect(status.enrollmentState).toBe('enrolled');
      expect(status.complianceState).toBe('compliant');
      expect(status.deviceId).toBeTruthy();
    });

    it('assigns compliance policy successfully', async () => {
      const result = await service.assignCompliancePolicy('dev-1', 'policy-1');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('assigns configuration profile successfully', async () => {
      const result = await service.assignConfigurationProfile('dev-1', 'profile-1');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});

// ─── Autopilot Service Tests ────────────────────────────────────────────────

describe('MicrosoftAutopilotService', () => {
  describe('normalizeAutopilotStatus', () => {
    let service: MicrosoftAutopilotService;

    beforeEach(() => {
      service = new MicrosoftAutopilotService(new MockConnectionRegistryService());
    });

    it('normalizes registered status', () => {
      expect(service.normalizeAutopilotStatus('Registered')).toBe('registered');
      expect(service.normalizeAutopilotStatus('assigned')).toBe('registered');
    });

    it('normalizes pending status', () => {
      expect(service.normalizeAutopilotStatus('Pending')).toBe('pending');
      expect(service.normalizeAutopilotStatus('registering')).toBe('pending');
    });

    it('normalizes error status', () => {
      expect(service.normalizeAutopilotStatus('Error')).toBe('error');
      expect(service.normalizeAutopilotStatus('failed')).toBe('error');
    });

    it('returns unknown for unrecognized status', () => {
      expect(service.normalizeAutopilotStatus('xyz')).toBe('unknown');
    });
  });

  describe('checkAutopilotReadiness', () => {
    it('reports not ready when connector not configured', async () => {
      const connRegistry = new MockConnectionRegistryService();
      const service = new MicrosoftAutopilotService(connRegistry);

      const result = await service.checkAutopilotReadiness();
      expect(result.ready).toBe(false);
      expect(result.connectorConfigured).toBe(false);
    });
  });

  describe('technician pre-provisioning', () => {
    it('builds checkpoint context with correct instructions', () => {
      const service = new MicrosoftAutopilotService(new MockConnectionRegistryService());
      const ctx = service.buildTechnicianPreProvisioningContext('run-1', 'SN-12345');

      expect(ctx.deviceRunId).toBe('run-1');
      expect(ctx.serialNumber).toBe('SN-12345');
      expect(ctx.instructions).toContain('Power on the device');
      expect(ctx.instructions).toContain('SN-12345');
      expect(ctx.expectedOutcome).toContain('enrolled in Intune');
    });
  });

  describe('mock happy path', () => {
    let service: MockMicrosoftAutopilotService;

    beforeEach(() => {
      service = new MockMicrosoftAutopilotService();
    });

    it('returns registered device in mock', async () => {
      const device = await service.getAutopilotDevice('SN-12345');
      expect(device.registrationState).toBe('registered');
      expect(device.profileAssignmentState).toBe('assigned');
    });

    it('registers device successfully in mock', async () => {
      const result = await service.registerAutopilotDevice('SN-12345', 'hash-abc');
      expect(result.success).toBe(true);
      expect(result.autopilotDeviceId).toBeTruthy();
    });

    it('assigns profile successfully in mock', async () => {
      const result = await service.assignAutopilotProfile('dev-1', 'profile-1');
      expect(result.success).toBe(true);
    });
  });
});

// ─── Readiness Probes Tests ─────────────────────────────────────────────────

describe('runMicrosoftPreflightChecks', () => {
  it('returns all checks failing when no connectors configured', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runMicrosoftPreflightChecks(connRegistry);

    expect(checks.length).toBe(4);
    const intuneCheck = checks.find(c => c.checkId === 'ms-intune-connector');
    expect(intuneCheck?.passed).toBe(false);
    expect(intuneCheck?.message).toContain('not configured');

    const autopilotCheck = checks.find(c => c.checkId === 'ms-autopilot-connector');
    expect(autopilotCheck?.passed).toBe(false);

    const graphCheck = checks.find(c => c.checkId === 'ms-graph-identity-connector');
    expect(graphCheck?.passed).toBe(false);
  });

  it('returns connector checks passing when configured and tested', async () => {
    const connRegistry = new MockConnectionRegistryService();

    // Configure and test all connectors
    await connRegistry.upsertConnection('intune-1', { connectorClass: 'microsoft-intune', displayName: 'Intune', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('intune-1', 'admin@test.com');

    await connRegistry.upsertConnection('autopilot-1', { connectorClass: 'microsoft-autopilot', displayName: 'Autopilot', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('autopilot-1', 'admin@test.com');

    await connRegistry.upsertConnection('graph-1', { connectorClass: 'graph-identity', displayName: 'Graph', config: {} }, 'admin@test.com');
    await connRegistry.testConnection('graph-1', 'admin@test.com');

    const checks = await runMicrosoftPreflightChecks(connRegistry);

    const intuneCheck = checks.find(c => c.checkId === 'ms-intune-connector');
    expect(intuneCheck?.passed).toBe(true);

    const autopilotCheck = checks.find(c => c.checkId === 'ms-autopilot-connector');
    expect(autopilotCheck?.passed).toBe(true);

    const graphCheck = checks.find(c => c.checkId === 'ms-graph-identity-connector');
    expect(graphCheck?.passed).toBe(true);
  });

  it('all connector checks are blocking', async () => {
    const connRegistry = new MockConnectionRegistryService();
    const checks = await runMicrosoftPreflightChecks(connRegistry);
    expect(checks.every(c => c.blocking)).toBe(true);
  });
});
