/**
 * Phase 12 — Observability Store Tests
 *
 * Tests covering:
 * - Serialization round-trips for alert, probe snapshot, and error records
 * - Null field handling conventions
 * - Partition/row key design
 * - Mock store behavior (ingest, query, acknowledge, resolve, deduplication)
 */

import { describe, expect, it } from 'vitest';
import type {
  IAdminActorContext,
  IObservabilityAlertRecord,
  IObservabilityAlertIngestionPayload,
  IObservabilityProbeResultRecord,
  IObservabilityProbeSnapshotRecord,
  IObservabilityErrorRecord,
  IObservabilityErrorIngestionPayload,
} from '@hbc/models/admin-control-plane';
import {
  AdminDomain,
  ObservabilityAlertSeverity,
  ObservabilityAlertStatus,
  ObservabilityAlertCategory,
  ObservabilityAffectedEntityType,
  ObservabilityProbeKind,
  ObservabilityProbeHealthStatus,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
} from '@hbc/models/admin-control-plane';

import {
  serializeAlertRecord,
  deserializeAlertRecord,
  MockObservabilityAlertStore,
} from '../observability-alert-store.js';
import {
  serializeProbeSnapshot,
  deserializeProbeSnapshot,
  MockObservabilityProbeSnapshotStore,
} from '../observability-probe-store.js';
import {
  serializeErrorRecord,
  deserializeErrorRecord,
  MockObservabilityErrorStore,
} from '../observability-error-store.js';

// ─── Test Constants ─────────────────────────────────────────────────────────────

const NOW = '2026-04-04T12:00:00.000Z';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-admin-1',
  displayName: 'Test Admin',
  capturedAt: NOW,
};

// ─── Alert Serialization Round-Trip ─────────────────────────────────────────────

describe('Alert serialization', () => {
  const fullAlert: IObservabilityAlertRecord = {
    alertId: 'alert-001',
    category: ObservabilityAlertCategory.ProvisioningFailure,
    severity: ObservabilityAlertSeverity.Critical,
    previousSeverity: ObservabilityAlertSeverity.High,
    status: ObservabilityAlertStatus.Acknowledged,
    title: 'Provisioning run failed',
    description: 'Project XYZ failed at step 3',
    affectedEntityType: ObservabilityAffectedEntityType.Job,
    affectedEntityId: 'run-001',
    domain: AdminDomain.ProvisioningRollout,
    runId: 'run-001',
    occurredAt: NOW,
    ingestedAt: NOW,
    acknowledgedAt: NOW,
    acknowledgedBy: TEST_ACTOR,
    resolvedAt: null,
    resolvedBy: null,
    dedupeKey: 'provisioning-failure:job:run-001',
    evaluationCount: 3,
    lastEvaluatedAt: NOW,
    ctaLabel: 'View Run',
    ctaHref: '/runs?projectId=xyz',
  };

  it('round-trips all fields', () => {
    const serialized = serializeAlertRecord(fullAlert);
    const deserialized = deserializeAlertRecord(serialized);

    expect(deserialized.alertId).toBe('alert-001');
    expect(deserialized.category).toBe(ObservabilityAlertCategory.ProvisioningFailure);
    expect(deserialized.severity).toBe(ObservabilityAlertSeverity.Critical);
    expect(deserialized.previousSeverity).toBe(ObservabilityAlertSeverity.High);
    expect(deserialized.status).toBe(ObservabilityAlertStatus.Acknowledged);
    expect(deserialized.title).toBe('Provisioning run failed');
    expect(deserialized.domain).toBe(AdminDomain.ProvisioningRollout);
    expect(deserialized.runId).toBe('run-001');
    expect(deserialized.acknowledgedBy?.upn).toBe('admin@hb.com');
    expect(deserialized.resolvedAt).toBeNull();
    expect(deserialized.resolvedBy).toBeNull();
    expect(deserialized.evaluationCount).toBe(3);
    expect(deserialized.ctaLabel).toBe('View Run');
    expect(deserialized.ctaHref).toBe('/runs?projectId=xyz');
  });

  it('uses category as partition key and alertId as row key', () => {
    const serialized = serializeAlertRecord(fullAlert);
    expect(serialized.partitionKey).toBe('provisioning-failure');
    expect(serialized.rowKey).toBe('alert-001');
  });

  it('round-trips null optional fields correctly', () => {
    const minimal: IObservabilityAlertRecord = {
      ...fullAlert,
      previousSeverity: null,
      domain: null,
      runId: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      ctaLabel: null,
      ctaHref: null,
    };
    const deserialized = deserializeAlertRecord(serializeAlertRecord(minimal));

    expect(deserialized.previousSeverity).toBeNull();
    expect(deserialized.domain).toBeNull();
    expect(deserialized.runId).toBeNull();
    expect(deserialized.acknowledgedAt).toBeNull();
    expect(deserialized.acknowledgedBy).toBeNull();
    expect(deserialized.resolvedAt).toBeNull();
    expect(deserialized.resolvedBy).toBeNull();
    expect(deserialized.ctaLabel).toBeNull();
    expect(deserialized.ctaHref).toBeNull();
  });
});

// ─── Probe Snapshot Serialization Round-Trip ────────────────────────────────────

describe('Probe snapshot serialization', () => {
  const probeResult: IObservabilityProbeResultRecord = {
    probeId: 'probe-result-001',
    probeKey: ObservabilityProbeKind.AzureFunctions,
    status: ObservabilityProbeHealthStatus.Healthy,
    summary: 'Health endpoint responded in 120ms',
    observedAt: NOW,
    metrics: { responseTimeMs: 120, statusCode: 200 },
    anomalies: [],
  };

  const fullSnapshot: IObservabilityProbeSnapshotRecord = {
    snapshotId: 'snapshot-001',
    capturedAt: NOW,
    persistedAt: NOW,
    triggerMode: 'scheduled',
    results: [
      probeResult,
      {
        ...probeResult,
        probeId: 'probe-result-002',
        probeKey: ObservabilityProbeKind.SharePointInfrastructure,
        status: ObservabilityProbeHealthStatus.Degraded,
        anomalies: ['High latency detected'],
      },
    ],
    overallStatus: ObservabilityProbeHealthStatus.Degraded,
  };

  it('round-trips all fields including nested probe results', () => {
    const serialized = serializeProbeSnapshot(fullSnapshot);
    const deserialized = deserializeProbeSnapshot(serialized);

    expect(deserialized.snapshotId).toBe('snapshot-001');
    expect(deserialized.capturedAt).toBe(NOW);
    expect(deserialized.triggerMode).toBe('scheduled');
    expect(deserialized.overallStatus).toBe(ObservabilityProbeHealthStatus.Degraded);
    expect(deserialized.results).toHaveLength(2);
    expect(deserialized.results[0].probeKey).toBe(ObservabilityProbeKind.AzureFunctions);
    expect(deserialized.results[0].metrics).toEqual({ responseTimeMs: 120, statusCode: 200 });
    expect(deserialized.results[1].anomalies).toEqual(['High latency detected']);
  });

  it('uses __snapshot__ as partition key and snapshotId as row key', () => {
    const serialized = serializeProbeSnapshot(fullSnapshot);
    expect(serialized.partitionKey).toBe('__snapshot__');
    expect(serialized.rowKey).toBe('snapshot-001');
  });

  it('round-trips manual trigger mode', () => {
    const manual = { ...fullSnapshot, triggerMode: 'manual' as const };
    const deserialized = deserializeProbeSnapshot(serializeProbeSnapshot(manual));
    expect(deserialized.triggerMode).toBe('manual');
  });
});

// ─── Error Record Serialization Round-Trip ──────────────────────────────────────

describe('Error record serialization', () => {
  const fullError: IObservabilityErrorRecord = {
    errorId: 'error-001',
    domain: AdminDomain.ProvisioningRollout,
    source: ObservabilityErrorSource.ProvisioningSaga,
    classification: ObservabilityErrorClassification.Transient,
    severity: ObservabilityAlertSeverity.Medium,
    title: 'SharePoint API timeout',
    message: 'Request timed out after 30s',
    details: { httpStatus: 504, endpoint: '/sites' },
    runId: 'run-001',
    actionKey: 'provisioning.create-site',
    stepNumber: 2,
    incidentId: null,
    occurredAt: NOW,
    ingestedAt: NOW,
  };

  it('round-trips all fields', () => {
    const serialized = serializeErrorRecord(fullError);
    const deserialized = deserializeErrorRecord(serialized);

    expect(deserialized.errorId).toBe('error-001');
    expect(deserialized.domain).toBe(AdminDomain.ProvisioningRollout);
    expect(deserialized.source).toBe(ObservabilityErrorSource.ProvisioningSaga);
    expect(deserialized.classification).toBe(ObservabilityErrorClassification.Transient);
    expect(deserialized.title).toBe('SharePoint API timeout');
    expect(deserialized.details).toEqual({ httpStatus: 504, endpoint: '/sites' });
    expect(deserialized.runId).toBe('run-001');
    expect(deserialized.stepNumber).toBe(2);
    expect(deserialized.incidentId).toBeNull();
  });

  it('uses domain as partition key and errorId as row key', () => {
    const serialized = serializeErrorRecord(fullError);
    expect(serialized.partitionKey).toBe('provisioning-rollout');
    expect(serialized.rowKey).toBe('error-001');
  });

  it('round-trips null optional fields correctly', () => {
    const minimal: IObservabilityErrorRecord = {
      ...fullError,
      details: null,
      runId: null,
      actionKey: null,
      stepNumber: null,
      incidentId: null,
    };
    const deserialized = deserializeErrorRecord(serializeErrorRecord(minimal));

    expect(deserialized.details).toBeNull();
    expect(deserialized.runId).toBeNull();
    expect(deserialized.actionKey).toBeNull();
    expect(deserialized.stepNumber).toBeNull();
    expect(deserialized.incidentId).toBeNull();
  });
});

// ─── Mock Alert Store Behavior ──────────────────────────────────────────────────

describe('MockObservabilityAlertStore', () => {
  function makeIngestionPayload(
    items: Array<Partial<IObservabilityAlertIngestionPayload['alerts'][number]>>,
  ): IObservabilityAlertIngestionPayload {
    return {
      alerts: items.map((item, i) => ({
        category: ObservabilityAlertCategory.ProvisioningFailure,
        severity: ObservabilityAlertSeverity.High,
        title: `Alert ${i + 1}`,
        description: `Description ${i + 1}`,
        affectedEntityType: ObservabilityAffectedEntityType.Job,
        affectedEntityId: `run-${i + 1}`,
        domain: AdminDomain.ProvisioningRollout,
        runId: `run-${i + 1}`,
        occurredAt: NOW,
        dedupeKey: `key-${i + 1}`,
        ctaLabel: null,
        ctaHref: null,
        ...item,
      })),
      evaluatedAt: NOW,
    };
  }

  it('ingests alerts and assigns IDs', async () => {
    const store = new MockObservabilityAlertStore();
    const results = await store.ingestAlerts(makeIngestionPayload([{}, {}]));

    expect(results).toHaveLength(2);
    expect(results[0].alertId).toBeTruthy();
    expect(results[0].status).toBe('active');
    expect(results[0].evaluationCount).toBe(1);
  });

  it('deduplicates by dedupeKey and increments evaluation count', async () => {
    const store = new MockObservabilityAlertStore();
    await store.ingestAlerts(makeIngestionPayload([{ dedupeKey: 'dup-key' }]));
    const second = await store.ingestAlerts(makeIngestionPayload([{ dedupeKey: 'dup-key' }]));

    expect(second).toHaveLength(1);
    expect(second[0].evaluationCount).toBe(2);

    const list = await store.listAlerts({
      status: null, category: null, severity: null, domain: null,
      from: null, to: null, cursor: null, limit: 50,
    });
    expect(list.items).toHaveLength(1);
  });

  it('tracks severity escalation on deduplication', async () => {
    const store = new MockObservabilityAlertStore();
    await store.ingestAlerts(makeIngestionPayload([{
      dedupeKey: 'esc-key',
      severity: ObservabilityAlertSeverity.High,
    }]));
    const second = await store.ingestAlerts(makeIngestionPayload([{
      dedupeKey: 'esc-key',
      severity: ObservabilityAlertSeverity.Critical,
    }]));

    expect(second[0].severity).toBe(ObservabilityAlertSeverity.Critical);
    expect(second[0].previousSeverity).toBe(ObservabilityAlertSeverity.High);
  });

  it('acknowledges an alert', async () => {
    const store = new MockObservabilityAlertStore();
    const [alert] = await store.ingestAlerts(makeIngestionPayload([{}]));
    const acked = await store.acknowledgeAlert(alert.alertId, TEST_ACTOR);

    expect(acked.status).toBe('acknowledged');
    expect(acked.acknowledgedBy?.upn).toBe('admin@hb.com');
    expect(acked.acknowledgedAt).toBeTruthy();
  });

  it('resolves an alert', async () => {
    const store = new MockObservabilityAlertStore();
    const [alert] = await store.ingestAlerts(makeIngestionPayload([{}]));
    const resolved = await store.resolveAlert(alert.alertId, TEST_ACTOR);

    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedBy?.upn).toBe('admin@hb.com');
  });

  it('throws on acknowledge for non-existent alert', async () => {
    const store = new MockObservabilityAlertStore();
    await expect(store.acknowledgeAlert('nope', TEST_ACTOR)).rejects.toThrow('Alert not found');
  });

  it('filters by status', async () => {
    const store = new MockObservabilityAlertStore();
    const [alert] = await store.ingestAlerts(makeIngestionPayload([{}, {}]));
    await store.acknowledgeAlert(alert.alertId, TEST_ACTOR);

    const active = await store.listAlerts({
      status: ObservabilityAlertStatus.Active, category: null, severity: null,
      domain: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(active.items).toHaveLength(1);
  });

  it('returns correct summary counts', async () => {
    const store = new MockObservabilityAlertStore();
    await store.ingestAlerts(makeIngestionPayload([
      { severity: ObservabilityAlertSeverity.Critical, dedupeKey: 'k1' },
      { severity: ObservabilityAlertSeverity.High, dedupeKey: 'k2' },
      { severity: ObservabilityAlertSeverity.Medium, dedupeKey: 'k3' },
      { severity: ObservabilityAlertSeverity.Low, dedupeKey: 'k4' },
    ]));
    const summary = await store.getAlertSummary();

    expect(summary.criticalCount).toBe(1);
    expect(summary.highCount).toBe(1);
    expect(summary.mediumCount).toBe(1);
    expect(summary.lowCount).toBe(1);
    expect(summary.totalActiveCount).toBe(4);
    expect(summary.mostRecentAt).toBe(NOW);
  });

  it('getAlert returns null for non-existent ID', async () => {
    const store = new MockObservabilityAlertStore();
    expect(await store.getAlert('nope')).toBeNull();
  });
});

// ─── Mock Probe Snapshot Store Behavior ─────────────────────────────────────────

describe('MockObservabilityProbeSnapshotStore', () => {
  const makeResult = (
    key: ObservabilityProbeKind,
    status: ObservabilityProbeHealthStatus,
  ): IObservabilityProbeResultRecord => ({
    probeId: `probe-${key}`,
    probeKey: key,
    status,
    summary: `${key} is ${status}`,
    observedAt: NOW,
    metrics: {},
    anomalies: [],
  });

  it('saves and retrieves latest snapshot', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    await store.saveSnapshot({
      snapshotId: 'snap-1',
      capturedAt: '2026-04-04T11:00:00.000Z',
      triggerMode: 'scheduled',
      results: [makeResult(ObservabilityProbeKind.AzureFunctions, ObservabilityProbeHealthStatus.Healthy)],
    });
    await store.saveSnapshot({
      snapshotId: 'snap-2',
      capturedAt: '2026-04-04T12:00:00.000Z',
      triggerMode: 'manual',
      results: [makeResult(ObservabilityProbeKind.AzureFunctions, ObservabilityProbeHealthStatus.Error)],
    });

    const latest = await store.getLatestSnapshot();
    expect(latest?.snapshotId).toBe('snap-2');
    expect(latest?.overallStatus).toBe(ObservabilityProbeHealthStatus.Error);
  });

  it('computes overall status as worst among results', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    const saved = await store.saveSnapshot({
      snapshotId: 'snap-mixed',
      capturedAt: NOW,
      triggerMode: 'scheduled',
      results: [
        makeResult(ObservabilityProbeKind.AzureFunctions, ObservabilityProbeHealthStatus.Healthy),
        makeResult(ObservabilityProbeKind.SharePointInfrastructure, ObservabilityProbeHealthStatus.Degraded),
      ],
    });
    expect(saved.overallStatus).toBe(ObservabilityProbeHealthStatus.Degraded);
  });

  it('returns null when no snapshots exist', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    expect(await store.getLatestSnapshot()).toBeNull();
  });

  it('filters snapshots by probeKey', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    await store.saveSnapshot({
      snapshotId: 'snap-1',
      capturedAt: NOW,
      triggerMode: 'scheduled',
      results: [makeResult(ObservabilityProbeKind.AzureFunctions, ObservabilityProbeHealthStatus.Healthy)],
    });
    await store.saveSnapshot({
      snapshotId: 'snap-2',
      capturedAt: NOW,
      triggerMode: 'scheduled',
      results: [makeResult(ObservabilityProbeKind.SharePointInfrastructure, ObservabilityProbeHealthStatus.Healthy)],
    });

    const result = await store.listSnapshots({
      probeKey: ObservabilityProbeKind.AzureFunctions,
      from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].snapshotId).toBe('snap-1');
  });

  it('health summary shows stale when no snapshots', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    const summary = await store.getHealthSummary();
    expect(summary.overallStatus).toBe('unknown');
    expect(summary.isStale).toBe(true);
    expect(summary.lastSnapshotAt).toBeNull();
  });

  it('health summary counts per-status', async () => {
    const store = new MockObservabilityProbeSnapshotStore();
    await store.saveSnapshot({
      snapshotId: 'snap-health',
      capturedAt: new Date().toISOString(),
      triggerMode: 'scheduled',
      results: [
        makeResult(ObservabilityProbeKind.AzureFunctions, ObservabilityProbeHealthStatus.Healthy),
        makeResult(ObservabilityProbeKind.SharePointInfrastructure, ObservabilityProbeHealthStatus.Degraded),
        makeResult(ObservabilityProbeKind.AzureSearch, ObservabilityProbeHealthStatus.Error),
      ],
    });
    const summary = await store.getHealthSummary();
    expect(summary.healthyCount).toBe(1);
    expect(summary.degradedCount).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.overallStatus).toBe(ObservabilityProbeHealthStatus.Error);
  });
});

// ─── Mock Error Store Behavior ──────────────────────────────────────────────────

describe('MockObservabilityErrorStore', () => {
  function makeErrorPayload(
    items: Array<Partial<IObservabilityErrorIngestionPayload['errors'][number]>>,
  ): IObservabilityErrorIngestionPayload {
    return {
      errors: items.map((item, i) => ({
        domain: AdminDomain.ProvisioningRollout,
        source: ObservabilityErrorSource.ProvisioningSaga,
        classification: ObservabilityErrorClassification.Transient,
        severity: ObservabilityAlertSeverity.Medium,
        title: `Error ${i + 1}`,
        message: `Error message ${i + 1}`,
        details: null,
        runId: null,
        actionKey: null,
        stepNumber: null,
        occurredAt: NOW,
        ...item,
      })),
    };
  }

  it('ingests errors and assigns IDs', async () => {
    const store = new MockObservabilityErrorStore();
    const results = await store.ingestErrors(makeErrorPayload([{}, {}]));

    expect(results).toHaveLength(2);
    expect(results[0].errorId).toBeTruthy();
    expect(results[0].ingestedAt).toBeTruthy();
  });

  it('retrieves error by ID', async () => {
    const store = new MockObservabilityErrorStore();
    const [error] = await store.ingestErrors(makeErrorPayload([{}]));
    const found = await store.getError(error.errorId);

    expect(found).not.toBeNull();
    expect(found?.errorId).toBe(error.errorId);
  });

  it('returns null for non-existent error', async () => {
    const store = new MockObservabilityErrorStore();
    expect(await store.getError('nope')).toBeNull();
  });

  it('filters by domain', async () => {
    const store = new MockObservabilityErrorStore();
    await store.ingestErrors(makeErrorPayload([
      { domain: AdminDomain.ProvisioningRollout },
      { domain: AdminDomain.SharePointControl },
    ]));

    const result = await store.listErrors({
      domain: AdminDomain.SharePointControl, source: null, classification: null,
      severity: null, runId: null, from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].domain).toBe(AdminDomain.SharePointControl);
  });

  it('filters by source and classification', async () => {
    const store = new MockObservabilityErrorStore();
    await store.ingestErrors(makeErrorPayload([
      { source: ObservabilityErrorSource.ProvisioningSaga, classification: ObservabilityErrorClassification.Transient },
      { source: ObservabilityErrorSource.SharePointControl, classification: ObservabilityErrorClassification.Permissions },
    ]));

    const result = await store.listErrors({
      domain: null, source: ObservabilityErrorSource.SharePointControl,
      classification: null, severity: null, runId: null,
      from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
  });

  it('filters by runId', async () => {
    const store = new MockObservabilityErrorStore();
    await store.ingestErrors(makeErrorPayload([
      { runId: 'run-abc' },
      { runId: 'run-def' },
      { runId: null },
    ]));

    const result = await store.listErrors({
      domain: null, source: null, classification: null,
      severity: null, runId: 'run-abc',
      from: null, to: null, cursor: null, limit: 50,
    });
    expect(result.items).toHaveLength(1);
  });

  it('respects limit', async () => {
    const store = new MockObservabilityErrorStore();
    await store.ingestErrors(makeErrorPayload([{}, {}, {}, {}, {}]));

    const result = await store.listErrors({
      domain: null, source: null, classification: null,
      severity: null, runId: null,
      from: null, to: null, cursor: null, limit: 2,
    });
    expect(result.items).toHaveLength(2);
    expect(result.totalCount).toBe(5);
  });
});
