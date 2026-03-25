/**
 * P3-E9-T05 reports template-governance constants.
 * Locked constraints, config boundaries, promotion transitions, policy merge rules.
 */

import type { TemplatePromotionStatus } from '../contracts/enums.js';
import type {
  GovernancePolicyLayer,
  LockedTemplateConstraint,
  ProjectConfigPermission,
  TemplateLibraryAction,
  TemplateVersionTransition,
} from './enums.js';
import type { IProjectConfigBoundary } from './types.js';

// -- Enum Arrays --------------------------------------------------------------

export const ALL_TEMPLATE_LIBRARY_ACTIONS = [
  'CREATE_TEMPLATE',
  'UPDATE_TEMPLATE',
  'DEPRECATE_TEMPLATE',
  'PROMOTE_EXTENSION',
] as const satisfies ReadonlyArray<TemplateLibraryAction>;

export const ALL_PROJECT_CONFIG_PERMISSIONS = [
  'NARRATIVE_AUTHORING',
  'SECTION_INCLUDE_EXCLUDE',
  'SECTION_ORDERING',
  'RELEASE_CLASS_SELECTION',
  'AUDIENCE_CLASS_SELECTION',
] as const satisfies ReadonlyArray<ProjectConfigPermission>;

export const ALL_LOCKED_TEMPLATE_CONSTRAINTS = [
  'NO_SECTION_ADD',
  'NO_SECTION_REMOVE',
  'NO_SECTION_REORDER',
  'NO_CONTENT_TYPE_CHANGE',
  'NO_APPROVAL_CLASS_CHANGE',
  'NARRATIVE_ONLY_ON_DESIGNATED',
] as const satisfies ReadonlyArray<LockedTemplateConstraint>;

export const ALL_GOVERNANCE_POLICY_LAYERS = [
  'GLOBAL_FLOOR',
  'PROJECT_OVERLAY',
  'EFFECTIVE_MERGED',
] as const satisfies ReadonlyArray<GovernancePolicyLayer>;

export const ALL_TEMPLATE_VERSION_TRANSITIONS = [
  'NEW_VERSION_CREATED',
  'PE_ACTIVATED',
  'PROJECT_MIGRATED',
  'DEPRECATED',
] as const satisfies ReadonlyArray<TemplateVersionTransition>;

// -- Label Maps ---------------------------------------------------------------

export const LOCKED_TEMPLATE_CONSTRAINT_LABELS: Readonly<Record<LockedTemplateConstraint, string>> = {
  NO_SECTION_ADD: 'No Section Add',
  NO_SECTION_REMOVE: 'No Section Remove',
  NO_SECTION_REORDER: 'No Section Reorder',
  NO_CONTENT_TYPE_CHANGE: 'No Content Type Change',
  NO_APPROVAL_CLASS_CHANGE: 'No Approval Class Change',
  NARRATIVE_ONLY_ON_DESIGNATED: 'Narrative Only on Designated',
};

export const PROJECT_CONFIG_PERMISSION_LABELS: Readonly<Record<ProjectConfigPermission, string>> = {
  NARRATIVE_AUTHORING: 'Narrative Authoring',
  SECTION_INCLUDE_EXCLUDE: 'Section Include/Exclude',
  SECTION_ORDERING: 'Section Ordering',
  RELEASE_CLASS_SELECTION: 'Release Class Selection',
  AUDIENCE_CLASS_SELECTION: 'Audience Class Selection',
};

export const GOVERNANCE_POLICY_LAYER_LABELS: Readonly<Record<GovernancePolicyLayer, string>> = {
  GLOBAL_FLOOR: 'Global Floor',
  PROJECT_OVERLAY: 'Project Overlay',
  EFFECTIVE_MERGED: 'Effective Merged',
};

// -- Locked Template Constraints List -----------------------------------------

export const LOCKED_TEMPLATE_CONSTRAINTS_LIST: ReadonlyArray<{ constraint: LockedTemplateConstraint; description: string }> = [
  { constraint: 'NO_SECTION_ADD', description: 'Cannot add new sections to locked template' },
  { constraint: 'NO_SECTION_REMOVE', description: 'Cannot remove existing sections from locked template' },
  { constraint: 'NO_SECTION_REORDER', description: 'Cannot reorder sections in locked template' },
  { constraint: 'NO_CONTENT_TYPE_CHANGE', description: 'Cannot change section content type in locked template' },
  { constraint: 'NO_APPROVAL_CLASS_CHANGE', description: 'Cannot change approval class configuration in locked template' },
  { constraint: 'NARRATIVE_ONLY_ON_DESIGNATED', description: 'Only narrative authoring is allowed on designated narrative sections' },
] as const satisfies ReadonlyArray<{ constraint: LockedTemplateConstraint; description: string }>;

// -- Project Config Boundaries ------------------------------------------------

export const PROJECT_CONFIG_BOUNDARIES: ReadonlyArray<IProjectConfigBoundary> = [
  // PX_REVIEW — locked: only narrative authoring on designated sections
  { familyKey: 'PX_REVIEW', permission: 'NARRATIVE_AUTHORING', isAllowed: true, requiresPeApproval: false, constraint: 'Designated narrative sections only' },
  { familyKey: 'PX_REVIEW', permission: 'SECTION_INCLUDE_EXCLUDE', isAllowed: false, requiresPeApproval: false, constraint: 'Locked template — no section modifications' },
  { familyKey: 'PX_REVIEW', permission: 'SECTION_ORDERING', isAllowed: false, requiresPeApproval: false, constraint: 'Locked template — no reordering' },
  { familyKey: 'PX_REVIEW', permission: 'RELEASE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Locked template — governed release class' },
  { familyKey: 'PX_REVIEW', permission: 'AUDIENCE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Locked template — governed audience' },
  // OWNER_REPORT — configurable: most permissions with PE approval for structural
  { familyKey: 'OWNER_REPORT', permission: 'NARRATIVE_AUTHORING', isAllowed: true, requiresPeApproval: false, constraint: 'All narrative sections' },
  { familyKey: 'OWNER_REPORT', permission: 'SECTION_INCLUDE_EXCLUDE', isAllowed: true, requiresPeApproval: true, constraint: 'Optional sections only; PE approval required' },
  { familyKey: 'OWNER_REPORT', permission: 'SECTION_ORDERING', isAllowed: true, requiresPeApproval: false, constraint: 'Where template allows reordering' },
  { familyKey: 'OWNER_REPORT', permission: 'RELEASE_CLASS_SELECTION', isAllowed: true, requiresPeApproval: false, constraint: 'From allowed release class set' },
  { familyKey: 'OWNER_REPORT', permission: 'AUDIENCE_CLASS_SELECTION', isAllowed: true, requiresPeApproval: true, constraint: 'PE approval for broadening audience' },
  // SUB_SCORECARD — integration-driven: locked structure
  { familyKey: 'SUB_SCORECARD', permission: 'NARRATIVE_AUTHORING', isAllowed: false, requiresPeApproval: false, constraint: 'No narrative sections — data-only artifact' },
  { familyKey: 'SUB_SCORECARD', permission: 'SECTION_INCLUDE_EXCLUDE', isAllowed: false, requiresPeApproval: false, constraint: 'Locked integration structure' },
  { familyKey: 'SUB_SCORECARD', permission: 'SECTION_ORDERING', isAllowed: false, requiresPeApproval: false, constraint: 'Locked integration structure' },
  { familyKey: 'SUB_SCORECARD', permission: 'RELEASE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Governed release class' },
  { familyKey: 'SUB_SCORECARD', permission: 'AUDIENCE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Governed audience' },
  // LESSONS_LEARNED — same as sub-scorecard
  { familyKey: 'LESSONS_LEARNED', permission: 'NARRATIVE_AUTHORING', isAllowed: false, requiresPeApproval: false, constraint: 'No narrative sections — data-only artifact' },
  { familyKey: 'LESSONS_LEARNED', permission: 'SECTION_INCLUDE_EXCLUDE', isAllowed: false, requiresPeApproval: false, constraint: 'Locked integration structure' },
  { familyKey: 'LESSONS_LEARNED', permission: 'SECTION_ORDERING', isAllowed: false, requiresPeApproval: false, constraint: 'Locked integration structure' },
  { familyKey: 'LESSONS_LEARNED', permission: 'RELEASE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Governed release class' },
  { familyKey: 'LESSONS_LEARNED', permission: 'AUDIENCE_CLASS_SELECTION', isAllowed: false, requiresPeApproval: false, constraint: 'Governed audience' },
] as const satisfies ReadonlyArray<IProjectConfigBoundary>;

// -- Promotion Valid Transitions ----------------------------------------------

export const TEMPLATE_PROMOTION_VALID_TRANSITIONS: ReadonlyArray<{ from: TemplatePromotionStatus; to: TemplatePromotionStatus }> = [
  { from: 'NOT_SUBMITTED', to: 'SUBMITTED_FOR_REVIEW' },
  { from: 'SUBMITTED_FOR_REVIEW', to: 'UNDER_REVIEW' },
  { from: 'UNDER_REVIEW', to: 'APPROVED_PROMOTED' },
  { from: 'UNDER_REVIEW', to: 'REJECTED' },
  { from: 'REJECTED', to: 'SUBMITTED_FOR_REVIEW' },
] as const satisfies ReadonlyArray<{ from: TemplatePromotionStatus; to: TemplatePromotionStatus }>;

// -- Post-Activation Change Rules ---------------------------------------------

export const POST_ACTIVATION_CHANGE_RULES: ReadonlyArray<{ isStructural: boolean; requiresPeReApproval: boolean; description: string }> = [
  { isStructural: true, requiresPeReApproval: true, description: 'Structural changes (add/remove sections, change content types, change approval class) require PE re-approval' },
  { isStructural: false, requiresPeReApproval: false, description: 'Non-structural changes (narrative edits, release class within allowed set, section ordering) do not require PE re-approval' },
] as const satisfies ReadonlyArray<{ isStructural: boolean; requiresPeReApproval: boolean; description: string }>;

// -- Governance Policy Merge Rules --------------------------------------------

export const GOVERNANCE_POLICY_MERGE_RULES: ReadonlyArray<{ rule: string; enforcement: string }> = [
  { rule: 'Project overlay may tighten global floor restrictions', enforcement: 'Additive restrictions allowed' },
  { rule: 'Project overlay may NOT loosen global floor restrictions', enforcement: 'Reject any overlay that reduces global floor constraints' },
  { rule: 'Effective policy = global floor ∪ project overlay (union of all restrictions)', enforcement: 'Merge all rules; most restrictive wins on conflict' },
] as const satisfies ReadonlyArray<{ rule: string; enforcement: string }>;
