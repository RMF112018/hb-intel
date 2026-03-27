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
