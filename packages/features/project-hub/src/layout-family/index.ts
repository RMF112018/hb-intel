/**
 * Project Hub Layout Family — public API.
 *
 * Provides layout family type system, definitions, and resolution logic
 * for the three governed families: project-operating, executive, field-tablet.
 */

// ── Types ───────────────────────────────────────────────────────────

export type {
  ProjectHubLayoutFamily,
  ProjectHubRegionId,
  ProjectHubRegionSlot,
  ProjectHubSlotMap,
  ProjectHubRegionRole,
  ProjectHubRegionDefinition,
  ProjectHubLayoutFamilyDefinition,
  ProjectHubDevicePosture,
  ProjectHubLayoutRole,
  ProjectHubLayoutResolutionInput,
  ProjectHubLayoutResolutionResult,
  ProjectHubModulePostureSummary,
  ProjectHubWorkQueueSummary,
  ProjectHubWorkQueueItem,
  ProjectHubNextMoveSummary,
  ProjectHubNextMoveItem,
  ProjectHubRelatedItemsSummary,
  ProjectHubRelatedItem,
  ProjectHubActivitySummary,
  ProjectHubActivityEntry,
} from './types.js';

// ── Definitions ─────────────────────────────────────────────────────

export {
  PROJECT_OPERATING_DEFINITION,
  EXECUTIVE_DEFINITION,
  FIELD_TABLET_DEFINITION,
  PROJECT_HUB_LAYOUT_FAMILY_DEFINITIONS,
  PROJECT_HUB_LAYOUT_FAMILIES,
} from './definitions.js';

// ── Resolution ──────────────────────────────────────────────────────

export {
  resolveProjectHubLayoutFamily,
  isLayoutFamilyAllowedForRole,
  getAllowedLayoutFamiliesForRole,
} from './resolver.js';

// ── Components ──────────────────────────────────────────────────────

export {
  ProjectOperatingSurface,
  CommandRail,
  ContextRail,
  CanvasCenter,
  ActivityStrip,
  ExecutiveCockpitSurface,
  WatchlistPanel,
  RiskExposureCanvas,
  InterventionRail,
} from './components/index.js';
export type {
  ProjectOperatingSurfaceProps,
  CommandRailProps,
  ContextRailProps,
  CanvasCenterProps,
  ActivityStripProps,
  ExecutiveCockpitSurfaceProps,
  WatchlistPanelProps,
  RiskExposureCanvasProps,
  InterventionRailProps,
} from './components/index.js';

// ── Hooks ───────────────────────────────────────────────────────────

export {
  useSelectedModule,
  useModulePostureSummaries,
  useWorkQueueSummary,
  useNextMoveSummary,
  useActivitySummary,
  useWatchlistSummary,
  WATCHLIST_SIGNAL_TYPE_LABELS,
  useRiskExposureSummary,
  useInterventionQueue,
} from './hooks/index.js';
export type {
  WatchlistItem,
  WatchlistSummary,
  HealthPostureZone,
  CostExposureZone,
  ScheduleRiskZone,
  QualitySafetyZone,
  CrossDriverZone,
  RiskExposureSummary,
  InterventionItem,
  InterventionQueue,
} from './hooks/index.js';
