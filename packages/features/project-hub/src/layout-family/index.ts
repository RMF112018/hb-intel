/**
 * Project Hub Layout Family — public API.
 *
 * Domain-owned: family definitions, role/device resolver, data hooks,
 * orchestrator surfaces, and PH-specific sub-components.
 *
 * Generic layout/composition primitives are owned by @hbc/ui-kit:
 * MultiColumnLayout, HbcNavRail, HbcContextRail, HbcActivityStrip,
 * HbcQuickActionBar, HbcSyncStatusBar.
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

// ── Components (orchestrators + PH-domain) ──────────────────────────

export {
  ProjectOperatingSurface,
  ExecutiveCockpitSurface,
  FieldTabletSurface,
  CanvasCenter,
  WatchlistPanel,
  RiskExposureCanvas,
  InterventionRail,
  FieldFocusRail,
  FieldActionStack,
} from './components/index.js';
export type {
  ProjectOperatingSurfaceProps,
  ExecutiveCockpitSurfaceProps,
  FieldTabletSurfaceProps,
  CanvasCenterProps,
  WatchlistPanelProps,
  RiskExposureCanvasProps,
  InterventionRailProps,
  FieldFocusRailProps,
  FieldActionStackProps,
} from './components/index.js';

// ── Profiles (governed default-view selection layer) ────────────────

export type {
  ProjectHubProfileId,
  ProjectHubDeviceClass,
  ProjectHubProfileRole,
  ProfileRegionCollapse,
  ProjectHubProfileDefinition,
  ProjectHubProfileResolutionInput,
  ProjectHubProfileResolutionResult,
  ProjectHubProfilePreference,
} from './profiles/index.js';

export {
  HYBRID_OPERATING_LAYER,
  CANVAS_FIRST_OPERATING_LAYER,
  NEXT_MOVE_HUB,
  EXECUTIVE_COCKPIT,
  FIELD_TABLET_SPLIT_PANE,
  PROJECT_HUB_PROFILE_REGISTRY,
  PROJECT_HUB_PROFILE_IDS,
  resolveProjectHubProfile,
  isProfileAllowed,
  getAllowedProfiles,
  getDefaultProfileId,
  saveProfilePreference,
  loadProfilePreference,
  clearProfilePreference,
} from './profiles/index.js';

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
  useFieldFocusAreas,
  useFieldActionStack,
  useFieldSyncStatus,
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
  FieldFocusArea,
  FieldFocusSummary,
  FieldActionItem,
  FieldActionStackData,
  FieldSyncStatus,
} from './hooks/index.js';
