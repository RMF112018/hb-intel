/**
 * Admin Control Plane — Observability Timeline Service
 *
 * Assembles a correlated timeline for a given run by merging audit events,
 * alerts, and error events into a single chronologically sorted view.
 *
 * @module admin-control-plane/services
 */

import type {
  IObservabilityTimelineItem,
  IObservabilityPagedResponse,
  IAdminAuditRecord,
  IObservabilityAlertRecord,
  IObservabilityErrorRecord,
} from '@hbc/models/admin-control-plane';
import {
  AdminDomain,
  ObservabilityTimelineItemKind,
} from '@hbc/models/admin-control-plane';
import type { IAdminAuditService } from './types.js';
import type { IObservabilityAlertStore, IObservabilityErrorStore } from './types.js';

// ─── Timeline Assembly ──────────────────────────────────────────────────────────

/**
 * Assemble a correlated observability timeline for a specific run.
 *
 * Queries audit events, alerts, and errors by runId, then merges and sorts
 * them by timestamp into a unified timeline view.
 */
export async function assembleRunTimeline(
  auditService: IAdminAuditService,
  alertStore: IObservabilityAlertStore,
  errorStore: IObservabilityErrorStore,
  runId: string,
  limit: number = 100,
): Promise<IObservabilityPagedResponse<IObservabilityTimelineItem>> {
  // Query all sources in parallel
  const [auditEvents, alertResponse, errorResponse] = await Promise.all([
    auditService.listByRunId(runId),
    alertStore.listAlerts({
      status: null, category: null, severity: null,
      domain: null, from: null, to: null, cursor: null, limit: 200,
    }).then(r => r.items.filter(a => a.runId === runId)),
    errorStore.listErrors({
      domain: null, source: null, classification: null, severity: null,
      runId, from: null, to: null, cursor: null, limit: 200,
    }).then(r => r.items),
  ]);

  // Convert each source to timeline items
  const items: IObservabilityTimelineItem[] = [];

  for (const audit of auditEvents) {
    items.push(mapAuditToTimelineItem(audit));
  }

  for (const alert of alertResponse) {
    items.push(mapAlertToTimelineItem(alert));
  }

  for (const error of errorResponse) {
    items.push(mapErrorToTimelineItem(error));
  }

  // Sort by timestamp descending (most recent first)
  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Apply limit
  const limited = items.slice(0, limit);

  return {
    items: limited,
    nextCursor: null,
    totalCount: items.length,
  };
}

// ─── Mappers ────────────────────────────────────────────────────────────────────

function mapAuditToTimelineItem(audit: IAdminAuditRecord): IObservabilityTimelineItem {
  return {
    kind: ObservabilityTimelineItemKind.AuditEvent,
    sourceId: audit.auditId,
    timestamp: audit.timestamp,
    summary: audit.summary ?? `${audit.eventType}`,
    severity: null,
    domain: (audit.domain as AdminDomain) ?? AdminDomain.ProvisioningRollout,
    runId: audit.runId ?? null,
    auditEventType: audit.eventType,
    alertCategory: null,
    alertStatus: null,
    probeKey: null,
    probeStatus: null,
    errorClassification: null,
    errorSource: null,
    operatorActionType: null,
  };
}

function mapAlertToTimelineItem(alert: IObservabilityAlertRecord): IObservabilityTimelineItem {
  return {
    kind: ObservabilityTimelineItemKind.Alert,
    sourceId: alert.alertId,
    timestamp: alert.occurredAt,
    summary: alert.title,
    severity: alert.severity,
    domain: alert.domain ?? AdminDomain.ProvisioningRollout,
    runId: alert.runId,
    auditEventType: null,
    alertCategory: alert.category,
    alertStatus: alert.status,
    probeKey: null,
    probeStatus: null,
    errorClassification: null,
    errorSource: null,
    operatorActionType: null,
  };
}

function mapErrorToTimelineItem(error: IObservabilityErrorRecord): IObservabilityTimelineItem {
  return {
    kind: ObservabilityTimelineItemKind.Error,
    sourceId: error.errorId,
    timestamp: error.occurredAt,
    summary: error.title,
    severity: error.severity,
    domain: error.domain,
    runId: error.runId,
    auditEventType: null,
    alertCategory: null,
    alertStatus: null,
    probeKey: null,
    probeStatus: null,
    errorClassification: error.classification,
    errorSource: error.source,
    operatorActionType: null,
  };
}
