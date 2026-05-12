/**
 * My Work — typed navigation registry barrel.
 *
 * Re-exports navigation metadata and helpers for the SPFx My Dashboard
 * shell. This barrel is metadata-only and does not overlap with the
 * personal work-item aggregation primitives owned by `@hbc/my-work-feed`.
 *
 * @module myWork
 */

export {
  MY_WORK_PRIMARY_SURFACE_IDS,
  MY_WORK_MODULE_IDS,
  MY_WORK_MODULE_STATES,
  MY_WORK_MODULE_STATE_COPY,
  MY_WORK_PRIMARY_NAVIGATION_SURFACES,
  MY_WORK_NAVIGATION_MODULES,
  getMyWorkPrimaryNavigationSurface,
  getMyWorkModule,
  getMyWorkModulesForPrimarySurface,
  isSelectableMyWorkModule,
  normalizeMyWorkPrimarySurfaceId,
  normalizeMyWorkModuleId,
  type MyWorkPrimarySurfaceId,
  type MyWorkModuleId,
  type MyWorkModuleState,
  type MyWorkModuleStateCopy,
  type MyWorkModuleSourceSystem,
  type MyWorkNavigationModule,
  type MyWorkPrimaryNavigationSurface,
} from './MyWorkNavigation.js';
