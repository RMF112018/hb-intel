/**
 * P3-E9-T07 reports review-boundaries constants.
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
import type {
  IAnnotationBoundaryRule,
  IMultiRunComparisonRule,
  IPerReportActionPermission,
  IReportsDeepLinkDefinition,
  IReportsLaneCapabilityEntry,
  IReportsVisibilityRule,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const PER_REPORT_ACTIONS = [
  'VIEW_RUNS',
  'VIEW_DRAFT_STATUS',
  'ACCESS_RELEASED_ARTIFACTS',
  'PLACE_ANNOTATIONS',
  'GENERATE_REVIEWER_RUN',
  'RELEASE_IF_PERMITTED',
  'BROWSE_RUN_HISTORY',
  'CONFIRM_DRAFT',
  'EDIT_NARRATIVE',
  'MODIFY_RUN_LEDGER',
  'ACCESS_UNCONFIRMED_DRAFT',
  'ADVANCE_REVIEW_CHAIN',
  'APPROVE_PX_REVIEW',
  'REFRESH_DRAFT',
  'INITIATE_STANDARD_RUN',
  'MULTI_RUN_COMPARE',
] as const satisfies ReadonlyArray<PerReportAction>;

export const PER_ACTION_PERMISSIONS = [
  'ALLOWED',
  'PROHIBITED',
] as const satisfies ReadonlyArray<PerActionPermission>;

export const REPORTS_LANE_CAPABILITIES = [
  'REPORT_LIST',
  'GENERATE_RUN',
  'VIEW_RUN',
  'EDIT_DRAFT',
  'REFRESH_DRAFT',
  'RUN_HISTORY',
  'EXPORT_PDF',
  'APPROVAL_ACTION',
  'RELEASE_ACTION',
  'MULTI_RUN_COMPARE',
  'ANNOTATION_THREADS',
] as const satisfies ReadonlyArray<ReportsLaneCapability>;

export const REPORTS_LANE_DEPTHS = [
  'PWA_FULL',
  'SPFX_BROAD',
  'SPFX_LAUNCH_TO_PWA',
] as const satisfies ReadonlyArray<ReportsLaneDepth>;

export const REPORTS_VISIBILITY_ROLES = [
  'PM',
  'PE',
  'PER',
  'SUPERINTENDENT',
  'FIELD',
  'MOE_ADMIN',
] as const satisfies ReadonlyArray<ReportsVisibilityRole>;

export const REPORTS_DEEP_LINK_VIEWS = [
  'FULL_HISTORY',
  'ADVANCED_DRAFT_EDITING',
  'COMPARE_RUNS',
  'REVIEW_THREADS',
] as const satisfies ReadonlyArray<ReportsDeepLinkView>;

// -- Label Maps ---------------------------------------------------------------

export const PER_ACTION_PERMISSION_LABELS: Readonly<Record<PerActionPermission, string>> = {
  ALLOWED: 'Allowed',
  PROHIBITED: 'Prohibited',
};

export const REPORTS_LANE_DEPTH_LABELS: Readonly<Record<ReportsLaneDepth, string>> = {
  PWA_FULL: 'PWA Full',
  SPFX_BROAD: 'SPFx Broad',
  SPFX_LAUNCH_TO_PWA: 'SPFx Launch to PWA',
};

export const REPORTS_VISIBILITY_ROLE_LABELS: Readonly<Record<ReportsVisibilityRole, string>> = {
  PM: 'Project Manager',
  PE: 'Project Executive',
  PER: 'Project Engineer Reviewer',
  SUPERINTENDENT: 'Superintendent',
  FIELD: 'Field',
  MOE_ADMIN: 'MOE Admin',
};

// -- PER Report Action Permissions --------------------------------------------

export const PER_REPORT_ACTION_PERMISSIONS = [
  // ALLOWED (8)
  { action: 'VIEW_RUNS', permission: 'ALLOWED', rationale: 'PER may view all runs in governed department scope' },
  { action: 'VIEW_DRAFT_STATUS', permission: 'ALLOWED', rationale: 'PER may view draft status and staleness indicators (read-only)' },
  { action: 'ACCESS_RELEASED_ARTIFACTS', permission: 'ALLOWED', rationale: 'PER may download released PDF artifacts' },
  { action: 'PLACE_ANNOTATIONS', permission: 'ALLOWED', rationale: 'PER may place field annotations in review layer via @hbc/field-annotations' },
  { action: 'GENERATE_REVIEWER_RUN', permission: 'ALLOWED', rationale: 'PER may generate reviewer-generated runs against latest confirmed PM snapshot' },
  { action: 'RELEASE_IF_PERMITTED', permission: 'ALLOWED', rationale: 'PER may release families where perReleaseAuthority = per-permitted' },
  { action: 'BROWSE_RUN_HISTORY', permission: 'ALLOWED', rationale: 'PER may browse run-ledger history summary' },
  { action: 'MULTI_RUN_COMPARE', permission: 'ALLOWED', rationale: 'PER may compare reviewer-generated and standard runs (PWA only)' },
  // PROHIBITED (8)
  { action: 'CONFIRM_DRAFT', permission: 'PROHIBITED', rationale: 'PM/PE exclusive — PER cannot confirm PM drafts' },
  { action: 'EDIT_NARRATIVE', permission: 'PROHIBITED', rationale: 'PM/PE exclusive — PER cannot edit PM narrative' },
  { action: 'MODIFY_RUN_LEDGER', permission: 'PROHIBITED', rationale: 'Run ledger is immutable — PER cannot modify entries' },
  { action: 'ACCESS_UNCONFIRMED_DRAFT', permission: 'PROHIBITED', rationale: 'PER cannot access unconfirmed PM drafts' },
  { action: 'ADVANCE_REVIEW_CHAIN', permission: 'PROHIBITED', rationale: 'PM↔PE internal review chain is PM/PE exclusive' },
  { action: 'APPROVE_PX_REVIEW', permission: 'PROHIBITED', rationale: 'PE-only — PER cannot approve PX Review runs' },
  { action: 'REFRESH_DRAFT', permission: 'PROHIBITED', rationale: 'PM exclusive — PER cannot refresh PM drafts' },
  { action: 'INITIATE_STANDARD_RUN', permission: 'PROHIBITED', rationale: 'PM/PE exclusive — PER can only generate reviewer-generated runs' },
] as const satisfies ReadonlyArray<IPerReportActionPermission>;

// -- Reports Lane Capability Matrix -------------------------------------------

export const REPORTS_LANE_CAPABILITY_MATRIX = [
  { capability: 'REPORT_LIST', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'GENERATE_RUN', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'VIEW_RUN', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'EDIT_DRAFT', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_LAUNCH_TO_PWA', requiresLaunchToPwa: true },
  { capability: 'REFRESH_DRAFT', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_LAUNCH_TO_PWA', requiresLaunchToPwa: true },
  { capability: 'RUN_HISTORY', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_LAUNCH_TO_PWA', requiresLaunchToPwa: true },
  { capability: 'EXPORT_PDF', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'APPROVAL_ACTION', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'RELEASE_ACTION', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_BROAD', requiresLaunchToPwa: false },
  { capability: 'MULTI_RUN_COMPARE', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_LAUNCH_TO_PWA', requiresLaunchToPwa: true },
  { capability: 'ANNOTATION_THREADS', pwaDepth: 'PWA_FULL', spfxDepth: 'SPFX_LAUNCH_TO_PWA', requiresLaunchToPwa: true },
] as const satisfies ReadonlyArray<IReportsLaneCapabilityEntry>;

// -- Reports Visibility Rules -------------------------------------------------

export const REPORTS_VISIBILITY_RULES = [
  { role: 'PM', canViewStandardRuns: true, canViewReviewerRuns: true, canAccessDrafts: true, canAccessReleasedArtifacts: true },
  { role: 'PE', canViewStandardRuns: true, canViewReviewerRuns: true, canAccessDrafts: true, canAccessReleasedArtifacts: true },
  { role: 'PER', canViewStandardRuns: true, canViewReviewerRuns: true, canAccessDrafts: false, canAccessReleasedArtifacts: true },
  { role: 'SUPERINTENDENT', canViewStandardRuns: false, canViewReviewerRuns: false, canAccessDrafts: false, canAccessReleasedArtifacts: true },
  { role: 'FIELD', canViewStandardRuns: false, canViewReviewerRuns: false, canAccessDrafts: false, canAccessReleasedArtifacts: false },
  { role: 'MOE_ADMIN', canViewStandardRuns: true, canViewReviewerRuns: true, canAccessDrafts: true, canAccessReleasedArtifacts: true },
] as const satisfies ReadonlyArray<IReportsVisibilityRule>;

// -- Reports Deep Link Definitions --------------------------------------------

export const REPORTS_DEEP_LINK_DEFINITIONS = [
  { view: 'FULL_HISTORY', deepLinkTemplate: '/project-hub/{projectId}/reports?view=history', requiredParams: ['projectId'], description: 'View full run history (SPFx launches to PWA)' },
  { view: 'ADVANCED_DRAFT_EDITING', deepLinkTemplate: '/project-hub/{projectId}/reports/{familyKey}/draft', requiredParams: ['projectId', 'familyKey'], description: 'Advanced draft editing (SPFx launches to PWA)' },
  { view: 'COMPARE_RUNS', deepLinkTemplate: '/project-hub/{projectId}/review?view=compare', requiredParams: ['projectId'], description: 'Multi-run comparison (PER, SPFx launches to PWA)' },
  { view: 'REVIEW_THREADS', deepLinkTemplate: '/project-hub/{projectId}/review?view=threads', requiredParams: ['projectId'], description: 'Review thread management (SPFx launches to PWA)' },
] as const satisfies ReadonlyArray<IReportsDeepLinkDefinition>;

// -- Annotation Boundary Rules ------------------------------------------------

export const ANNOTATION_BOUNDARY_RULES = [
  { ruleId: 'stored-separately', description: 'Annotations are stored in @hbc/field-annotations, not in run-ledger', annotationStoredIn: '@hbc/field-annotations', modifiesRunRecord: false },
  { ruleId: 'no-run-modification', description: 'Annotations attach to run via annotationArtifactRef but do not modify the run', annotationStoredIn: '@hbc/field-annotations', modifiesRunRecord: false },
  { ruleId: 'no-pdf-appearance', description: 'Annotations never appear in generated PDF artifacts', annotationStoredIn: '@hbc/field-annotations', modifiesRunRecord: false },
  { ruleId: 'no-run-blocking', description: 'Annotations cannot block runs or replace PM standard runs', annotationStoredIn: '@hbc/field-annotations', modifiesRunRecord: false },
] as const satisfies ReadonlyArray<IAnnotationBoundaryRule>;

// -- Multi-Run Comparison Rules -----------------------------------------------

export const MULTI_RUN_COMPARISON_RULES = [
  { ruleId: 'pwa-only', allowedRunTypes: ['STANDARD', 'REVIEWER_GENERATED'], pwaOnly: true, perOnly: false },
  { ruleId: 'per-can-compare', allowedRunTypes: ['STANDARD', 'REVIEWER_GENERATED'], pwaOnly: true, perOnly: true },
  { ruleId: 'cross-type-allowed', allowedRunTypes: ['STANDARD', 'REVIEWER_GENERATED'], pwaOnly: true, perOnly: false },
] as const satisfies ReadonlyArray<IMultiRunComparisonRule>;
