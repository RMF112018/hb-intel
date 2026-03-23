import {
  SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS,
  SCHEDULE_COMPLEXITY_TIER_CONFIGS,
  SCHEDULE_WORK_ITEM_CONFIGS,
} from '../constants/index.js';
import type {
  ScheduleAnnotatableSurface,
  ScheduleComplexityTier,
  ScheduleWorkItemType,
} from '../types/index.js';

/**
 * P3-E5-T09 platform integration and governance domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Complexity Tier Features (§18.5) ─────────────────────────────────

/**
 * Get the feature list for a complexity tier (§18.5).
 */
export const getComplexityTierFeatures = (
  tier: ScheduleComplexityTier,
): ReadonlyArray<string> => {
  const config = SCHEDULE_COMPLEXITY_TIER_CONFIGS.find((c) => c.tier === tier);
  return config?.features ?? [];
};

// ── Annotation Surface Checks (§23) ─────────────────────────────────

/**
 * Check whether a surface is annotatable by PER (§23).
 */
export const isAnnotatableSurface = (
  surface: string,
): boolean => {
  return SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS.some((c) => c.surface === surface);
};

/**
 * Get the annotatable fields for a given surface (§23).
 * Returns empty array if surface is not annotatable.
 */
export const getAnnotatableFields = (
  surface: ScheduleAnnotatableSurface,
): ReadonlyArray<string> => {
  const config = SCHEDULE_ANNOTATABLE_SURFACE_CONFIGS.find((c) => c.surface === surface);
  return config?.annotatableFields ?? [];
};

// ── Work Item Assignee Resolution (§18.3) ────────────────────────────

/**
 * Get the default assignee for a schedule work item type (§18.3).
 */
export const getDefaultAssigneeForWorkItem = (
  type: ScheduleWorkItemType,
): string => {
  const config = SCHEDULE_WORK_ITEM_CONFIGS.find((c) => c.type === type);
  return config?.assignee ?? 'PM';
};
