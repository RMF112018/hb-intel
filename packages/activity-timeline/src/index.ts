/**
 * @hbc/activity-timeline
 *
 * Cross-module activity timeline primitive for HB Intel.
 * Provides normalized event contracts, emitter helpers, append-only
 * storage adapters, query orchestration, and timeline composition.
 *
 * SF28 Master Plan — L-01 ownership, L-02 append-only truth,
 * L-08 UI-kit boundary, L-10 explainability.
 *
 * @see docs/architecture/plans/shared-features/SF28-Activity-Timeline.md
 */

// Types — P3-D1 spine contracts (re-export)
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
} from './types/index.js';

// Types — SF28-T02 timeline-specific contracts
export type {
  ActivityEventType,
  ActivityTimelineMode,
  ActivityActorType,
  ActivitySyncState,
  ActivityEventConfidence,
  IActivityActorAttribution,
  IActivityObjectRef,
  IActivityRelatedRef,
  IActivityDiffEntry,
  IActivityRecommendedOpenAction,
  IActivityContextStamp,
  IActivityDedupeState,
  IActivityEvent,
  IActivityTimelineQuery,
  IActivityFilterState,
  IActivityTimelinePage,
  IActivityEventGroup,
  IActivityEmissionInput,
  IActivityStorageRecord,
  IActivitySourceHealthState,
  ActivityEventSourceReason,
  ActivityConfidenceDowngradeReason,
  ActivityDiffSuppressionReason,
  ActivityDedupeReason,
  ActivityQueryExclusionReason,
} from './types/index.js';

// Constants — SF28-T02 locked values
export {
  ACTIVITY_TIMELINE_PAGE_SIZE_DEFAULT,
  ACTIVITY_TIMELINE_GROUPING_DEFAULT,
  ACTIVITY_TIMELINE_SYNC_STATES,
  ACTIVITY_TIMELINE_CONFIDENCE_STATES,
} from './types/index.js';

// Model — normalization, filtering, grouping (SF28-T03)
// export * from './model/index.js';

// Formatters — diff summarization, readable formatting (SF28-T05/T06)
// export * from './formatters/index.js';

// Storage — append-only persistence adapters (SF28-T03)
// export * from './storage/index.js';

// Adapters — emitter helpers, module adapter seams (SF28-T07)
// export * from './adapters/index.js';

// Hooks — query hooks, filter state (SF28-T04)
// export * from './hooks/index.js';

// Telemetry — KPI constants and engagement tracking (SF28-T09)
// export * from './telemetry/index.js';
