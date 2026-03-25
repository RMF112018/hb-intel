/**
 * P3-E9-T01 reports foundation constants.
 * Family registry, authority matrix, ownership boundaries, operating principles.
 */

import type {
  ConfigChangeType,
  IntegrationSourceModule,
  NarrativeAuthorityRole,
  PerReleaseAuthority,
  ReportApprovalGateType,
  ReportConfigurationState,
  ReportFamilyKey,
  ReportFamilyType,
  ReportModuleAuthority,
  ReportNonOwnershipConcern,
  ReportOwnershipConcern,
} from './enums.js';
import type {
  IIntegrationDrivenArtifactRule,
  IReportAuthorityEntry,
  IReportFamilyDefinition,
  IReportNonOwnershipBoundary,
  IReportOperatingPrinciple,
  IReportOwnershipBoundary,
} from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const REPORT_FAMILY_TYPES = [
  'NATIVE_CORPORATE_LOCKED',
  'NATIVE_CORPORATE_CONFIGURABLE',
  'INTEGRATION_DRIVEN_ARTIFACT',
  'PROJECT_EXTENSION',
] as const satisfies ReadonlyArray<ReportFamilyType>;

export const REPORT_FAMILY_KEYS = [
  'PX_REVIEW',
  'OWNER_REPORT',
  'SUB_SCORECARD',
  'LESSONS_LEARNED',
] as const satisfies ReadonlyArray<ReportFamilyKey>;

export const REPORT_MODULE_AUTHORITIES = [
  'MOE_ADMIN',
  'PE',
  'PM',
  'PER',
  'SUPERINTENDENT_FIELD',
] as const satisfies ReadonlyArray<ReportModuleAuthority>;

export const REPORT_CONFIGURATION_STATES = [
  'DRAFT',
  'ACTIVE',
] as const satisfies ReadonlyArray<ReportConfigurationState>;

export const REPORT_APPROVAL_GATE_TYPES = [
  'PE_APPROVAL_REQUIRED',
  'NON_GATED',
] as const satisfies ReadonlyArray<ReportApprovalGateType>;

export const PER_RELEASE_AUTHORITIES = [
  'PE_ONLY',
  'PER_PERMITTED',
] as const satisfies ReadonlyArray<PerReleaseAuthority>;

export const REPORT_OWNERSHIP_CONCERNS = [
  'TEMPLATE_LIBRARY',
  'PROJECT_REGISTRATIONS',
  'DRAFT_STATE',
  'RUN_LEDGER',
  'ARTIFACT_PROVENANCE',
  'PDF_PIPELINE',
  'SPINE_PUBLICATION',
  'POLICY_ENFORCEMENT',
] as const satisfies ReadonlyArray<ReportOwnershipConcern>;

export const REPORT_NON_OWNERSHIP_CONCERNS = [
  'SOURCE_MODULE_DATA',
  'SUB_SCORECARD_DATA',
  'LESSONS_LEARNED_DATA',
  'GOVERNANCE_POLICY_RECORD',
  'FIELD_ANNOTATIONS',
] as const satisfies ReadonlyArray<ReportNonOwnershipConcern>;

export const NARRATIVE_AUTHORITY_ROLES = [
  'PM',
  'PE',
] as const satisfies ReadonlyArray<NarrativeAuthorityRole>;

export const CONFIG_CHANGE_TYPES = [
  'STRUCTURAL',
  'NON_STRUCTURAL',
] as const satisfies ReadonlyArray<ConfigChangeType>;

export const INTEGRATION_SOURCE_MODULES = [
  'CLOSEOUT',
] as const satisfies ReadonlyArray<IntegrationSourceModule>;

// -- Label Maps ---------------------------------------------------------------

export const REPORT_FAMILY_TYPE_LABELS: Readonly<Record<ReportFamilyType, string>> = {
  NATIVE_CORPORATE_LOCKED: 'Native Corporate Locked',
  NATIVE_CORPORATE_CONFIGURABLE: 'Native Corporate Configurable',
  INTEGRATION_DRIVEN_ARTIFACT: 'Integration-Driven Artifact',
  PROJECT_EXTENSION: 'Project Extension',
};

export const REPORT_FAMILY_KEY_LABELS: Readonly<Record<ReportFamilyKey, string>> = {
  PX_REVIEW: 'PX Review',
  OWNER_REPORT: 'Owner Report',
  SUB_SCORECARD: 'Subcontractor Scorecard',
  LESSONS_LEARNED: 'Lessons Learned',
};

export const REPORT_MODULE_AUTHORITY_LABELS: Readonly<Record<ReportModuleAuthority, string>> = {
  MOE_ADMIN: 'MOE Admin',
  PE: 'Project Executive',
  PM: 'Project Manager',
  PER: 'Project Executive Representative',
  SUPERINTENDENT_FIELD: 'Superintendent / Field',
};

export const PER_RELEASE_AUTHORITY_LABELS: Readonly<Record<PerReleaseAuthority, string>> = {
  PE_ONLY: 'PE Only',
  PER_PERMITTED: 'PER Permitted',
};

// -- Family Registry ----------------------------------------------------------

export const PHASE_3_REGISTERED_FAMILIES = [
  {
    familyKey: 'PX_REVIEW',
    familyType: 'NATIVE_CORPORATE_LOCKED',
    displayName: 'PX Review',
    approvalGated: true,
    perReleaseAuthority: 'PE_ONLY',
    stalenessThresholdDays: 7,
    sectionDefinitions: [
      'executive-summary',
      'financial-summary',
      'schedule-summary',
      'constraints-summary',
      'safety-summary',
      'quality-summary',
    ],
    owningSource: 'Reports (native)',
    isStructureLocked: true,
    audienceClass: 'internal-executive',
    distributionClass: 'governed-internal',
    isPhase3Required: true,
  },
  {
    familyKey: 'OWNER_REPORT',
    familyType: 'NATIVE_CORPORATE_CONFIGURABLE',
    displayName: 'Owner Report',
    approvalGated: false,
    perReleaseAuthority: 'PER_PERMITTED',
    stalenessThresholdDays: 7,
    sectionDefinitions: [
      'project-overview',
      'schedule-status',
      'financial-status',
      'issues-summary',
      'narrative',
    ],
    owningSource: 'Reports (native)',
    isStructureLocked: false,
    audienceClass: 'external-owner',
    distributionClass: 'governed-external',
    isPhase3Required: true,
  },
  {
    familyKey: 'SUB_SCORECARD',
    familyType: 'INTEGRATION_DRIVEN_ARTIFACT',
    displayName: 'Subcontractor Scorecard',
    approvalGated: false,
    perReleaseAuthority: 'PE_ONLY',
    stalenessThresholdDays: 7,
    sectionDefinitions: [
      'scorecard-summary',
      'section-scores',
      'criterion-detail',
      'performance-rating',
    ],
    owningSource: 'P3-E10 (Closeout)',
    isStructureLocked: true,
    audienceClass: 'internal-project',
    distributionClass: 'governed-internal',
    isPhase3Required: true,
  },
  {
    familyKey: 'LESSONS_LEARNED',
    familyType: 'INTEGRATION_DRIVEN_ARTIFACT',
    displayName: 'Lessons Learned',
    approvalGated: false,
    perReleaseAuthority: 'PE_ONLY',
    stalenessThresholdDays: 7,
    sectionDefinitions: [
      'report-header',
      'lesson-entries',
      'aggregate-stats',
      'category-summary',
    ],
    owningSource: 'P3-E10 (Closeout)',
    isStructureLocked: true,
    audienceClass: 'internal-project',
    distributionClass: 'governed-internal',
    isPhase3Required: true,
  },
] as const satisfies ReadonlyArray<IReportFamilyDefinition>;

// -- Authority Matrix ---------------------------------------------------------

export const REPORT_AUTHORITY_MATRIX = [
  {
    role: 'MOE_ADMIN',
    authority: 'Corporate template library, global governance floor, template promotion, global policy floor',
    scope: 'Enterprise',
    constraints: 'No project-level draft editing',
  },
  {
    role: 'PE',
    authority: 'Activate project families, approve structural customizations, approve PX Review runs, set project overlay',
    scope: 'Project',
    constraints: 'Cannot loosen global floor',
  },
  {
    role: 'PM',
    authority: 'Configure draft state, author narrative sections, initiate generation runs, manage draft refresh',
    scope: 'Project',
    constraints: 'No approval authority for PX Review',
  },
  {
    role: 'PER',
    authority: 'View all runs in scope, place field annotations, generate reviewer-generated runs, release where per-permitted',
    scope: 'Department/Portfolio',
    constraints: 'No PM draft writes, no narrative authority, no run-ledger modifications',
  },
  {
    role: 'SUPERINTENDENT_FIELD',
    authority: 'No direct Reports authority; consumes published artifacts through Project Hub',
    scope: 'Project',
    constraints: 'Read-only consumer',
  },
] as const satisfies ReadonlyArray<IReportAuthorityEntry>;

// -- Ownership Boundaries -----------------------------------------------------

export const REPORT_OWNERSHIP_BOUNDARIES = [
  {
    concern: 'TEMPLATE_LIBRARY',
    description: 'Corporate template library — approved family definitions and schemas',
    governingOwner: 'MOE/Admin',
    isReportsOwned: true,
  },
  {
    concern: 'PROJECT_REGISTRATIONS',
    description: 'Project-activated report families with configuration overlays',
    governingOwner: 'PE',
    isReportsOwned: true,
  },
  {
    concern: 'DRAFT_STATE',
    description: 'PM-owned working draft configuration and narrative',
    governingOwner: 'PM',
    isReportsOwned: true,
  },
  {
    concern: 'RUN_LEDGER',
    description: 'Immutable record of all runs, approvals, releases, distribution',
    governingOwner: 'Reports',
    isReportsOwned: true,
  },
  {
    concern: 'ARTIFACT_PROVENANCE',
    description: 'Association between run and exact module snapshots consumed',
    governingOwner: 'Reports',
    isReportsOwned: true,
  },
  {
    concern: 'PDF_PIPELINE',
    description: 'Async queued generation, SharePoint storage, artifact URL tracking',
    governingOwner: 'Reports',
    isReportsOwned: true,
  },
  {
    concern: 'SPINE_PUBLICATION',
    description: 'Activity events, health metric, work queue items, related items',
    governingOwner: 'Reports',
    isReportsOwned: true,
  },
  {
    concern: 'POLICY_ENFORCEMENT',
    description: 'Reads and enforces central project-governance policy record',
    governingOwner: 'MOE/PE (owned) / Reports (enforced)',
    isReportsOwned: true,
  },
] as const satisfies ReadonlyArray<IReportOwnershipBoundary>;

// -- Non-Ownership Boundaries -------------------------------------------------

export const REPORT_NON_OWNERSHIP_BOUNDARIES = [
  {
    concern: 'SOURCE_MODULE_DATA',
    description: 'Source-of-truth data from originating modules',
    actualOwner: 'Originating modules',
    reportsRelationship: 'Assembles from immutable snapshots',
  },
  {
    concern: 'SUB_SCORECARD_DATA',
    description: 'Subcontractor evaluations, scores, ratings',
    actualOwner: 'P3-E10 (Closeout)',
    reportsRelationship: 'Ingests confirmed snapshot',
  },
  {
    concern: 'LESSONS_LEARNED_DATA',
    description: 'Lesson entries, categories, impact ratings',
    actualOwner: 'P3-E10 (Closeout)',
    reportsRelationship: 'Ingests confirmed snapshot',
  },
  {
    concern: 'GOVERNANCE_POLICY_RECORD',
    description: 'Central project-governance policy record',
    actualOwner: 'MOE (global floor) / PE (project overlay)',
    reportsRelationship: 'Enforces only',
  },
  {
    concern: 'FIELD_ANNOTATIONS',
    description: 'Review annotation layer',
    actualOwner: '@hbc/field-annotations',
    reportsRelationship: 'Surfaces attachment point only',
  },
] as const satisfies ReadonlyArray<IReportNonOwnershipBoundary>;

// -- Operating Principles -----------------------------------------------------

export const REPORT_OPERATING_PRINCIPLES = [
  {
    principleId: 'snapshot-immutability',
    title: 'Snapshot Immutability',
    description: 'Once a module snapshot is consumed by a generation run, the snapshot association is immutable',
  },
  {
    principleId: 'narrative-ownership',
    title: 'Narrative Ownership',
    description: 'PM narrative sections are authored by PM/PE and preserved across draft refreshes; PER has no authority over narrative',
  },
  {
    principleId: 'no-data-bindings',
    title: 'No Project-Authored Data Bindings',
    description: 'Projects may not introduce custom data bindings, formula overrides, or calculated fields',
  },
  {
    principleId: 'policy-enforcement',
    title: 'Policy Enforcement Without Ownership',
    description: 'Reports enforces effective project-governance policy but does not store, own, or modify it',
  },
  {
    principleId: 'per-consumer',
    title: 'PER as Consumer, Not Author',
    description: 'PER reads, annotates, and generates reviewer-generated runs; cannot write to PM draft, narrative, or run-ledger',
  },
] as const satisfies ReadonlyArray<IReportOperatingPrinciple>;

// -- Integration Artifact Rules -----------------------------------------------

export const INTEGRATION_ARTIFACT_RULES = [
  {
    familyKey: 'SUB_SCORECARD',
    sourceModule: 'CLOSEOUT',
    ownsSourceData: false,
    triggeredBy: 'Project closeout, per subcontractor',
    scoringAuthority: 'P3-E10 at source data entry time',
  },
  {
    familyKey: 'LESSONS_LEARNED',
    sourceModule: 'CLOSEOUT',
    ownsSourceData: false,
    triggeredBy: 'Project closeout, per project',
    scoringAuthority: 'P3-E10 at source data entry time',
  },
] as const satisfies ReadonlyArray<IIntegrationDrivenArtifactRule>;
