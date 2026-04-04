import { describe, expect, it } from 'vitest';
import {
  ObservabilityAlertSeverity,
  ObservabilityAlertStatus,
  ObservabilityAlertCategory,
  ObservabilityAffectedEntityType,
  ObservabilityProbeKind,
  ObservabilityProbeHealthStatus,
  ObservabilityIncidentStatus,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityOperatorActionType,
  ObservabilityTimelineItemKind,
  AdminDomain,
} from './index.js';
import type {
  IObservabilityAlertRecord,
  IObservabilityAlertIngestionPayload,
  IObservabilityAlertIngestionItem,
  IObservabilityAlertQuery,
  IObservabilityAlertSummary,
  IObservabilityProbeResultRecord,
  IObservabilityProbeSnapshotRecord,
  IObservabilityProbeSnapshotQuery,
  IObservabilityProbeSubmissionPayload,
  IObservabilityProbeHealthSummary,
  IObservabilityIncidentRecord,
  IObservabilityIncidentQuery,
  IObservabilityErrorRecord,
  IObservabilityErrorIngestionPayload,
  IObservabilityErrorQuery,
  IObservabilityCorrelation,
  IObservabilityOperatorActionRecord,
  IObservabilityTimelineItem,
  IObservabilityTimelineQuery,
  IObservabilityPagedResponse,
  IObservabilityDashboardSummary,
} from './index.js';

// ─── Test Fixtures ──────────────────────────────────────────────────────────────

const NOW = '2026-04-04T12:00:00.000Z';
const ACTOR = {
  upn: 'admin@example.com',
  objectId: 'oid-001',
  displayName: 'Test Admin',
  capturedAt: NOW,
};

function createAlertRecord(
  overrides?: Partial<IObservabilityAlertRecord>,
): IObservabilityAlertRecord {
  return {
    alertId: 'alert-001',
    category: ObservabilityAlertCategory.ProvisioningFailure,
    severity: ObservabilityAlertSeverity.High,
    previousSeverity: null,
    status: ObservabilityAlertStatus.Active,
    title: 'Provisioning run failed',
    description: 'Project XYZ provisioning failed at step 3',
    affectedEntityType: ObservabilityAffectedEntityType.Job,
    affectedEntityId: 'run-001',
    domain: AdminDomain.ProvisioningRollout,
    runId: 'run-001',
    occurredAt: NOW,
    ingestedAt: NOW,
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    resolvedBy: null,
    dedupeKey: 'provisioning-failure:job:run-001',
    evaluationCount: 1,
    lastEvaluatedAt: NOW,
    ctaLabel: 'View Run',
    ctaHref: '/runs?projectId=xyz',
    ...overrides,
  };
}

function createProbeResultRecord(
  overrides?: Partial<IObservabilityProbeResultRecord>,
): IObservabilityProbeResultRecord {
  return {
    probeId: 'probe-result-001',
    probeKey: ObservabilityProbeKind.AzureFunctions,
    status: ObservabilityProbeHealthStatus.Healthy,
    summary: 'Azure Functions health endpoint responded in 120ms',
    observedAt: NOW,
    metrics: { responseTimeMs: 120, statusCode: 200 },
    anomalies: [],
    ...overrides,
  };
}

function createProbeSnapshotRecord(
  overrides?: Partial<IObservabilityProbeSnapshotRecord>,
): IObservabilityProbeSnapshotRecord {
  return {
    snapshotId: 'snapshot-001',
    capturedAt: NOW,
    persistedAt: NOW,
    triggerMode: 'scheduled',
    results: [createProbeResultRecord()],
    overallStatus: ObservabilityProbeHealthStatus.Healthy,
    ...overrides,
  };
}

function createErrorRecord(
  overrides?: Partial<IObservabilityErrorRecord>,
): IObservabilityErrorRecord {
  return {
    errorId: 'error-001',
    domain: AdminDomain.ProvisioningRollout,
    source: ObservabilityErrorSource.ProvisioningSaga,
    classification: ObservabilityErrorClassification.Transient,
    severity: ObservabilityAlertSeverity.Medium,
    title: 'SharePoint API timeout',
    message: 'Request to create site timed out after 30s',
    details: { httpStatus: 504, endpoint: '/sites' },
    runId: 'run-001',
    actionKey: 'provisioning.create-site',
    stepNumber: 2,
    incidentId: null,
    occurredAt: NOW,
    ingestedAt: NOW,
    ...overrides,
  };
}

function createIncidentRecord(
  overrides?: Partial<IObservabilityIncidentRecord>,
): IObservabilityIncidentRecord {
  return {
    incidentId: 'incident-001',
    title: 'Repeated provisioning failures',
    description: 'Multiple provisioning runs failing at site creation step',
    status: ObservabilityIncidentStatus.Open,
    severity: ObservabilityAlertSeverity.High,
    domain: AdminDomain.ProvisioningRollout,
    linkedAlertIds: ['alert-001', 'alert-002'],
    linkedErrorIds: ['error-001'],
    linkedRunIds: ['run-001', 'run-002'],
    openedAt: NOW,
    openedBy: ACTOR,
    resolvedAt: null,
    resolvedBy: null,
    closedAt: null,
    closedBy: null,
    resolutionSummary: null,
    lastUpdatedAt: NOW,
    ...overrides,
  };
}

// ─── Enum Value Tests ───────────────────────────────────────────────────────────

describe('ObservabilityEnums', () => {
  describe('ObservabilityAlertSeverity', () => {
    it('has exactly 4 severity levels', () => {
      const values = Object.values(ObservabilityAlertSeverity);
      expect(values).toHaveLength(4);
      expect(values).toContain('critical');
      expect(values).toContain('high');
      expect(values).toContain('medium');
      expect(values).toContain('low');
    });
  });

  describe('ObservabilityAlertStatus', () => {
    it('has exactly 4 statuses', () => {
      const values = Object.values(ObservabilityAlertStatus);
      expect(values).toHaveLength(4);
      expect(values).toContain('active');
      expect(values).toContain('acknowledged');
      expect(values).toContain('resolved');
      expect(values).toContain('superseded');
    });
  });

  describe('ObservabilityAlertCategory', () => {
    it('has exactly 6 categories matching existing monitor set', () => {
      const values = Object.values(ObservabilityAlertCategory);
      expect(values).toHaveLength(6);
      expect(values).toContain('provisioning-failure');
      expect(values).toContain('permission-anomaly');
      expect(values).toContain('stuck-workflow');
      expect(values).toContain('overdue-provisioning-task');
      expect(values).toContain('upcoming-expiration');
      expect(values).toContain('stale-record');
    });
  });

  describe('ObservabilityAffectedEntityType', () => {
    it('has exactly 5 entity types', () => {
      const values = Object.values(ObservabilityAffectedEntityType);
      expect(values).toHaveLength(5);
    });
  });

  describe('ObservabilityProbeKind', () => {
    it('has exactly 5 probe kinds matching existing probe set', () => {
      const values = Object.values(ObservabilityProbeKind);
      expect(values).toHaveLength(5);
      expect(values).toContain('sharepoint-infrastructure');
      expect(values).toContain('azure-functions');
      expect(values).toContain('azure-search');
      expect(values).toContain('notification-system');
      expect(values).toContain('module-record-health');
    });
  });

  describe('ObservabilityProbeHealthStatus', () => {
    it('has exactly 4 health statuses', () => {
      const values = Object.values(ObservabilityProbeHealthStatus);
      expect(values).toHaveLength(4);
      expect(values).toContain('healthy');
      expect(values).toContain('degraded');
      expect(values).toContain('error');
      expect(values).toContain('unknown');
    });
  });

  describe('ObservabilityIncidentStatus', () => {
    it('has exactly 4 statuses', () => {
      const values = Object.values(ObservabilityIncidentStatus);
      expect(values).toHaveLength(4);
    });
  });

  describe('ObservabilityErrorClassification', () => {
    it('has exactly 6 classifications', () => {
      const values = Object.values(ObservabilityErrorClassification);
      expect(values).toHaveLength(6);
      expect(values).toContain('transient');
      expect(values).toContain('permissions');
      expect(values).toContain('structural');
      expect(values).toContain('repeated');
      expect(values).toContain('admin-class');
      expect(values).toContain('unclassified');
    });
  });

  describe('ObservabilityErrorSource', () => {
    it('has exactly 8 sources covering all admin domains', () => {
      const values = Object.values(ObservabilityErrorSource);
      expect(values).toHaveLength(8);
    });
  });

  describe('ObservabilityOperatorActionType', () => {
    it('has exactly 8 action types', () => {
      const values = Object.values(ObservabilityOperatorActionType);
      expect(values).toHaveLength(8);
    });
  });

  describe('ObservabilityTimelineItemKind', () => {
    it('has exactly 5 timeline item kinds', () => {
      const values = Object.values(ObservabilityTimelineItemKind);
      expect(values).toHaveLength(5);
      expect(values).toContain('audit-event');
      expect(values).toContain('alert');
      expect(values).toContain('error');
      expect(values).toContain('probe-snapshot');
      expect(values).toContain('operator-action');
    });
  });
});

// ─── Alert Contract Fixture Tests ───────────────────────────────────────────────

describe('ObservabilityAlertContracts', () => {
  it('creates a valid active alert record', () => {
    const alert = createAlertRecord();
    expect(alert.alertId).toBe('alert-001');
    expect(alert.status).toBe(ObservabilityAlertStatus.Active);
    expect(alert.acknowledgedAt).toBeNull();
    expect(alert.resolvedAt).toBeNull();
  });

  it('creates a valid acknowledged alert record', () => {
    const alert = createAlertRecord({
      status: ObservabilityAlertStatus.Acknowledged,
      acknowledgedAt: NOW,
      acknowledgedBy: ACTOR,
    });
    expect(alert.status).toBe(ObservabilityAlertStatus.Acknowledged);
    expect(alert.acknowledgedBy).toEqual(ACTOR);
  });

  it('creates a valid resolved alert record', () => {
    const alert = createAlertRecord({
      status: ObservabilityAlertStatus.Resolved,
      acknowledgedAt: NOW,
      acknowledgedBy: ACTOR,
      resolvedAt: NOW,
      resolvedBy: ACTOR,
    });
    expect(alert.status).toBe(ObservabilityAlertStatus.Resolved);
    expect(alert.resolvedBy).toEqual(ACTOR);
  });

  it('creates a valid alert with severity escalation', () => {
    const alert = createAlertRecord({
      severity: ObservabilityAlertSeverity.Critical,
      previousSeverity: ObservabilityAlertSeverity.High,
      evaluationCount: 4,
    });
    expect(alert.severity).toBe(ObservabilityAlertSeverity.Critical);
    expect(alert.previousSeverity).toBe(ObservabilityAlertSeverity.High);
    expect(alert.evaluationCount).toBe(4);
  });

  it('creates a valid ingestion payload', () => {
    const payload: IObservabilityAlertIngestionPayload = {
      alerts: [
        {
          category: ObservabilityAlertCategory.ProvisioningFailure,
          severity: ObservabilityAlertSeverity.High,
          title: 'Test alert',
          description: 'Test description',
          affectedEntityType: ObservabilityAffectedEntityType.Job,
          affectedEntityId: 'run-001',
          domain: AdminDomain.ProvisioningRollout,
          runId: 'run-001',
          occurredAt: NOW,
          dedupeKey: 'provisioning-failure:job:run-001',
          ctaLabel: null,
          ctaHref: null,
        },
      ],
      evaluatedAt: NOW,
    };
    expect(payload.alerts).toHaveLength(1);
  });

  it('creates a valid alert query with all filters', () => {
    const query: IObservabilityAlertQuery = {
      status: ObservabilityAlertStatus.Active,
      category: ObservabilityAlertCategory.ProvisioningFailure,
      severity: ObservabilityAlertSeverity.High,
      domain: AdminDomain.ProvisioningRollout,
      from: '2026-04-01T00:00:00.000Z',
      to: NOW,
      cursor: null,
      limit: 50,
    };
    expect(query.limit).toBe(50);
    expect(query.cursor).toBeNull();
  });

  it('creates a valid alert summary', () => {
    const summary: IObservabilityAlertSummary = {
      criticalCount: 1,
      highCount: 3,
      mediumCount: 5,
      lowCount: 2,
      totalActiveCount: 11,
      mostRecentAt: NOW,
    };
    expect(summary.totalActiveCount).toBe(11);
  });
});

// ─── Probe Contract Fixture Tests ───────────────────────────────────────────────

describe('ObservabilityProbeContracts', () => {
  it('creates a valid probe result record', () => {
    const result = createProbeResultRecord();
    expect(result.probeKey).toBe(ObservabilityProbeKind.AzureFunctions);
    expect(result.status).toBe(ObservabilityProbeHealthStatus.Healthy);
    expect(result.anomalies).toHaveLength(0);
  });

  it('creates a valid degraded probe result with anomalies', () => {
    const result = createProbeResultRecord({
      probeKey: ObservabilityProbeKind.SharePointInfrastructure,
      status: ObservabilityProbeHealthStatus.Degraded,
      anomalies: ['Response time > 5000ms', 'Intermittent 503 responses'],
    });
    expect(result.status).toBe(ObservabilityProbeHealthStatus.Degraded);
    expect(result.anomalies).toHaveLength(2);
  });

  it('creates a valid probe snapshot with multiple results', () => {
    const snapshot = createProbeSnapshotRecord({
      results: [
        createProbeResultRecord({ probeKey: ObservabilityProbeKind.AzureFunctions }),
        createProbeResultRecord({
          probeKey: ObservabilityProbeKind.SharePointInfrastructure,
          status: ObservabilityProbeHealthStatus.Error,
        }),
      ],
      overallStatus: ObservabilityProbeHealthStatus.Error,
    });
    expect(snapshot.results).toHaveLength(2);
    expect(snapshot.overallStatus).toBe(ObservabilityProbeHealthStatus.Error);
  });

  it('creates a valid probe submission payload', () => {
    const payload: IObservabilityProbeSubmissionPayload = {
      snapshotId: 'snapshot-002',
      capturedAt: NOW,
      triggerMode: 'manual',
      results: [createProbeResultRecord()],
    };
    expect(payload.triggerMode).toBe('manual');
  });

  it('creates a valid probe snapshot query', () => {
    const query: IObservabilityProbeSnapshotQuery = {
      probeKey: ObservabilityProbeKind.AzureFunctions,
      from: '2026-04-01T00:00:00.000Z',
      to: NOW,
      cursor: null,
      limit: 100,
    };
    expect(query.limit).toBe(100);
  });

  it('creates a valid probe health summary', () => {
    const summary: IObservabilityProbeHealthSummary = {
      healthyCount: 3,
      degradedCount: 1,
      errorCount: 1,
      unknownCount: 0,
      overallStatus: ObservabilityProbeHealthStatus.Error,
      lastSnapshotAt: NOW,
      isStale: false,
    };
    expect(summary.overallStatus).toBe(ObservabilityProbeHealthStatus.Error);
  });
});

// ─── Error Contract Fixture Tests ───────────────────────────────────────────────

describe('ObservabilityErrorContracts', () => {
  it('creates a valid error record', () => {
    const error = createErrorRecord();
    expect(error.errorId).toBe('error-001');
    expect(error.domain).toBe(AdminDomain.ProvisioningRollout);
    expect(error.source).toBe(ObservabilityErrorSource.ProvisioningSaga);
    expect(error.classification).toBe(ObservabilityErrorClassification.Transient);
  });

  it('creates an error record without run correlation', () => {
    const error = createErrorRecord({
      domain: AdminDomain.HealthObservability,
      source: ObservabilityErrorSource.InfrastructureProbe,
      runId: null,
      actionKey: null,
      stepNumber: null,
    });
    expect(error.runId).toBeNull();
    expect(error.actionKey).toBeNull();
  });

  it('creates a valid error ingestion payload', () => {
    const payload: IObservabilityErrorIngestionPayload = {
      errors: [
        {
          domain: AdminDomain.ProvisioningRollout,
          source: ObservabilityErrorSource.ProvisioningSaga,
          classification: ObservabilityErrorClassification.Permissions,
          severity: ObservabilityAlertSeverity.High,
          title: 'Permission denied',
          message: 'Insufficient permissions to create site collection',
          details: { requiredRole: 'Site Collection Admin' },
          runId: 'run-001',
          actionKey: 'provisioning.create-site',
          stepNumber: 2,
          occurredAt: NOW,
        },
      ],
    };
    expect(payload.errors).toHaveLength(1);
  });

  it('creates a valid error query with all filters', () => {
    const query: IObservabilityErrorQuery = {
      domain: AdminDomain.ProvisioningRollout,
      source: ObservabilityErrorSource.ProvisioningSaga,
      classification: ObservabilityErrorClassification.Transient,
      severity: ObservabilityAlertSeverity.Medium,
      runId: 'run-001',
      from: '2026-04-01T00:00:00.000Z',
      to: NOW,
      cursor: null,
      limit: 50,
    };
    expect(query.domain).toBe(AdminDomain.ProvisioningRollout);
  });
});

// ─── Incident Contract Fixture Tests ────────────────────────────────────────────

describe('ObservabilityIncidentContracts', () => {
  it('creates a valid open incident', () => {
    const incident = createIncidentRecord();
    expect(incident.status).toBe(ObservabilityIncidentStatus.Open);
    expect(incident.linkedAlertIds).toHaveLength(2);
    expect(incident.resolvedAt).toBeNull();
  });

  it('creates a valid resolved incident', () => {
    const incident = createIncidentRecord({
      status: ObservabilityIncidentStatus.Resolved,
      resolvedAt: NOW,
      resolvedBy: ACTOR,
      resolutionSummary: 'SharePoint API recovered after transient outage',
    });
    expect(incident.status).toBe(ObservabilityIncidentStatus.Resolved);
    expect(incident.resolutionSummary).toBeTruthy();
  });

  it('creates a valid closed incident', () => {
    const incident = createIncidentRecord({
      status: ObservabilityIncidentStatus.Closed,
      resolvedAt: NOW,
      resolvedBy: ACTOR,
      closedAt: NOW,
      closedBy: ACTOR,
      resolutionSummary: 'Confirmed resolved',
    });
    expect(incident.closedBy).toEqual(ACTOR);
  });

  it('creates a valid incident query', () => {
    const query: IObservabilityIncidentQuery = {
      status: ObservabilityIncidentStatus.Open,
      domain: null,
      severity: null,
      from: null,
      to: null,
      cursor: null,
      limit: 25,
    };
    expect(query.status).toBe(ObservabilityIncidentStatus.Open);
  });
});

// ─── Timeline and Correlation Contract Tests ────────────────────────────────────

describe('ObservabilityTimelineContracts', () => {
  it('creates a valid correlation metadata', () => {
    const corr: IObservabilityCorrelation = {
      domain: AdminDomain.ProvisioningRollout,
      runId: 'run-001',
      actionKey: 'provisioning.create-site',
      incidentId: null,
    };
    expect(corr.domain).toBe(AdminDomain.ProvisioningRollout);
  });

  it('creates a valid operator action record', () => {
    const action: IObservabilityOperatorActionRecord = {
      actionId: 'action-001',
      actionType: ObservabilityOperatorActionType.AlertAcknowledged,
      actor: ACTOR,
      targetEntityId: 'alert-001',
      targetEntityKind: 'alert',
      correlation: {
        domain: AdminDomain.ProvisioningRollout,
        runId: null,
        actionKey: null,
        incidentId: null,
      },
      reason: 'Investigating root cause',
      performedAt: NOW,
    };
    expect(action.actionType).toBe(ObservabilityOperatorActionType.AlertAcknowledged);
  });

  it('creates valid timeline items for each kind', () => {
    const auditItem: IObservabilityTimelineItem = {
      kind: ObservabilityTimelineItemKind.AuditEvent,
      sourceId: 'audit-001',
      timestamp: NOW,
      summary: 'Run started',
      severity: null,
      domain: AdminDomain.ProvisioningRollout,
      runId: 'run-001',
      auditEventType: 'run.started' as IObservabilityTimelineItem['auditEventType'],
      alertCategory: null,
      alertStatus: null,
      probeKey: null,
      probeStatus: null,
      errorClassification: null,
      errorSource: null,
      operatorActionType: null,
    };
    expect(auditItem.kind).toBe(ObservabilityTimelineItemKind.AuditEvent);

    const alertItem: IObservabilityTimelineItem = {
      kind: ObservabilityTimelineItemKind.Alert,
      sourceId: 'alert-001',
      timestamp: NOW,
      summary: 'Provisioning failure detected',
      severity: ObservabilityAlertSeverity.High,
      domain: AdminDomain.ProvisioningRollout,
      runId: 'run-001',
      auditEventType: null,
      alertCategory: ObservabilityAlertCategory.ProvisioningFailure,
      alertStatus: ObservabilityAlertStatus.Active,
      probeKey: null,
      probeStatus: null,
      errorClassification: null,
      errorSource: null,
      operatorActionType: null,
    };
    expect(alertItem.kind).toBe(ObservabilityTimelineItemKind.Alert);
  });

  it('creates a valid timeline query', () => {
    const query: IObservabilityTimelineQuery = {
      runId: 'run-001',
      domain: null,
      kinds: [ObservabilityTimelineItemKind.AuditEvent, ObservabilityTimelineItemKind.Alert],
      from: null,
      to: null,
      cursor: null,
      limit: 100,
    };
    expect(query.kinds).toHaveLength(2);
  });

  it('creates a valid paged response', () => {
    const response: IObservabilityPagedResponse<IObservabilityAlertRecord> = {
      items: [createAlertRecord()],
      nextCursor: 'cursor-abc',
      totalCount: 42,
    };
    expect(response.items).toHaveLength(1);
    expect(response.nextCursor).toBe('cursor-abc');
    expect(response.totalCount).toBe(42);
  });

  it('creates a valid dashboard summary', () => {
    const summary: IObservabilityDashboardSummary = {
      alerts: {
        criticalCount: 0,
        highCount: 2,
        mediumCount: 3,
        lowCount: 1,
        totalActiveCount: 6,
      },
      probes: {
        overallStatus: ObservabilityProbeHealthStatus.Healthy,
        healthyCount: 4,
        degradedCount: 1,
        errorCount: 0,
        unknownCount: 0,
        lastSnapshotAt: NOW,
        isStale: false,
      },
      errors: {
        totalCount: 12,
        criticalCount: 0,
        highCount: 3,
      },
      incidents: {
        openCount: 1,
        investigatingCount: 0,
      },
      computedAt: NOW,
    };
    expect(summary.alerts.totalActiveCount).toBe(6);
    expect(summary.probes.overallStatus).toBe(ObservabilityProbeHealthStatus.Healthy);
  });
});
