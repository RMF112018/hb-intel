/**
 * Admin Control Plane — Observability Incident Contracts
 *
 * Persistence and API contracts for observability incidents. An incident
 * groups related alerts, error events, and timeline items into a single
 * correlated operational situation for operator triage and resolution.
 *
 * @module admin-control-plane
 */

import type { AdminDomain } from './AdminEnums.js';
import type { IAdminActorContext } from './IAdminRun.js';
import type {
  ObservabilityAlertSeverity,
  ObservabilityIncidentStatus,
} from './ObservabilityEnums.js';

// ─── Incident Record ────────────────────────────────────────────────────────────

/**
 * Durable incident record persisted by the backend observability store.
 *
 * Incidents are mutable — their status, linked entities, and resolution
 * context change over time as operators investigate and resolve.
 */
export interface IObservabilityIncidentRecord {
  /** Unique incident identifier (UUID v4) */
  readonly incidentId: string;

  /** Human-readable incident title */
  readonly title: string;

  /** Human-readable incident description */
  readonly description: string;

  /** Current lifecycle status */
  readonly status: ObservabilityIncidentStatus;

  /** Highest severity among linked alerts */
  readonly severity: ObservabilityAlertSeverity;

  /** Primary admin domain, null if cross-domain */
  readonly domain: AdminDomain | null;

  /** Alert IDs linked to this incident */
  readonly linkedAlertIds: readonly string[];

  /** Error event IDs linked to this incident */
  readonly linkedErrorIds: readonly string[];

  /** Run IDs linked to this incident */
  readonly linkedRunIds: readonly string[];

  /** ISO 8601 timestamp when the incident was opened */
  readonly openedAt: string;

  /** Actor who opened the incident */
  readonly openedBy: IAdminActorContext;

  /** ISO 8601 timestamp when the incident was resolved, null if not yet resolved */
  readonly resolvedAt: string | null;

  /** Actor who resolved the incident, null if not yet resolved */
  readonly resolvedBy: IAdminActorContext | null;

  /** ISO 8601 timestamp when the incident was closed, null if not yet closed */
  readonly closedAt: string | null;

  /** Actor who closed the incident, null if not yet closed */
  readonly closedBy: IAdminActorContext | null;

  /** Operator-provided resolution summary, null if not yet resolved */
  readonly resolutionSummary: string | null;

  /** ISO 8601 timestamp of the most recent update to this record */
  readonly lastUpdatedAt: string;
}

// ─── Incident Query ─────────────────────────────────────────────────────────────

/**
 * Query filter for listing incidents from the backend.
 */
export interface IObservabilityIncidentQuery {
  /** Filter by status, null for all statuses */
  readonly status: ObservabilityIncidentStatus | null;

  /** Filter by domain, null for all domains */
  readonly domain: AdminDomain | null;

  /** Filter by severity, null for all severities */
  readonly severity: ObservabilityAlertSeverity | null;

  /** ISO 8601 start of date range, null for no lower bound */
  readonly from: string | null;

  /** ISO 8601 end of date range, null for no upper bound */
  readonly to: string | null;

  /** Pagination cursor, null for first page */
  readonly cursor: string | null;

  /** Maximum number of records to return (default 50, max 200) */
  readonly limit: number;
}
