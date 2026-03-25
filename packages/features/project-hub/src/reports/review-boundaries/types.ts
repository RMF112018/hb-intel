/**
 * P3-E9-T07 reports review-boundaries TypeScript contracts.
 * PER permission matrix, lane capabilities, visibility rules, deep links, annotation boundaries.
 */

import type {
  PerActionPermission,
  PerReportAction,
  ReportsDeepLinkView,
  ReportsLaneCapability,
  ReportsLaneDepth,
  ReportsVisibilityRole,
} from './enums.js';

/** A single PER action with its permission and rationale. */
export interface IPerReportActionPermission {
  readonly action: PerReportAction;
  readonly permission: PerActionPermission;
  readonly rationale: string;
}

/** A lane capability entry with PWA and SPFx depth. */
export interface IReportsLaneCapabilityEntry {
  readonly capability: ReportsLaneCapability;
  readonly pwaDepth: ReportsLaneDepth;
  readonly spfxDepth: ReportsLaneDepth;
  readonly requiresLaunchToPwa: boolean;
}

/** Visibility rule per role. */
export interface IReportsVisibilityRule {
  readonly role: ReportsVisibilityRole;
  readonly canViewStandardRuns: boolean;
  readonly canViewReviewerRuns: boolean;
  readonly canAccessDrafts: boolean;
  readonly canAccessReleasedArtifacts: boolean;
}

/** Deep link definition for SPFx-to-PWA launch. */
export interface IReportsDeepLinkDefinition {
  readonly view: ReportsDeepLinkView;
  readonly deepLinkTemplate: string;
  readonly requiredParams: readonly string[];
  readonly description: string;
}

/** Annotation boundary rule governing annotation storage and isolation. */
export interface IAnnotationBoundaryRule {
  readonly ruleId: string;
  readonly description: string;
  readonly annotationStoredIn: string;
  readonly modifiesRunRecord: boolean;
}

/** Multi-run comparison rule governing cross-type comparison behavior. */
export interface IMultiRunComparisonRule {
  readonly ruleId: string;
  readonly allowedRunTypes: readonly string[];
  readonly pwaOnly: boolean;
  readonly perOnly: boolean;
}
