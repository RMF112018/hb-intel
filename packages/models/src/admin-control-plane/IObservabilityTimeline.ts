/**
 * Admin Control Plane — Observability Timeline and Correlation Contracts
 *
 * Contracts for correlated observability timelines, operator actions,
 * and cross-entity query and view models used by SPFx pages.
 *
 * @module admin-control-plane
 */

import type { AdminDomain } from './AdminEnums.js';
import type { IAdminActorContext } from './IAdminRun.js';
import type { AdminAuditEventType } from './IAdminAudit.js';
import type {
  ObservabilityTimelineItemKind,
  ObservabilityOperatorActionType,
  ObservabilityAlertSeverity,
  ObservabilityAlertStatus,
  ObservabilityAlertCategory,
  ObservabilityProbeKind,
  ObservabilityProbeHealthStatus,
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
} from './ObservabilityEnums.js';

// ─── Correlation Metadata ───────────────────────────────────────────────────────

/**
 * Standard correlation metadata attached to observability records.
 *
 * This contract defines the minimum correlation keys that enable
 * cross-entity timeline assembly and contextual drilldown.
 */
export interface IObservabilityCorrelation {
  /** Admin domain this record belongs to */
  readonly domain: AdminDomain;

  /** Correlated run ID, null if not tied to a specific run */
  readonly runId: string | null;

  /** Specific action key, null if not tied to a specific action */
  readonly actionKey: string | null;

  /** Correlated incident ID, null if not linked to an incident */
  readonly incidentId: string | null;
}

// ─── Operator Action Record ─────────────────────────────────────────────────────

/**
 * Durable record of an operator action against observability state.
 *
 * Operator actions are append-only audit records. They capture who did what,
 * when, against which entity, and with what reason.
 */
export interface IObservabilityOperatorActionRecord {
  /** Unique action identifier (UUID v4) */
  readonly actionId: string;

  /** Type of operator action */
  readonly actionType: ObservabilityOperatorActionType;

  /** Actor who performed the action */
  readonly actor: IAdminActorContext;

  /** Target entity identifier (alert ID, incident ID, probe key, etc.) */
  readonly targetEntityId: string;

  /** Target entity kind description (e.g., 'alert', 'incident', 'probe') */
  readonly targetEntityKind: string;

  /** Correlation context */
  readonly correlation: IObservabilityCorrelation;

  /** Operator-provided reason or note, null if not supplied */
  readonly reason: string | null;

  /** ISO 8601 timestamp when the action was performed */
  readonly performedAt: string;
}

// ─── Timeline Item ──────────────────────────────────────────────────────────────

/**
 * A single item in a correlated observability timeline.
 *
 * Timeline items are a union of different event kinds, discriminated by
 * the `kind` field. Each item carries enough context for rendering in
 * a timeline view without requiring additional API calls.
 */
export interface IObservabilityTimelineItem {
  /** Discriminant for the timeline item kind */
  readonly kind: ObservabilityTimelineItemKind;

  /** Unique identifier of the source record */
  readonly sourceId: string;

  /** ISO 8601 timestamp for ordering */
  readonly timestamp: string;

  /** Human-readable summary for timeline rendering */
  readonly summary: string;

  /** Severity level, null if not applicable to this item kind */
  readonly severity: ObservabilityAlertSeverity | null;

  /** Admin domain context */
  readonly domain: AdminDomain;

  /** Correlated run ID, null if not tied to a run */
  readonly runId: string | null;

  /** Audit event type (only for kind=AuditEvent), null otherwise */
  readonly auditEventType: AdminAuditEventType | null;

  /** Alert category (only for kind=Alert), null otherwise */
  readonly alertCategory: ObservabilityAlertCategory | null;

  /** Alert status (only for kind=Alert), null otherwise */
  readonly alertStatus: ObservabilityAlertStatus | null;

  /** Probe key (only for kind=ProbeSnapshot), null otherwise */
  readonly probeKey: ObservabilityProbeKind | null;

  /** Probe health status (only for kind=ProbeSnapshot), null otherwise */
  readonly probeStatus: ObservabilityProbeHealthStatus | null;

  /** Error classification (only for kind=Error), null otherwise */
  readonly errorClassification: ObservabilityErrorClassification | null;

  /** Error source (only for kind=Error), null otherwise */
  readonly errorSource: ObservabilityErrorSource | null;

  /** Operator action type (only for kind=OperatorAction), null otherwise */
  readonly operatorActionType: ObservabilityOperatorActionType | null;
}

// ─── Timeline Query ─────────────────────────────────────────────────────────────

/**
 * Query filter for assembling a correlated observability timeline.
 */
export interface IObservabilityTimelineQuery {
  /** Correlated run ID — assembles the timeline for a specific run */
  readonly runId: string | null;

  /** Filter by domain, null for all domains */
  readonly domain: AdminDomain | null;

  /** Filter by item kinds, null for all kinds */
  readonly kinds: readonly ObservabilityTimelineItemKind[] | null;

  /** ISO 8601 start of date range, null for no lower bound */
  readonly from: string | null;

  /** ISO 8601 end of date range, null for no upper bound */
  readonly to: string | null;

  /** Pagination cursor, null for first page */
  readonly cursor: string | null;

  /** Maximum number of items to return (default 50, max 200) */
  readonly limit: number;
}

// ─── Paginated Response Wrapper ─────────────────────────────────────────────────

/**
 * Cursor-based paginated response wrapper for observability queries.
 *
 * All observability list endpoints return this shape.
 */
export interface IObservabilityPagedResponse<T> {
  /** Result items for this page */
  readonly items: readonly T[];

  /** Cursor for the next page, null if this is the last page */
  readonly nextCursor: string | null;

  /** Total count of matching records (may be approximate for large sets) */
  readonly totalCount: number;
}

// ─── Dashboard Summary View Model ───────────────────────────────────────────────

/**
 * Aggregated observability dashboard summary for the operator landing page
 * and operational dashboard cards.
 *
 * This view model is assembled by the backend from multiple stores and
 * returned as a single API response to minimize round-trips.
 */
export interface IObservabilityDashboardSummary {
  /** Alert summary counts */
  readonly alerts: {
    readonly criticalCount: number;
    readonly highCount: number;
    readonly mediumCount: number;
    readonly lowCount: number;
    readonly totalActiveCount: number;
  };

  /** Probe health summary */
  readonly probes: {
    readonly overallStatus: ObservabilityProbeHealthStatus;
    readonly healthyCount: number;
    readonly degradedCount: number;
    readonly errorCount: number;
    readonly unknownCount: number;
    readonly lastSnapshotAt: string | null;
    readonly isStale: boolean;
  };

  /** Error event counts for recent window (last 24 hours) */
  readonly errors: {
    readonly totalCount: number;
    readonly criticalCount: number;
    readonly highCount: number;
  };

  /** Incident summary */
  readonly incidents: {
    readonly openCount: number;
    readonly investigatingCount: number;
  };

  /** ISO 8601 timestamp when this summary was computed */
  readonly computedAt: string;
}
