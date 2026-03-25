/**
 * P3-E9-T01 reports foundation enumerations.
 * Module boundary, authority model, family taxonomy.
 */

// -- Report Family Types ------------------------------------------------------

/** Four family types that govern report structure and ownership. */
export type ReportFamilyType =
  | 'NATIVE_CORPORATE_LOCKED'
  | 'NATIVE_CORPORATE_CONFIGURABLE'
  | 'INTEGRATION_DRIVEN_ARTIFACT'
  | 'PROJECT_EXTENSION';

// -- Report Family Keys -------------------------------------------------------

/** The four Phase 3 registered report family keys. */
export type ReportFamilyKey =
  | 'PX_REVIEW'
  | 'OWNER_REPORT'
  | 'SUB_SCORECARD'
  | 'LESSONS_LEARNED';

// -- Module Authority ---------------------------------------------------------

/** Roles with authority over Reports module functions. */
export type ReportModuleAuthority =
  | 'MOE_ADMIN'
  | 'PE'
  | 'PM'
  | 'PER'
  | 'SUPERINTENDENT_FIELD';

// -- Configuration State ------------------------------------------------------

/** Draft/active lifecycle for report configuration versions. */
export type ReportConfigurationState = 'DRAFT' | 'ACTIVE';

// -- Approval Gate Types ------------------------------------------------------

/** Whether a report family requires PE approval before release. */
export type ReportApprovalGateType = 'PE_APPROVAL_REQUIRED' | 'NON_GATED';

// -- PER Release Authority ----------------------------------------------------

/** Whether PER is permitted to release runs for a family. */
export type PerReleaseAuthority = 'PE_ONLY' | 'PER_PERMITTED';

// -- Ownership Concerns -------------------------------------------------------

/** Concerns that Reports module owns. */
export type ReportOwnershipConcern =
  | 'TEMPLATE_LIBRARY'
  | 'PROJECT_REGISTRATIONS'
  | 'DRAFT_STATE'
  | 'RUN_LEDGER'
  | 'ARTIFACT_PROVENANCE'
  | 'PDF_PIPELINE'
  | 'SPINE_PUBLICATION'
  | 'POLICY_ENFORCEMENT';

// -- Non-Ownership Concerns ---------------------------------------------------

/** Concerns that Reports consumes but does not own. */
export type ReportNonOwnershipConcern =
  | 'SOURCE_MODULE_DATA'
  | 'SUB_SCORECARD_DATA'
  | 'LESSONS_LEARNED_DATA'
  | 'GOVERNANCE_POLICY_RECORD'
  | 'FIELD_ANNOTATIONS';

// -- Narrative Authority Roles ------------------------------------------------

/** Roles with narrative authoring authority. */
export type NarrativeAuthorityRole = 'PM' | 'PE';

// -- Config Change Types ------------------------------------------------------

/** Structural vs non-structural configuration changes. */
export type ConfigChangeType = 'STRUCTURAL' | 'NON_STRUCTURAL';

// -- Integration Source Modules -----------------------------------------------

/** Modules that drive integration-driven artifact families. */
export type IntegrationSourceModule = 'CLOSEOUT';
