/**
 * Phase 3 Stage 3.1 — Activity spine types and adapter interface.
 *
 * Defines the canonical project activity event, adapter interface,
 * and registration contract for the Activity spine. Module adapters
 * implement IActivitySourceAdapter to publish events into the spine.
 *
 * Governing: P3-A3 §4 (spine publication contracts), P3-D1 (Project Activity Contract)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Event classification unions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Activity event category per P3-D1 §3.
 */
export type ActivityCategory =
  | 'record-change'
  | 'status-change'
  | 'milestone'
  | 'approval'
  | 'handoff'
  | 'alert'
  | 'system';

/**
 * Activity event significance tier per P3-D1 §3.
 *
 * routine  — Standard operational activity (bulk of events)
 * notable  — Important milestone or decision point
 * critical — Requires immediate attention or escalation
 */
export type ActivitySignificance = 'routine' | 'notable' | 'critical';

// ─────────────────────────────────────────────────────────────────────────────
// Canonical event type (P3-D1 §2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single project activity event published by a module adapter.
 *
 * Events are immutable after publication. The Activity spine
 * aggregates events from all module adapters into a unified timeline.
 */
export interface IProjectActivityEvent {
  /** Unique event identifier (UUID v4) */
  eventId: string;
  /** Canonical project ID from P3-A1 registry */
  projectId: string;
  /** Namespaced event type (e.g., 'financial.forecast-updated', 'schedule.milestone-completed') */
  eventType: string;
  /** Event classification category */
  category: ActivityCategory;
  /** Source module key (e.g., 'financial', 'schedule', 'constraints') */
  sourceModule: string;
  /** Source record type within the module */
  sourceRecordType: string;
  /** Source record identifier */
  sourceRecordId: string;
  /** Human-readable event summary (max 280 characters) */
  summary: string;
  /** Optional structured detail payload (module-specific schema) */
  detail: Record<string, unknown> | null;
  /** UPN of the user who caused the event */
  changedByUpn: string;
  /** Display name of the user who caused the event */
  changedByName: string;
  /** ISO 8601 timestamp when the event occurred */
  occurredAt: string;
  /** ISO 8601 timestamp when the event was published to the spine */
  publishedAt: string;
  /** Event significance tier for filtering and notification */
  significance: ActivitySignificance;
  /** Deep-link URL to the source record (null if not navigable) */
  href: string | null;
  /** IDs of related activity events (for event correlation) */
  relatedEventIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter runtime context and query
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runtime context provided to activity source adapters.
 */
export interface IActivityRuntimeContext {
  /** Canonical project ID */
  projectId: string;
  /** Authenticated user's UPN */
  userUpn: string;
}

/**
 * Query parameters for loading activity events.
 */
export interface IActivityQuery {
  /** Canonical project ID (mandatory) */
  projectId: string;
  /** Filter by event categories */
  categories?: ActivityCategory[];
  /** Filter by source module keys */
  sourceModules?: string[];
  /** Filter by minimum significance level */
  significance?: ActivitySignificance[];
  /** ISO 8601 — only events after this timestamp */
  since?: string;
  /** Maximum number of events to return */
  limit?: number;
}

/**
 * Metadata for a specific activity event type.
 */
export interface IActivityEventTypeMetadata {
  /** Namespaced event type identifier */
  eventType: string;
  /** Human-readable label for this event type */
  label: string;
  /** Default classification category */
  category: ActivityCategory;
  /** Default significance tier */
  defaultSignificance: ActivitySignificance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Source adapter interface (P3-A3 §4, P3-D1 §4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interface that module adapters implement to publish activity events.
 *
 * Follows the same pattern as IMyWorkSourceAdapter (Work Queue spine)
 * for consistency across all four shared spines.
 */
export interface IActivitySourceAdapter {
  /** Module key identifying this adapter's source module */
  moduleKey: string;
  /** Check whether this adapter is enabled in the current runtime context */
  isEnabled(context: IActivityRuntimeContext): boolean;
  /** Load recent activity events matching the query */
  loadRecentActivity(query: IActivityQuery): Promise<IProjectActivityEvent[]>;
  /** Get metadata for a specific event type (null if unknown) */
  getEventTypeMetadata(eventType: string): IActivityEventTypeMetadata | null;
}

/**
 * Registration entry for the Activity spine registry.
 *
 * Module adapters register with the spine registry at app initialization.
 */
export interface IActivitySourceRegistration {
  /** Module key (must match adapter.moduleKey) */
  moduleKey: string;
  /** Event types this adapter can produce */
  supportedEventTypes: string[];
  /** The adapter implementation */
  adapter: IActivitySourceAdapter;
  /** Whether this adapter is enabled by default */
  enabledByDefault: boolean;
  /** Default significance for each event type */
  significanceDefaults: Record<string, ActivitySignificance>;
}
