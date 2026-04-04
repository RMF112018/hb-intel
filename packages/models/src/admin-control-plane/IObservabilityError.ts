/**
 * Admin Control Plane — Observability Error Event Contracts
 *
 * Persistence and API contracts for error events surfaced on the error log.
 * Error events are append-only records capturing discrete errors from any
 * admin domain, queryable through the backend and rendered on the SPFx
 * error log page.
 *
 * @module admin-control-plane
 */

import type { AdminDomain } from './AdminEnums.js';
import type {
  ObservabilityErrorClassification,
  ObservabilityErrorSource,
  ObservabilityAlertSeverity,
} from './ObservabilityEnums.js';

// ─── Error Event Record ─────────────────────────────────────────────────────────

/**
 * Durable error event record persisted by the backend observability store.
 *
 * Error events are append-only — they are never updated after creation.
 * They may optionally be linked to incidents for correlated triage.
 */
export interface IObservabilityErrorRecord {
  /** Unique error event identifier (UUID v4) */
  readonly errorId: string;

  /** Admin domain where the error occurred */
  readonly domain: AdminDomain;

  /** Source system or layer that produced this error */
  readonly source: ObservabilityErrorSource;

  /** Error classification (aligns with provisioning failure taxonomy where applicable) */
  readonly classification: ObservabilityErrorClassification;

  /** Severity of the error's operational impact */
  readonly severity: ObservabilityAlertSeverity;

  /** Human-readable error title */
  readonly title: string;

  /** Human-readable error message or description */
  readonly message: string;

  /** Structured error details (stack trace excerpt, error code, HTTP status, etc.) */
  readonly details: Readonly<Record<string, string | number | boolean>> | null;

  /** Correlated run ID, null if error is not tied to a specific run */
  readonly runId: string | null;

  /** Correlated action key, null if error is not tied to a specific action */
  readonly actionKey: string | null;

  /** Correlated step number within a run, null if not applicable */
  readonly stepNumber: number | null;

  /** Incident ID if this error has been linked to an incident, null otherwise */
  readonly incidentId: string | null;

  /** ISO 8601 timestamp when the error occurred */
  readonly occurredAt: string;

  /** ISO 8601 timestamp when the error was ingested into durable storage */
  readonly ingestedAt: string;
}

// ─── Error Event Ingestion ──────────────────────────────────────────────────────

/**
 * Payload submitted to the backend error event ingestion API.
 */
export interface IObservabilityErrorIngestionPayload {
  /** Error events to ingest */
  readonly errors: readonly IObservabilityErrorIngestionItem[];
}

/**
 * A single error event item within an ingestion payload.
 */
export interface IObservabilityErrorIngestionItem {
  /** Admin domain */
  readonly domain: AdminDomain;

  /** Source system */
  readonly source: ObservabilityErrorSource;

  /** Error classification */
  readonly classification: ObservabilityErrorClassification;

  /** Severity */
  readonly severity: ObservabilityAlertSeverity;

  /** Error title */
  readonly title: string;

  /** Error message */
  readonly message: string;

  /** Structured error details, null if none */
  readonly details: Readonly<Record<string, string | number | boolean>> | null;

  /** Correlated run ID, null if not tied to a run */
  readonly runId: string | null;

  /** Correlated action key, null if not tied to an action */
  readonly actionKey: string | null;

  /** Correlated step number, null if not applicable */
  readonly stepNumber: number | null;

  /** ISO 8601 timestamp when the error occurred */
  readonly occurredAt: string;
}

// ─── Error Event Query ──────────────────────────────────────────────────────────

/**
 * Query filter for listing error events from the backend.
 */
export interface IObservabilityErrorQuery {
  /** Filter by domain, null for all domains */
  readonly domain: AdminDomain | null;

  /** Filter by source, null for all sources */
  readonly source: ObservabilityErrorSource | null;

  /** Filter by classification, null for all classifications */
  readonly classification: ObservabilityErrorClassification | null;

  /** Filter by severity, null for all severities */
  readonly severity: ObservabilityAlertSeverity | null;

  /** Filter by run ID, null for all runs */
  readonly runId: string | null;

  /** ISO 8601 start of date range, null for no lower bound */
  readonly from: string | null;

  /** ISO 8601 end of date range, null for no upper bound */
  readonly to: string | null;

  /** Pagination cursor, null for first page */
  readonly cursor: string | null;

  /** Maximum number of records to return (default 50, max 200) */
  readonly limit: number;
}
