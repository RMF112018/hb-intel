/**
 * P3-E9-T05 reports template-governance enumerations.
 * Library actions, config permissions, locked constraints, policy layers, version transitions.
 */

// -- Template Library Action --------------------------------------------------

/** Actions available on the corporate template library. */
export type TemplateLibraryAction =
  | 'CREATE_TEMPLATE'
  | 'UPDATE_TEMPLATE'
  | 'DEPRECATE_TEMPLATE'
  | 'PROMOTE_EXTENSION';

// -- Project Config Permission ------------------------------------------------

/** Permissions configurable at project level for a report family. */
export type ProjectConfigPermission =
  | 'NARRATIVE_AUTHORING'
  | 'SECTION_INCLUDE_EXCLUDE'
  | 'SECTION_ORDERING'
  | 'RELEASE_CLASS_SELECTION'
  | 'AUDIENCE_CLASS_SELECTION';

// -- Locked Template Constraint -----------------------------------------------

/** Constraints enforced on locked corporate templates. */
export type LockedTemplateConstraint =
  | 'NO_SECTION_ADD'
  | 'NO_SECTION_REMOVE'
  | 'NO_SECTION_REORDER'
  | 'NO_CONTENT_TYPE_CHANGE'
  | 'NO_APPROVAL_CLASS_CHANGE'
  | 'NARRATIVE_ONLY_ON_DESIGNATED';

// -- Governance Policy Layer --------------------------------------------------

/** Layers in the governance policy hierarchy. */
export type GovernancePolicyLayer =
  | 'GLOBAL_FLOOR'
  | 'PROJECT_OVERLAY'
  | 'EFFECTIVE_MERGED';

// -- Template Version Transition ----------------------------------------------

/** Lifecycle transitions for template versions. */
export type TemplateVersionTransition =
  | 'NEW_VERSION_CREATED'
  | 'PE_ACTIVATED'
  | 'PROJECT_MIGRATED'
  | 'DEPRECATED';
