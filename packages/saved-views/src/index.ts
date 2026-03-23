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
  IComplexityViewDefault,
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

// Components — composition shells (SF26-T05/T06)
export {
  SavedViewPickerShell, SavedViewChipShell,
  SaveViewDialogShell, ViewCompatibilityBannerShell,
} from './components/index.js';
export type {
  SavedViewPickerShellProps, SavedViewChipShellProps,
  SaveViewDialogShellProps, ViewCompatibilityBannerShellProps,
} from './components/index.js';

// Adapters — module registry + TanStack mapper (SF26-T07)
export { SavedViewModuleRegistry, createTanStackTableMapper } from './adapters/index.js';
export type { ISavedViewModuleRegistration, TanStackTableState } from './adapters/index.js';

// Telemetry (SF26-T07)
// export * from './telemetry/index.js';
