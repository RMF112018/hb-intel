/**
 * P3-E9-T07 reports review-boundaries business rules.
 * PER permission enforcement, lane depth, visibility, annotation isolation.
 */

import type { PerReportAction, ReportsDeepLinkView, ReportsLaneCapability, ReportsVisibilityRole } from './enums.js';
import {
  PER_REPORT_ACTION_PERMISSIONS,
  REPORTS_DEEP_LINK_DEFINITIONS,
  REPORTS_LANE_CAPABILITY_MATRIX,
  REPORTS_VISIBILITY_RULES,
} from './constants.js';

// -- PER Permission Enforcement -----------------------------------------------

/** Returns true if the given PER action is allowed. */
export const isPerActionAllowed = (action: PerReportAction): boolean => {
  const entry = PER_REPORT_ACTION_PERMISSIONS.find((p) => p.action === action);
  return entry !== undefined && entry.permission === 'ALLOWED';
};

/** PER cannot access unconfirmed drafts. */
export const canPerAccessUnconfirmedDraft = (): false => false;

/** PER cannot approve PX Review runs. */
export const canPerApprovePxReview = (): false => false;

/** PER cannot refresh drafts. */
export const canPerRefreshDraft = (): false => false;

/** PER cannot initiate standard runs. */
export const canPerInitiateStandardRun = (): false => false;

// -- Lane Depth ---------------------------------------------------------------

/** Returns true if the given capability is available in the specified lane. */
export const isReportsCapabilityAvailableInLane = (
  capability: ReportsLaneCapability,
  lane: 'PWA' | 'SPFX',
): boolean => {
  const entry = REPORTS_LANE_CAPABILITY_MATRIX.find((c) => c.capability === capability);
  if (!entry) return false;
  if (lane === 'PWA') return true;
  return entry.spfxDepth === 'SPFX_BROAD';
};

/** Returns true if the given capability requires launch-to-PWA from SPFx. */
export const requiresReportsLaunchToPwa = (capability: ReportsLaneCapability): boolean => {
  const entry = REPORTS_LANE_CAPABILITY_MATRIX.find((c) => c.capability === capability);
  return entry !== undefined && entry.requiresLaunchToPwa;
};

// -- Visibility ---------------------------------------------------------------

/** Returns true if the given role can view drafts. */
export const canRoleViewDrafts = (role: ReportsVisibilityRole): boolean => {
  const rule = REPORTS_VISIBILITY_RULES.find((r) => r.role === role);
  return rule !== undefined && rule.canAccessDrafts;
};

/** Returns true if the given role can access released artifacts. */
export const canRoleAccessReleasedArtifacts = (role: ReportsVisibilityRole): boolean => {
  const rule = REPORTS_VISIBILITY_RULES.find((r) => r.role === role);
  return rule !== undefined && rule.canAccessReleasedArtifacts;
};

// -- Annotation Isolation -----------------------------------------------------

/** Annotations never modify run records. */
export const doesAnnotationModifyRunRecord = (): false => false;

/** Annotations never appear in PDF artifacts. */
export const doesAnnotationAppearInPdf = (): false => false;

// -- Deep Links ---------------------------------------------------------------

/** Returns the deep link template for the given view, or null if not found. */
export const getReportsDeepLinkTemplate = (view: ReportsDeepLinkView): string | null => {
  const def = REPORTS_DEEP_LINK_DEFINITIONS.find((d) => d.view === view);
  return def ? def.deepLinkTemplate : null;
};
