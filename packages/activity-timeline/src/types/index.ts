/**
 * SF28-T02 — Activity Timeline TypeScript Contracts.
 *
 * Normalized event model, actor attribution, object refs, diff entries,
 * context stamps, confidence/sync states, query/filter contracts,
 * emission input, storage records, reason-code enums, and constants.
 *
 * These are timeline-consumer types distinct from the P3-D1 spine-adapter
 * types in @hbc/models. P3-D1 types are re-exported for convenience.
 *
 * Governing: SF28-T02, SF28 Master Plan L-02/L-05/L-06/L-07/L-10
 */

// ─── P3-D1 Spine Types (re-export for convenience) ─────────────────────────

export type {
  ActivityCategory,
  ActivitySignificance,
  IProjectActivityEvent,
  IActivityRuntimeContext,
  IActivityQuery,
  IActivityEventTypeMetadata,
  IActivitySourceAdapter,
  IActivitySourceRegistration,
  IActivityFeedResult,
} from '@hbc/models';

// ─── Event Type Classification ──────────────────────────────────────────────

/**
 * Normalized event type for timeline presentation (L-10 explainability).
 * More granular than P3-D1 ActivityCategory for timeline rendering.
 */
export type ActivityEventType =
  | 'created'
  | 'edited'
  | 'field-changed'
  | 'comment-added'
  | 'acknowledged'
  | 'assigned'
  | 'reassigned'
  | 'handoff-started'
  | 'handoff-completed'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'exported'
  | 'status-changed'
  | 'due-date-changed'
  | 'attachment-added'
  | 'workflow-triggered'
  | 'system-alert';

/** Timeline projection mode (L-06). */
export type ActivityTimelineMode = 'record' | 'related' | 'workspace';

/** Actor classification for attribution (L-05). */
export type ActivityActorType = 'user' | 'system' | 'workflow' | 'service';

/** Sync state of an event relative to the authoritative store (L-09). */
export type ActivitySyncState =
  | 'authoritative'
  | 'queued-local'
  | 'replayed'
  | 'degraded';

/** Confidence level for a timeline event (L-09). */
export type ActivityEventConfidence =
  | 'trusted-authoritative'
  | 'queued-local-only'
  | 'replayed-awaiting-confirmation'
  | 'degraded-source-context';

// ─── Actor Attribution (L-05) ───────────────────────────────────────────────

/**
 * Rich actor attribution supporting delegation and service accounts.
 *
 * Answers: who started it, who executed it, on whose behalf, and
 * what service account logged it.
 */
export interface IActivityActorAttribution {
  /** Primary actor type */
  type: ActivityActorType;
  /** UPN of the user who initiated the action */
  initiatedByUpn: string;
  /** Display name of the initiating user */
  initiatedByName: string;
  /** UPN of the user who executed the action (may differ from initiator) */
  executedByUpn?: string;
  /** Display name of the executor */
  executedByName?: string;
  /** UPN of the user on whose behalf the action was performed */
  onBehalfOfUpn?: string;
  /** Display name of the on-behalf-of user */
  onBehalfOfName?: string;
  /** Service account identity (for automated/workflow events) */
  serviceIdentity?: string;
}

// ─── Object References ──────────────────────────────────────────────────────

/** Structured reference to the primary object an event affects. */
export interface IActivityObjectRef {
  /** Source module key */
  moduleKey: string;
  /** Canonical project ID (when project-scoped) */
  projectId?: string;
  /** Record identifier within the module */
  recordId: string;
  /** Record type within the module */
  recordType?: string;
  /** Version ID if the record is versioned */
  versionId?: string;
  /** Publish ID for publication events */
  publishId?: string;
  /** Handoff ID for handoff events */
  handoffId?: string;
  /** Export ID for export events */
  exportId?: string;
}

/** Structured reference to a related object in cross-record timelines. */
export interface IActivityRelatedRef extends IActivityObjectRef {
  /** Relationship label (e.g., 'parent', 'sibling', 'derived-from') */
  relationshipLabel: string;
}

// ─── Diff Entries ───────────────────────────────────────────────────────────

/** Structured field-level change capture for explainability (L-10). */
export interface IActivityDiffEntry {
  /** Human-readable field label */
  fieldLabel: string;
  /** Previous value (stringified) */
  from: string | null;
  /** New value (stringified) */
  to: string | null;
  /** If the diff is redacted, the reason why */
  suppressionReason?: ActivityDiffSuppressionReason;
}

// ─── Context Stamp ──────────────────────────────────────────────────────────

/** Recommended action when opening an event for context. */
export interface IActivityRecommendedOpenAction {
  /** Label for the action link */
  label: string;
  /** Deep-link href */
  href: string;
}

/** Provenance and correlation context for a timeline event. */
export interface IActivityContextStamp {
  /** Source module key that emitted the event */
  sourceModuleKey: string;
  /** Whether the event was emitted locally or persisted remotely */
  emission: 'local' | 'remote';
  /** Parent event or workflow ID for chain correlation */
  correlationId?: string;
  /** Recommended action for opening context */
  recommendedOpenAction?: IActivityRecommendedOpenAction;
}

// ─── Deduplication State (L-07) ─────────────────────────────────────────────

/** How a deduplicated event was handled in the timeline projection. */
export interface IActivityDedupeState {
  /** Whether raw event evidence was retained (L-07: never silently discard) */
  rawEvidenceRetained: boolean;
  /** Projection action taken */
  projectionAction: 'suppressed' | 'merged';
  /** Reason for the dedup action */
  reason: ActivityDedupeReason;
}

// ─── Core Normalized Event (L-02 append-only truth, L-10 explainability) ────

/**
 * Normalized activity event for timeline consumption.
 *
 * Richer than P3-D1's `IProjectActivityEvent` — includes actor
 * attribution, structured diffs, context stamps, confidence states,
 * and deduplication tracking.
 */
export interface IActivityEvent {
  /** Unique event identifier (UUID v4) */
  eventId: string;
  /** Normalized event type */
  type: ActivityEventType;
  /** Rich actor attribution */
  actor: IActivityActorAttribution;
  /** Primary object reference */
  primaryRef: IActivityObjectRef;
  /** Related object references for cross-record timelines */
  relatedRefs: IActivityRelatedRef[];
  /** ISO 8601 timestamp when the event occurred */
  timestampIso: string;
  /** Human-readable summary (max 280 chars) */
  summary: string;
  /** Optional extended detail text */
  details: string | null;
  /** Structured field-level changes */
  diffEntries: IActivityDiffEntry[];
  /** Provenance and correlation context */
  context: IActivityContextStamp;
  /** Confidence level of this event */
  confidence: ActivityEventConfidence;
  /** Sync state relative to authoritative store */
  syncState: ActivitySyncState;
  /** Recommended action for opening context */
  recommendedOpenAction: IActivityRecommendedOpenAction | null;
  /** Deduplication state (null if not deduplicated) */
  dedupe: IActivityDedupeState | null;
}

// ─── Query & Filter Contracts ───────────────────────────────────────────────

/** Extended timeline query contract (superset of P3-D1 IActivityQuery). */
export interface IActivityTimelineQuery {
  /** Canonical project ID (mandatory) */
  projectId: string;
  /** Timeline projection mode */
  mode: ActivityTimelineMode;
  /** Filter by event types */
  eventTypes?: ActivityEventType[];
  /** Filter by actor UPNs */
  actorUpns?: string[];
  /** Filter by source module keys */
  sourceModules?: string[];
  /** Filter by minimum significance */
  significance?: ('routine' | 'notable' | 'critical')[];
  /** Only events after this ISO 8601 timestamp */
  since?: string;
  /** Only events before this ISO 8601 timestamp */
  until?: string;
  /** Related record IDs for cross-record timeline */
  relatedRecordIds?: string[];
  /** Exclude system-generated events */
  excludeSystemEvents?: boolean;
  /** Page size (default: ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT) */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

/** Client-side filter state for timeline UI controls. */
export interface IActivityFilterState {
  selectedEventTypes: ActivityEventType[];
  selectedActorUpns: string[];
  timeframeStart: string | null;
  timeframeEnd: string | null;
  relatedRecordIds: string[];
  moduleScopes: string[];
  excludeSystemEvents: boolean;
}

// ─── Result Types ───────────────────────────────────────────────────────────

/** Paginated timeline result. */
export interface IActivityTimelinePage {
  /** Events in this page, sorted by timestamp descending */
  events: IActivityEvent[];
  /** Grouping strategy applied */
  grouping: string;
  /** Page size */
  pageSize: number;
  /** Whether more events exist */
  hasMore: boolean;
  /** Cursor for next page */
  cursor: string | null;
}

/** A group of events under a shared label (e.g., "Today", "Last Week"). */
export interface IActivityEventGroup {
  /** Group label */
  groupLabel: string;
  /** Events in this group */
  events: IActivityEvent[];
}

// ─── Emission Input ─────────────────────────────────────────────────────────

/** Input for modules emitting activity events via the shared emitter. */
export interface IActivityEmissionInput {
  /** Event type */
  type: ActivityEventType;
  /** Human-readable summary */
  summary: string;
  /** Optional extended details */
  details?: string;
  /** Primary object reference */
  primaryRef: IActivityObjectRef;
  /** Related refs (optional) */
  relatedRefs?: IActivityRelatedRef[];
  /** Actor attribution (partial — emitter normalizes) */
  actor: Partial<IActivityActorAttribution> & { initiatedByUpn: string; initiatedByName: string };
  /** Structured diff entries (optional) */
  diffEntries?: IActivityDiffEntry[];
  /** Correlation ID for workflow chains */
  correlationId?: string;
}

// ─── Storage Record (L-02 append-only) ──────────────────────────────────────

/** Append-only storage record wrapping the normalized event. */
export interface IActivityStorageRecord {
  /** The normalized event */
  event: IActivityEvent;
  /** ISO 8601 timestamp when stored */
  storedAt: string;
  /** Storage system identity */
  storageSystem: string;
  /** Sync state at time of storage */
  syncStateAtStorage: ActivitySyncState;
}

// ─── Source Health State ────────────────────────────────────────────────────

/** Health state of an activity event source adapter. */
export interface IActivitySourceHealthState {
  /** Source adapter identity */
  sourceIdentity: string;
  /** ISO 8601 timestamp of last successful load */
  lastSuccessfulLoad: string | null;
  /** Number of consecutive failures */
  consecutiveFailures: number;
  /** Reason for degradation (null if healthy) */
  degradationReason: string | null;
  /** Current confidence level */
  confidence: ActivityEventConfidence;
}

// ─── Reason-Code Enums ──────────────────────────────────────────────────────

/** Why an event was emitted (L-05 actor explainability). */
export type ActivityEventSourceReason =
  | 'user-initiated'
  | 'system-automated'
  | 'workflow-triggered'
  | 'service-account';

/** Why confidence was downgraded (L-09 sync truth). */
export type ActivityConfidenceDowngradeReason =
  | 'source-unavailable'
  | 'timestamp-inference'
  | 'partial-payload'
  | 'replay-context-missing';

/** Why a diff entry was suppressed. */
export type ActivityDiffSuppressionReason =
  | 'sensitive-field'
  | 'too-large'
  | 'binary-content';

/** Why an event was deduplicated (L-07). */
export type ActivityDedupeReason =
  | 'duplicate-within-threshold'
  | 'identical-field-value'
  | 'merge-parent-child';

/** Why an event was excluded from query results. */
export type ActivityQueryExclusionReason =
  | 'filtered-event-type'
  | 'filtered-actor'
  | 'outside-timeframe'
  | 'source-degraded';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Default page size for timeline queries. */
export const ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT = 25;

/** Default grouping strategy for timeline rendering. */
export const ACTIVITY_TIMELINE_GROUPING_DEFAULT = 'relative-date';

/** All valid sync states. */
export const ACTIVITY_TIMELINE_SYNC_STATES: readonly ActivitySyncState[] = [
  'authoritative', 'queued-local', 'replayed', 'degraded',
] as const;

/** All valid confidence states. */
export const ACTIVITY_TIMELINE_CONFIDENCE_STATES: readonly ActivityEventConfidence[] = [
  'trusted-authoritative', 'queued-local-only',
  'replayed-awaiting-confirmation', 'degraded-source-context',
] as const;
