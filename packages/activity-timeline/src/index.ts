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

// Types — canonical event and query contracts (P3-D1)
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
