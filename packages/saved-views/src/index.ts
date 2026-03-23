/**
 * @hbc/saved-views
 *
 * Shared workspace-state persistence runtime for HB Intel.
 * View lifecycle, scope model, schema compatibility, reconciliation,
 * and module adapter seams.
 *
 * SF26 Master Plan — L-01 ownership, L-04 offline resilience,
 * L-06 deep-linking/provenance.
 *
 * @see docs/architecture/plans/shared-features/SF26-Saved-Views.md
 */

// Types — SF26-T01 contract stubs
export type {
  SavedViewScope,
  SavedViewAction,
  ISavedViewDefinition,
  IFilterClause,
  ISortDefinition,
  IGroupDefinition,
  IViewPresentationState,
  ISavedViewStateMapper,
  ISchemaCompatibilityResult,
  IViewReconciliationResult,
  IViewPermissionResult,
  ISavedViewContext,
  SavedViewTelemetryEvent,
} from './types/index.js';

// Constants
export {
  SAVED_VIEW_SCOPES,
  SAVED_VIEW_ACTIONS,
} from './types/index.js';

// Model (SF26-T03)
// export * from './model/index.js';

// Storage (SF26-T03)
// export * from './storage/index.js';

// Hooks (SF26-T04)
// export * from './hooks/index.js';

// Adapters (SF26-T07)
// export * from './adapters/index.js';

// Telemetry (SF26-T07)
// export * from './telemetry/index.js';
