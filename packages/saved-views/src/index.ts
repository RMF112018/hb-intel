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

// Types — SF26-T02 canonical contracts
export type {
  SavedViewScope,
  IFilterClause,
  ISortDefinition,
  IGroupDefinition,
  IViewPresentationState,
  ISavedViewDefinition,
  ISavedViewSchemaDescriptor,
  ISavedViewStateMapper,
  SavedViewCompatibilityStatus,
  ISavedViewCompatibilityResult,
  ISavedViewScopePermissions,
  ISavedViewOwnershipCheck,
  ISavedViewContext,
  SavedViewAction,
  SavedViewTelemetryEvent,
} from './types/index.js';

// Constants
export {
  SAVED_VIEW_SCOPES,
  SAVED_VIEW_COMPATIBILITY_STATUSES,
} from './types/index.js';

// Model — lifecycle + reconciliation (SF26-T03)
export { createSavedView, VIEW_LIFECYCLE_STATES, reconcile } from './model/index.js';
export type { ViewLifecycleState, ICreateSavedViewInput } from './model/index.js';

// Storage — adapter interface + in-memory (SF26-T03)
export type { ISavedViewsStorageAdapter } from './storage/index.js';
export { InMemorySavedViewsStorageAdapter } from './storage/index.js';

// Hooks (SF26-T04)
export {
  savedViewsKeys,
  useSavedViews,
  useViewCompatibility,
  useWorkspaceStateMapper,
} from './hooks/index.js';
export type {
  UseSavedViewsOptions,
  UseSavedViewsResult,
  UseViewCompatibilityOptions,
  UseViewCompatibilityResult,
  UseWorkspaceStateMapperOptions,
  UseWorkspaceStateMapperResult,
} from './hooks/index.js';

// Adapters (SF26-T07)
// export * from './adapters/index.js';

// Telemetry (SF26-T07)
// export * from './telemetry/index.js';
