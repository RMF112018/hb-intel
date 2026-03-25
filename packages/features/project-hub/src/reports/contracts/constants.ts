/**
 * P3-E9-T02 reports contracts constants.
 * State machines, section definitions, validation rules.
 */

import type { ReportRunStatus } from '../run-ledger/enums.js';
import type { ReportFamilyKey } from '../foundation/enums.js';
import type {
  ConfigVersionState,
  InternalReviewChainStatus,
  ReleaseClass,
  ReportSectionContentType,
  ReportValidationRule,
  TemplatePromotionStatus,
} from './enums.js';
import type { IReportSectionDefinition, IReportValidationRuleDef } from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const REPORT_SECTION_CONTENT_TYPES = [
  'MODULE_SNAPSHOT',
  'CALCULATED_ROLLUP',
  'NARRATIVE_ONLY',
] as const satisfies ReadonlyArray<ReportSectionContentType>;

export const RELEASE_CLASSES = [
  'INTERNAL_ONLY',
  'OWNER_FACING',
  'EXTERNAL_LIMITED',
  'PUBLIC',
] as const satisfies ReadonlyArray<ReleaseClass>;

export const INTERNAL_REVIEW_CHAIN_STATUSES = [
  'NOT_STARTED',
  'SUBMITTED',
  'RETURNED',
  'COMPLETE',
] as const satisfies ReadonlyArray<InternalReviewChainStatus>;

export const CONFIG_VERSION_STATES = [
  'DRAFT',
  'ACTIVE',
  'SUPERSEDED',
  'REJECTED',
] as const satisfies ReadonlyArray<ConfigVersionState>;

export const TEMPLATE_PROMOTION_STATUSES = [
  'NOT_SUBMITTED',
  'SUBMITTED_FOR_REVIEW',
  'UNDER_REVIEW',
  'APPROVED_PROMOTED',
  'REJECTED',
] as const satisfies ReadonlyArray<TemplatePromotionStatus>;

export const REPORT_VALIDATION_RULES = [
  'FAMILY_KEY_REQUIRED',
  'PROJECT_ID_REQUIRED',
  'CONFIG_VERSION_REQUIRED',
  'SNAPSHOT_REFS_REQUIRED',
  'RELEASE_CLASS_VALID',
  'AUDIENCE_CLASS_VALID',
  'GENERATED_BY_REQUIRED',
  'APPROVED_BY_REQUIRED',
  'RELEASED_BY_REQUIRED',
  'RELEASE_CLASS_MATCH',
  'NARRATIVE_PM_PE_ONLY',
  'SCORE_READ_ONLY',
  'RECOMMENDATION_READ_ONLY',
  'SNAPSHOT_IMMUTABLE',
] as const satisfies ReadonlyArray<ReportValidationRule>;

// -- Label Maps ---------------------------------------------------------------

export const RELEASE_CLASS_LABELS: Readonly<Record<ReleaseClass, string>> = {
  INTERNAL_ONLY: 'Internal Only',
  OWNER_FACING: 'Owner Facing',
  EXTERNAL_LIMITED: 'External Limited',
  PUBLIC: 'Public',
};

export const INTERNAL_REVIEW_CHAIN_STATUS_LABELS: Readonly<Record<InternalReviewChainStatus, string>> = {
  NOT_STARTED: 'Not Started',
  SUBMITTED: 'Submitted',
  RETURNED: 'Returned',
  COMPLETE: 'Complete',
};

export const CONFIG_VERSION_STATE_LABELS: Readonly<Record<ConfigVersionState, string>> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  SUPERSEDED: 'Superseded',
  REJECTED: 'Rejected',
};

// -- State Machines -----------------------------------------------------------

export const REPORT_RUN_STATUS_TRANSITIONS: ReadonlyArray<{ from: ReportRunStatus; to: ReportRunStatus }> = [
  { from: 'PENDING', to: 'GENERATING' },
  { from: 'GENERATING', to: 'COMPLETED' },
  { from: 'GENERATING', to: 'FAILED' },
  { from: 'COMPLETED', to: 'SUPERSEDED' },
] as const satisfies ReadonlyArray<{ from: ReportRunStatus; to: ReportRunStatus }>;

export const CONFIG_VERSION_STATE_TRANSITIONS: ReadonlyArray<{ from: ConfigVersionState; to: ConfigVersionState }> = [
  { from: 'DRAFT', to: 'ACTIVE' },
  { from: 'DRAFT', to: 'REJECTED' },
  { from: 'ACTIVE', to: 'SUPERSEDED' },
] as const satisfies ReadonlyArray<{ from: ConfigVersionState; to: ConfigVersionState }>;

export const INTERNAL_REVIEW_CHAIN_TRANSITIONS: ReadonlyArray<{ from: InternalReviewChainStatus; to: InternalReviewChainStatus }> = [
  { from: 'NOT_STARTED', to: 'SUBMITTED' },
  { from: 'SUBMITTED', to: 'RETURNED' },
  { from: 'SUBMITTED', to: 'COMPLETE' },
  { from: 'RETURNED', to: 'SUBMITTED' },
] as const satisfies ReadonlyArray<{ from: InternalReviewChainStatus; to: InternalReviewChainStatus }>;

// -- Section Definitions ------------------------------------------------------

export const PX_REVIEW_SECTION_DEFINITIONS: ReadonlyArray<IReportSectionDefinition> = [
  { sectionKey: 'executive-summary', displayName: 'Executive Summary', contentType: 'NARRATIVE_ONLY', sourceModuleKey: null, snapshotApiContractRef: null, rollupCalculationRef: null, isNarrativeOverrideable: true, isRequired: true, displayOrder: 1 },
  { sectionKey: 'financial-summary', displayName: 'Financial Summary', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'financial', snapshotApiContractRef: 'P3-E4', rollupCalculationRef: null, isNarrativeOverrideable: false, isRequired: true, displayOrder: 2 },
  { sectionKey: 'schedule-summary', displayName: 'Schedule Summary', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'schedule', snapshotApiContractRef: 'P3-E5', rollupCalculationRef: null, isNarrativeOverrideable: false, isRequired: true, displayOrder: 3 },
  { sectionKey: 'constraints-summary', displayName: 'Constraints Summary', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'constraints', snapshotApiContractRef: 'P3-E6', rollupCalculationRef: null, isNarrativeOverrideable: false, isRequired: true, displayOrder: 4 },
  { sectionKey: 'safety-summary', displayName: 'Safety Summary', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'safety', snapshotApiContractRef: 'P3-E8', rollupCalculationRef: null, isNarrativeOverrideable: false, isRequired: true, displayOrder: 5 },
  { sectionKey: 'quality-summary', displayName: 'Quality Summary', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'qc', snapshotApiContractRef: 'P3-E15', rollupCalculationRef: null, isNarrativeOverrideable: false, isRequired: true, displayOrder: 6 },
] as const satisfies ReadonlyArray<IReportSectionDefinition>;

export const OWNER_REPORT_SECTION_DEFINITIONS: ReadonlyArray<IReportSectionDefinition> = [
  { sectionKey: 'project-overview', displayName: 'Project Overview', contentType: 'NARRATIVE_ONLY', sourceModuleKey: null, snapshotApiContractRef: null, rollupCalculationRef: null, isNarrativeOverrideable: true, isRequired: true, displayOrder: 1 },
  { sectionKey: 'schedule-status', displayName: 'Schedule Status', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'schedule', snapshotApiContractRef: 'P3-E5', rollupCalculationRef: null, isNarrativeOverrideable: true, isRequired: true, displayOrder: 2 },
  { sectionKey: 'financial-status', displayName: 'Financial Status', contentType: 'MODULE_SNAPSHOT', sourceModuleKey: 'financial', snapshotApiContractRef: 'P3-E4', rollupCalculationRef: null, isNarrativeOverrideable: true, isRequired: true, displayOrder: 3 },
  { sectionKey: 'issues-summary', displayName: 'Issues Summary', contentType: 'CALCULATED_ROLLUP', sourceModuleKey: null, snapshotApiContractRef: null, rollupCalculationRef: 'constraints-issues-rollup', isNarrativeOverrideable: true, isRequired: false, displayOrder: 4 },
  { sectionKey: 'narrative', displayName: 'Narrative', contentType: 'NARRATIVE_ONLY', sourceModuleKey: null, snapshotApiContractRef: null, rollupCalculationRef: null, isNarrativeOverrideable: true, isRequired: true, displayOrder: 5 },
] as const satisfies ReadonlyArray<IReportSectionDefinition>;

// -- Validation Rule Definitions ----------------------------------------------

export const REPORT_VALIDATION_RULE_DEFINITIONS: ReadonlyArray<IReportValidationRuleDef> = [
  { rule: 'FAMILY_KEY_REQUIRED', description: 'familyKey must be a registered ReportFamilyKey', enforcement: 'reject if missing or unregistered' },
  { rule: 'PROJECT_ID_REQUIRED', description: 'projectId must be present on all project-scoped records', enforcement: 'reject if empty' },
  { rule: 'CONFIG_VERSION_REQUIRED', description: 'configVersionId must reference a valid active or draft version', enforcement: 'reject if null or unresolvable' },
  { rule: 'SNAPSHOT_REFS_REQUIRED', description: 'snapshotRefs must be non-empty for generated runs', enforcement: 'reject if empty at generation time' },
  { rule: 'RELEASE_CLASS_VALID', description: 'selectedReleaseClass must be in family allowed set', enforcement: 'reject if not in allowedReleaseClasses' },
  { rule: 'AUDIENCE_CLASS_VALID', description: 'selectedAudienceClasses must be subset of family allowed set', enforcement: 'reject if any class not in allowedAudienceClasses' },
  { rule: 'GENERATED_BY_REQUIRED', description: 'generatedByUPN must be present and valid', enforcement: 'reject if empty' },
  { rule: 'APPROVED_BY_REQUIRED', description: 'approvedByUPN required for approval-gated families', enforcement: 'reject if PE approval missing on PX Review' },
  { rule: 'RELEASED_BY_REQUIRED', description: 'releasedByUPN required for release action', enforcement: 'reject if empty on release transition' },
  { rule: 'RELEASE_CLASS_MATCH', description: 'release releaseClass must match config selectedReleaseClass', enforcement: 'reject if mismatch' },
  { rule: 'NARRATIVE_PM_PE_ONLY', description: 'Narrative sections may only be authored by PM or PE', enforcement: 'reject PER narrative writes' },
  { rule: 'SCORE_READ_ONLY', description: 'Score fields in integration-driven artifacts are read-only at report layer', enforcement: 'reject direct score edits' },
  { rule: 'RECOMMENDATION_READ_ONLY', description: 'Recommendation fields are read-only at report layer', enforcement: 'reject direct recommendation edits' },
  { rule: 'SNAPSHOT_IMMUTABLE', description: 'Snapshot references are immutable once run transitions out of queued', enforcement: 'reject any snapshot mutation post-generation' },
] as const satisfies ReadonlyArray<IReportValidationRuleDef>;
