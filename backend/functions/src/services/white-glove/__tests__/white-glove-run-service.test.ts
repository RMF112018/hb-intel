/**
 * P9.1-12: White-glove run service unit tests.
 *
 * Covers package launch, parent/child creation, status aggregation,
 * cancel, retry, checkpoint transitions, evidence recording, and
 * recovery flows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  WhiteGlovePackageFamily,
  WhiteGloveDevicePlatform,
  WhiteGloveDeviceManufacturer,
  WhiteGloveEnrollmentAuthority,
  WhiteGloveCheckpointType,
  WhiteGloveEvidenceType,
  WhiteGloveDeviceRunStatus,
  WhiteGlovePackageRunStatus,
} from '@hbc/models';
import { WhiteGloveRunService } from '../white-glove-run-service.js';
import { InMemoryAdminRunService } from '../../admin-control-plane/in-memory-run-service.js';
import { MockAdminAuditStore } from '../../admin-control-plane/admin-audit-store.js';
import { MockAdminEvidenceStore } from '../../admin-control-plane/evidence-service.js';
import type { IAdminActorContext } from '@hbc/models';

const MOCK_ACTOR: IAdminActorContext = {
  upn: 'admin@test.com',
  objectId: 'oid-admin',
  displayName: 'Test Admin',
  capturedAt: new Date().toISOString(),
};

const VDC_DEVICES = [
  { slotOrdinal: 1, platform: WhiteGloveDevicePlatform.IPhone, manufacturer: WhiteGloveDeviceManufacturer.Apple, enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE, serialNumber: 'SN-IPHONE-1' },
  { slotOrdinal: 2, platform: WhiteGloveDevicePlatform.IPad, manufacturer: WhiteGloveDeviceManufacturer.Apple, enrollmentAuthority: WhiteGloveEnrollmentAuthority.AppleADE, serialNumber: 'SN-IPAD-1' },
  { slotOrdinal: 3, platform: WhiteGloveDevicePlatform.WindowsDesktop, manufacturer: WhiteGloveDeviceManufacturer.Alienware, enrollmentAuthority: WhiteGloveEnrollmentAuthority.MicrosoftAutopilot, serialNumber: 'SN-DESKTOP-1' },
];

function createService(): WhiteGloveRunService {
  return new WhiteGloveRunService(
    new InMemoryAdminRunService(),
    new MockAdminAuditStore(),
    new MockAdminEvidenceStore(),
  );
}

function createLaunchRequest() {
  return {
    packageFamily: WhiteGlovePackageFamily.VdcPersonnel,
    templateVersion: 1,
    employeeDisplayName: 'John Doe',
    employeeUpn: 'john.doe@test.com',
    employeeObjectId: 'oid-john',
    devices: VDC_DEVICES,
  };
}

// ─── Package Launch ─────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Package Launch', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('creates parent run with correct metadata', async () => {
    const result = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    expect(result.packageRunId).toBeTruthy();
    expect(result.packageFamily).toBe(WhiteGlovePackageFamily.VdcPersonnel);
    expect(result.employeeDisplayName).toBe('John Doe');
    expect(result.packageStatus).toBe(WhiteGlovePackageRunStatus.Pending);
  });

  it('creates child device runs matching device count', async () => {
    const result = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    expect(result.devices).toHaveLength(3);
    expect(result.totalDevices).toBe(3);
  });

  it('child runs have correct platform assignments', async () => {
    const result = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const platforms = result.devices.map((d) => d.platform);
    expect(platforms).toContain(WhiteGloveDevicePlatform.IPhone);
    expect(platforms).toContain(WhiteGloveDevicePlatform.IPad);
    expect(platforms).toContain(WhiteGloveDevicePlatform.WindowsDesktop);
  });

  it('child runs start in Pending status', async () => {
    const result = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    expect(result.devices.every((d) => d.deviceStatus === WhiteGloveDeviceRunStatus.Pending)).toBe(true);
  });
});

// ─── Get and List ───────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Get and List', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('getPackageRun returns null for unknown ID', async () => {
    const result = await service.getPackageRun('nonexistent');
    expect(result).toBeNull();
  });

  it('getPackageRun returns launched run', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const fetched = await service.getPackageRun(launched.packageRunId);
    expect(fetched).not.toBeNull();
    expect(fetched!.packageRunId).toBe(launched.packageRunId);
  });

  it('listPackageRuns returns paginated results', async () => {
    await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const list = await service.listPackageRuns({ page: 1, pageSize: 10 });
    expect(list.items).toHaveLength(2);
    expect(list.total).toBe(2);
  });

  it('listPackageRuns filters by status', async () => {
    await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const list = await service.listPackageRuns({ status: 'Completed' });
    expect(list.items).toHaveLength(0);
  });
});

// ─── Cancel ─────────────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Cancel', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('cancels parent and all children', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const cancelled = await service.cancelPackageRun(launched.packageRunId, MOCK_ACTOR, 'test cancel');
    expect(cancelled.packageStatus).toBe(WhiteGlovePackageRunStatus.Cancelled);
    expect(cancelled.devices.every((d) => d.deviceStatus === WhiteGloveDeviceRunStatus.Cancelled)).toBe(true);
  });

  it('throws for already-cancelled run', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    await service.cancelPackageRun(launched.packageRunId, MOCK_ACTOR);
    await expect(service.cancelPackageRun(launched.packageRunId, MOCK_ACTOR)).rejects.toThrow('terminal');
  });

  it('throws for unknown run', async () => {
    await expect(service.cancelPackageRun('nonexistent', MOCK_ACTOR)).rejects.toThrow('not found');
  });
});

// ─── Status Aggregation ─────────────────────────────────────────────────────

describe('WhiteGloveRunService — Status Aggregation', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('aggregates to Completed when all devices complete', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    for (const device of launched.devices) {
      await service.updateDeviceStatus(device.deviceRunId, WhiteGloveDeviceRunStatus.Completed, MOCK_ACTOR);
    }
    const run = await service.getPackageRun(launched.packageRunId);
    expect(run!.packageStatus).toBe(WhiteGlovePackageRunStatus.Completed);
  });

  it('aggregates to Failed when all devices fail', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    for (const device of launched.devices) {
      await service.updateDeviceStatus(device.deviceRunId, WhiteGloveDeviceRunStatus.Failed, MOCK_ACTOR);
    }
    const run = await service.getPackageRun(launched.packageRunId);
    expect(run!.packageStatus).toBe(WhiteGlovePackageRunStatus.Failed);
  });

  it('aggregates to PartiallyCompleted with mixed results', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    await service.updateDeviceStatus(launched.devices[0].deviceRunId, WhiteGloveDeviceRunStatus.Completed, MOCK_ACTOR);
    await service.updateDeviceStatus(launched.devices[1].deviceRunId, WhiteGloveDeviceRunStatus.Failed, MOCK_ACTOR);
    await service.updateDeviceStatus(launched.devices[2].deviceRunId, WhiteGloveDeviceRunStatus.Completed, MOCK_ACTOR);
    const run = await service.getPackageRun(launched.packageRunId);
    expect(run!.packageStatus).toBe(WhiteGlovePackageRunStatus.PartiallyCompleted);
  });

  it('aggregates to AwaitingCheckpoint when any device is awaiting', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    await service.recordDeviceCheckpoint(launched.devices[0].deviceRunId, WhiteGloveCheckpointType.TechnicianPrep, 'Prepare device', MOCK_ACTOR);
    const run = await service.getPackageRun(launched.packageRunId);
    expect(run!.packageStatus).toBe(WhiteGlovePackageRunStatus.AwaitingCheckpoint);
  });
});

// ─── Checkpoints ────────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Checkpoints', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('creates checkpoint on device run', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const cp = await service.recordDeviceCheckpoint(
      launched.devices[0].deviceRunId,
      WhiteGloveCheckpointType.ConnectorReadiness,
      'Validate connectors',
      MOCK_ACTOR,
    );
    expect(cp.instanceId).toBeTruthy();
    expect(cp.checkpointType).toBe(WhiteGloveCheckpointType.ConnectorReadiness);
    expect(cp.status).toBe('Pending');
  });

  it('approves checkpoint', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const cp = await service.recordDeviceCheckpoint(launched.devices[0].deviceRunId, WhiteGloveCheckpointType.PackageConfirmation, 'Confirm', MOCK_ACTOR);
    const resolved = await service.resolveDeviceCheckpoint(launched.devices[0].deviceRunId, cp.instanceId, 'approve', MOCK_ACTOR, 'Looks good');
    expect(resolved.status).toBe('Approved');
    expect(resolved.decidedAt).toBeTruthy();
  });

  it('rejects checkpoint and fails device', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const cp = await service.recordDeviceCheckpoint(launched.devices[0].deviceRunId, WhiteGloveCheckpointType.RecoveryRequired, 'Recovery needed', MOCK_ACTOR);
    const resolved = await service.resolveDeviceCheckpoint(launched.devices[0].deviceRunId, cp.instanceId, 'reject', MOCK_ACTOR, 'Cannot recover');
    expect(resolved.status).toBe('Rejected');
    const device = await service.getDeviceRun(launched.devices[0].deviceRunId);
    expect(device!.deviceStatus).toBe(WhiteGloveDeviceRunStatus.Failed);
  });
});

// ─── Evidence ───────────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Evidence', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('records evidence on device run', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    const evidence = await service.recordDeviceEvidence(
      launched.devices[0].deviceRunId,
      WhiteGloveEvidenceType.Enrollment,
      'Device enrolled',
      'microsoft',
      'Autopilot enrollment successful',
    );
    expect(evidence.evidenceId).toBeTruthy();
    expect(evidence.evidenceType).toBe(WhiteGloveEvidenceType.Enrollment);
    expect(evidence.adapterSource).toBe('microsoft');
  });

  it('evidence appears in device run detail', async () => {
    const launched = await service.launchPackageRun(createLaunchRequest(), MOCK_ACTOR);
    await service.recordDeviceEvidence(launched.devices[0].deviceRunId, WhiteGloveEvidenceType.Assignment, 'Profile assigned', 'microsoft', 'Autopilot profile assigned');
    const device = await service.getDeviceRun(launched.devices[0].deviceRunId);
    expect(device!.evidence).toHaveLength(1);
    expect(device!.evidence[0].evidenceType).toBe(WhiteGloveEvidenceType.Assignment);
  });
});

// ─── Device Retry ───────────────────────────────────────────────────────────

describe('WhiteGloveRunService — Device Retry', () => {
  let service: WhiteGloveRunService;

  beforeEach(() => {
    service = createService();
  });

  it('throws for unknown device', async () => {
    await expect(service.retryDeviceRun('nonexistent', MOCK_ACTOR)).rejects.toThrow('not found');
  });
});
