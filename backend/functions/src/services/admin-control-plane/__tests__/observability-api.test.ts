/**
 * Phase 12 — Observability API Service Tests
 *
 * Tests covering:
 * - Dashboard summary assembly
 * - Timeline assembly and sorting
 * - Telemetry bridge normalization
 */

import { describe, expect, it } from 'vitest';
import {
  AdminDomain,
  AdminAuditEventType,
  ObservabilityAlertSeverity,
  ObservabilityAlertStatus,
  ObservabilityAlertCategory,
  ObservabilityAffectedEntityType,
  ObservabilityProbeKind,
  ObservabilityProbeHealthStatus,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityTimelineItemKind,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminActorContext,
  IAdminAuditRecord,
  IObservabilityAlertIngestionPayload,
} from '@hbc/models/admin-control-plane';
import { MockObservabilityAlertStore } from '../observability-alert-store.js';
import { MockObservabilityProbeSnapshotStore } from '../observability-probe-store.js';
import { MockObservabilityErrorStore } from '../observability-error-store.js';
import { assembleDashboardSummary } from '../observability-dashboard-service.js';
import { assembleRunTimeline } from '../observability-timeline-service.js';
import {
  bridgeFailureToErrorStore,
  bridgeAlertEvaluationToStore,
  createObservabilityBridge,
} from '../observability-telemetry-bridge.js';
import type { IObservabilityBridgeEvent } from '../observability-telemetry-bridge.js';

// ─── Test Constants ─────────────────────────────────────────────────────────────

const NOW = '2026-04-04T12:00:00.000Z';

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-admin-1',
  displayName: 'Test Admin',
  capturedAt: NOW,
};

// ─── Mock Audit Service ─────────────────────────────────────────────────────────

function createMockAuditService(records: IAdminAuditRecord[] = []) {
  return {
    recordEvent: async () => {},
    listByRunId: async (runId: string) =>
      records.filter(r => r.runId === runId).sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    listByEventType: async () => records,
  };
}

function makeAuditRecord(overrides: Partial<IAdminAuditRecord> = {}): IAdminAuditRecord {
  return {
    auditId: 'audit-001',
    eventType: AdminAuditEventType.RunStarted,
    timestamp: '2026-04-04T11:00:00.000Z',
    domain: AdminDomain.ProvisioningRollout as never,
    actionKey: 'provisioning.execute' as never,
    runId: 'run-001',
    checkpointInstanceId: null as never,
    actor: TEST_ACTOR,
    rationale: null as never,
    evidenceRef: null as never,
    configSnapshotRef: null as never,
    runStatusAtEvent: 'Running' as never,
    summary: 'Run started',
    ...overrides,
  };
}

// ─── Dashboard Summary Tests ────────────────────────────────────────────────────

describe('assembleDashboardSummary', () => {
  it('assembles summary from all stores with empty data', async () => {
    const alertStore = new MockObservabilityAlertStore();
    const probeStore = new MockObservabilityProbeSnapshotStore();
    const errorStore = new MockObservabilityErrorStore();

    const summary = await assembleDashboardSummary(alertStore, probeStore, errorStore);

    expect(summary.alerts.totalActiveCount).toBe(0);
    expect(summary.probes.overallStatus).toBe(ObservabilityProbeHealthStatus.Unknown);
    expect(summary.probes.isStale).toBe(true);
    expect(summary.errors.totalCount).toBe(0);
    expect(summary.incidents.openCount).toBe(0);
    expect(summary.computedAt).toBeTruthy();
  });

  it('assembles summary with real alert data', async () => {
    const alertStore = new MockObservabilityAlertStore();
    const probeStore = new MockObservabilityProbeSnapshotStore();
    const errorStore = new MockObservabilityErrorStore();

    await alertStore.ingestAlerts({
      alerts: [
        {
          category: ObservabilityAlertCategory.ProvisioningFailure,
          severity: ObservabilityAlertSeverity.Critical,
          title: 'Critical failure',
          description: 'desc',
          affectedEntityType: ObservabilityAffectedEntityType.Job,
          affectedEntityId: 'run-1',
          domain: AdminDomain.ProvisioningRollout,
          runId: 'run-1',
          occurredAt: NOW,
          dedupeKey: 'key-1',
          ctaLabel: null,
          ctaHref: null,
        },
        {
          category: ObservabilityAlertCategory.StuckWorkflow,
          severity: ObservabilityAlertSeverity.High,
          title: 'Stuck',
          description: 'desc',
          affectedEntityType: ObservabilityAffectedEntityType.Job,
          affectedEntityId: 'run-2',
          domain: AdminDomain.ProvisioningRollout,
          runId: 'run-2',
          occurredAt: NOW,
          dedupeKey: 'key-2',
          ctaLabel: null,
          ctaHref: null,
        },
      ],
      evaluatedAt: NOW,
    });

    const summary = await assembleDashboardSummary(alertStore, probeStore, errorStore);
    expect(summary.alerts.criticalCount).toBe(1);
    expect(summary.alerts.highCount).toBe(1);
    expect(summary.alerts.totalActiveCount).toBe(2);
  });

  it('assembles summary with probe snapshot data', async () => {
    const alertStore = new MockObservabilityAlertStore();
    const probeStore = new MockObservabilityProbeSnapshotStore();
    const errorStore = new MockObservabilityErrorStore();

    await probeStore.saveSnapshot({
      snapshotId: 'snap-1',
      capturedAt: new Date().toISOString(),
      triggerMode: 'scheduled',
      results: [
        {
          probeId: 'p1', probeKey: ObservabilityProbeKind.AzureFunctions,
          status: ObservabilityProbeHealthStatus.Healthy, summary: 'ok',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
        {
          probeId: 'p2', probeKey: ObservabilityProbeKind.SharePointInfrastructure,
          status: ObservabilityProbeHealthStatus.Error, summary: 'fail',
          observedAt: NOW, metrics: {}, anomalies: [],
        },
      ],
    });

    const summary = await assembleDashboardSummary(alertStore, probeStore, errorStore);
    expect(summary.probes.healthyCount).toBe(1);
    expect(summary.probes.errorCount).toBe(1);
    expect(summary.probes.overallStatus).toBe(ObservabilityProbeHealthStatus.Error);
  });

  it('counts recent error severities', async () => {
    const alertStore = new MockObservabilityAlertStore();
    const probeStore = new MockObservabilityProbeSnapshotStore();
    const errorStore = new MockObservabilityErrorStore();

    await errorStore.ingestErrors({
      errors: [
        {
          domain: AdminDomain.ProvisioningRollout,
          source: ObservabilityErrorSource.ProvisioningSaga,
          classification: ObservabilityErrorClassification.Transient,
          severity: ObservabilityAlertSeverity.Critical,
          title: 'Crit error', message: 'msg',
          details: null, runId: null, actionKey: null, stepNumber: null,
          occurredAt: new Date().toISOString(),
        },
        {
          domain: AdminDomain.ProvisioningRollout,
          source: ObservabilityErrorSource.ProvisioningSaga,
          classification: ObservabilityErrorClassification.Transient,
          severity: ObservabilityAlertSeverity.High,
          title: 'High error', message: 'msg',
          details: null, runId: null, actionKey: null, stepNumber: null,
          occurredAt: new Date().toISOString(),
        },
      ],
    });

    const summary = await assembleDashboardSummary(alertStore, probeStore, errorStore);
    expect(summary.errors.totalCount).toBe(2);
    expect(summary.errors.criticalCount).toBe(1);
    expect(summary.errors.highCount).toBe(1);
  });
});

// ─── Timeline Assembly Tests ────────────────────────────────────────────────────

describe('assembleRunTimeline', () => {
  it('assembles timeline from audit events, alerts, and errors', async () => {
    const auditService = createMockAuditService([
      makeAuditRecord({ auditId: 'a1', timestamp: '2026-04-04T11:00:00.000Z', runId: 'run-001' }),
      makeAuditRecord({
        auditId: 'a2', eventType: AdminAuditEventType.RunCompleted,
        timestamp: '2026-04-04T11:30:00.000Z', runId: 'run-001', summary: 'Run completed',
      }),
    ]);

    const alertStore = new MockObservabilityAlertStore();
    await alertStore.ingestAlerts({
      alerts: [{
        category: ObservabilityAlertCategory.ProvisioningFailure,
        severity: ObservabilityAlertSeverity.High,
        title: 'Failure alert', description: 'desc',
        affectedEntityType: ObservabilityAffectedEntityType.Job,
        affectedEntityId: 'run-001',
        domain: AdminDomain.ProvisioningRollout,
        runId: 'run-001',
        occurredAt: '2026-04-04T11:15:00.000Z',
        dedupeKey: 'k1', ctaLabel: null, ctaHref: null,
      }],
      evaluatedAt: NOW,
    });

    const errorStore = new MockObservabilityErrorStore();
    await errorStore.ingestErrors({
      errors: [{
        domain: AdminDomain.ProvisioningRollout,
        source: ObservabilityErrorSource.ProvisioningSaga,
        classification: ObservabilityErrorClassification.Transient,
        severity: ObservabilityAlertSeverity.Medium,
        title: 'Timeout', message: 'API timeout',
        details: null, runId: 'run-001', actionKey: null, stepNumber: 2,
        occurredAt: '2026-04-04T11:10:00.000Z',
      }],
    });

    const timeline = await assembleRunTimeline(auditService, alertStore, errorStore, 'run-001');

    expect(timeline.items.length).toBeGreaterThanOrEqual(4);
    // Most recent first
    expect(timeline.items[0].timestamp >= timeline.items[1].timestamp).toBe(true);

    // Check item kinds present
    const kinds = new Set(timeline.items.map(i => i.kind));
    expect(kinds.has(ObservabilityTimelineItemKind.AuditEvent)).toBe(true);
    expect(kinds.has(ObservabilityTimelineItemKind.Alert)).toBe(true);
    expect(kinds.has(ObservabilityTimelineItemKind.Error)).toBe(true);
  });

  it('returns empty timeline for non-existent runId', async () => {
    const auditService = createMockAuditService([]);
    const alertStore = new MockObservabilityAlertStore();
    const errorStore = new MockObservabilityErrorStore();

    const timeline = await assembleRunTimeline(auditService, alertStore, errorStore, 'nope');
    expect(timeline.items).toHaveLength(0);
    expect(timeline.totalCount).toBe(0);
  });

  it('respects limit parameter', async () => {
    const auditRecords = Array.from({ length: 20 }, (_, i) =>
      makeAuditRecord({
        auditId: `a-${i}`,
        timestamp: `2026-04-04T${String(i).padStart(2, '0')}:00:00.000Z`,
        runId: 'run-001',
      }),
    );
    const auditService = createMockAuditService(auditRecords);
    const alertStore = new MockObservabilityAlertStore();
    const errorStore = new MockObservabilityErrorStore();

    const timeline = await assembleRunTimeline(auditService, alertStore, errorStore, 'run-001', 5);
    expect(timeline.items).toHaveLength(5);
    expect(timeline.totalCount).toBe(20);
  });
});

// ─── Telemetry Bridge Tests ─────────────────────────────────────────────────────

describe('ObservabilityTelemetryBridge', () => {
  describe('bridgeFailureToErrorStore', () => {
    it('bridges a saga failure into an error record', async () => {
      const errorStore = new MockObservabilityErrorStore();
      const event: IObservabilityBridgeEvent = {
        type: 'saga.failed',
        domain: AdminDomain.ProvisioningRollout,
        runId: 'run-001',
        actionKey: 'provisioning.execute',
        stepNumber: 3,
        title: 'Site creation failed',
        message: 'SharePoint API returned 504',
        details: { httpStatus: 504 },
        occurredAt: NOW,
        failureClass: 'transient',
      };

      await bridgeFailureToErrorStore(errorStore, event);

      const result = await errorStore.listErrors({
        domain: null, source: null, classification: null, severity: null,
        runId: 'run-001', from: null, to: null, cursor: null, limit: 50,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].source).toBe(ObservabilityErrorSource.ProvisioningSaga);
      expect(result.items[0].classification).toBe(ObservabilityErrorClassification.Transient);
      expect(result.items[0].runId).toBe('run-001');
      expect(result.items[0].stepNumber).toBe(3);
    });

    it('maps failure classes correctly', async () => {
      const errorStore = new MockObservabilityErrorStore();

      for (const [failureClass, expected] of [
        ['transient', ObservabilityErrorClassification.Transient],
        ['permissions', ObservabilityErrorClassification.Permissions],
        ['structural', ObservabilityErrorClassification.Structural],
        ['repeated', ObservabilityErrorClassification.Repeated],
        ['admin-class', ObservabilityErrorClassification.AdminClass],
        [null, ObservabilityErrorClassification.Unclassified],
        ['unknown-class', ObservabilityErrorClassification.Unclassified],
      ] as const) {
        const event: IObservabilityBridgeEvent = {
          type: 'saga.failed',
          domain: AdminDomain.ProvisioningRollout,
          runId: null, actionKey: null, stepNumber: null,
          title: 'test', message: 'test',
          details: null, occurredAt: NOW,
          failureClass: failureClass as string | null,
        };
        await bridgeFailureToErrorStore(errorStore, event);
      }

      const result = await errorStore.listErrors({
        domain: null, source: null, classification: null, severity: null,
        runId: null, from: null, to: null, cursor: null, limit: 50,
      });
      expect(result.items).toHaveLength(7);
    });

    it('does not throw on store failure', async () => {
      const errorStore = {
        ingestErrors: async () => { throw new Error('Store down'); },
        getError: async () => null,
        listErrors: async () => ({ items: [], nextCursor: null, totalCount: 0 }),
      };

      // Should not throw
      await bridgeFailureToErrorStore(errorStore as never, {
        type: 'saga.failed',
        domain: AdminDomain.ProvisioningRollout,
        runId: null, actionKey: null, stepNumber: null,
        title: 'test', message: 'test',
        details: null, occurredAt: NOW, failureClass: null,
      });
    });
  });

  describe('bridgeAlertEvaluationToStore', () => {
    it('bridges alert evaluations into durable records', async () => {
      const alertStore = new MockObservabilityAlertStore();
      const payload: IObservabilityAlertIngestionPayload = {
        alerts: [{
          category: ObservabilityAlertCategory.ProvisioningFailure,
          severity: ObservabilityAlertSeverity.High,
          title: 'Alert', description: 'desc',
          affectedEntityType: ObservabilityAffectedEntityType.Job,
          affectedEntityId: 'run-001',
          domain: AdminDomain.ProvisioningRollout,
          runId: 'run-001', occurredAt: NOW,
          dedupeKey: 'k1', ctaLabel: null, ctaHref: null,
        }],
        evaluatedAt: NOW,
      };

      const result = await bridgeAlertEvaluationToStore(alertStore, payload);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ObservabilityAlertStatus.Active);
    });

    it('returns empty array on store failure', async () => {
      const alertStore = {
        ingestAlerts: async () => { throw new Error('Store down'); },
        getAlert: async () => null,
        listAlerts: async () => ({ items: [], nextCursor: null, totalCount: 0 }),
        acknowledgeAlert: async () => { throw new Error(); },
        resolveAlert: async () => { throw new Error(); },
        getAlertSummary: async () => ({
          criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0,
          totalActiveCount: 0, mostRecentAt: null,
        }),
      };

      const result = await bridgeAlertEvaluationToStore(alertStore as never, {
        alerts: [], evaluatedAt: NOW,
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('createObservabilityBridge', () => {
    it('creates a bound bridge instance', async () => {
      const alertStore = new MockObservabilityAlertStore();
      const errorStore = new MockObservabilityErrorStore();
      const bridge = createObservabilityBridge(alertStore, errorStore);

      await bridge.bridgeFailure({
        type: 'saga.failed',
        domain: AdminDomain.ProvisioningRollout,
        runId: 'run-001', actionKey: null, stepNumber: null,
        title: 'Failure', message: 'msg',
        details: null, occurredAt: NOW, failureClass: 'permissions',
      });

      const errors = await errorStore.listErrors({
        domain: null, source: null, classification: null, severity: null,
        runId: 'run-001', from: null, to: null, cursor: null, limit: 50,
      });
      expect(errors.items).toHaveLength(1);
      expect(errors.items[0].classification).toBe(ObservabilityErrorClassification.Permissions);
    });
  });
});
