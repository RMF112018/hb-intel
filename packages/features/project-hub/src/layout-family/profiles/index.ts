/**
 * Project Hub Profile System — public API.
 *
 * Governed profile selection layer: 5 profiles → 3 layout families → 1 runtime.
 */

// ── Types ──────────────────────────────────────────────────────────

export type {
  ProjectHubProfileId,
  ProjectHubDeviceClass,
  ProjectHubProfileRole,
  ProfileRegionCollapse,
  ProjectHubProfileDefinition,
  ProjectHubProfileResolutionInput,
  ProjectHubProfileResolutionResult,
  ProjectHubProfilePreference,
} from './types.js';

// ── Registry ───────────────────────────────────────────────────────

export {
  HYBRID_OPERATING_LAYER,
  CANVAS_FIRST_OPERATING_LAYER,
  NEXT_MOVE_HUB,
  EXECUTIVE_COCKPIT,
  FIELD_TABLET_SPLIT_PANE,
  PROJECT_HUB_PROFILE_REGISTRY,
  PROJECT_HUB_PROFILE_IDS,
} from './registry.js';

// ── Resolution ─────────────────────────────────────────────────────

export {
  resolveProjectHubProfile,
  isProfileAllowed,
  getAllowedProfiles,
  getDefaultProfileId,
} from './resolver.js';

// ── Persistence ────────────────────────────────────────────────────

export {
  saveProfilePreference,
  loadProfilePreference,
  clearProfilePreference,
} from './persistence.js';
