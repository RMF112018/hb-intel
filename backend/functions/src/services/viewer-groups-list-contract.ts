/**
 * projectViewerGroups list data contract — SharePoint persistence layer.
 *
 * This module defines the boundary between the domain model
 * (`IDepartmentViewerPolicy`) and the SharePoint `projectViewerGroups`
 * list storage schema.
 *
 * The `projectViewerGroups` list drives department-based default viewer-group
 * policy. Each row maps a department to a set of Entra ID security group IDs
 * that receive read-only access on newly provisioned project sites.
 *
 * This is the second half of the hybrid viewer model:
 *   effective viewers = department defaults (this list) + project-level viewerUPNs (Projects list)
 *
 * @see Gap-6-projectViewerGroups-Design-and-Adapter-Alignment.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// List metadata
// ─────────────────────────────────────────────────────────────────────────────

/** SharePoint list title for the department viewer-group policy list. */
export const VIEWER_GROUPS_LIST_NAME = 'projectViewerGroups';

// ─────────────────────────────────────────────────────────────────────────────
// Domain model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Department-level default viewer-group policy.
 *
 * Each active row defines which Entra ID security groups should receive
 * read-only access on project sites belonging to this department.
 */
export interface IDepartmentViewerPolicy {
  /** Department key (e.g. "Commercial", "Luxury Residential"). */
  department: string;
  /** Entra ID security group IDs that receive default read-only access. */
  defaultViewerGroupIds: string[];
  /** Human-readable group name labels (for display only). */
  defaultViewerGroupNames: string;
  /** Whether this policy row is active. Inactive rows are ignored at runtime. */
  isActive: boolean;
  /** ISO 8601 timestamp of the last admin review. */
  lastReviewedAt?: string;
  /** Free-form admin notes. */
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence DTO — matches the live SharePoint list schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw SharePoint list item shape for the `projectViewerGroups` list.
 * Property names are the SharePoint internal names.
 */
export interface IViewerGroupsListItem {
  /** Department key — the SharePoint `Title` column repurposed as department identifier. */
  Title: string;
  /** JSON-serialized `string[]` of Entra ID group IDs. SP type: Note (MultiLineText). */
  DefaultViewerGroupIdsJson: string;
  /** Human-readable group names. SP type: Text (255). */
  DefaultViewerGroupNames: string;
  /** Active flag. SP type: Choice (Yes/No). */
  IsActive: string;
  /** Last review timestamp. SP type: DateTime. */
  LastReviewedAt: string;
  /** Free-form notes. SP type: Note (MultiLineText). */
  Notes: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field map
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapping entry for a viewer-groups field.
 */
export interface IViewerGroupsFieldMapEntry {
  /** SharePoint internal name. */
  spInternalName: keyof IViewerGroupsListItem;
  /** SharePoint column type. */
  spType: 'Text' | 'Note' | 'Choice' | 'DateTime';
  /** Serialization strategy. */
  serialization: 'direct' | 'json-array' | 'choice-boolean';
}

/**
 * Authoritative field map for the projectViewerGroups list.
 * Keys are domain property names; values describe the SP column.
 */
export const VIEWER_GROUPS_FIELD_MAP = {
  department:              { spInternalName: 'Title',                    spType: 'Text',     serialization: 'direct' },
  defaultViewerGroupIds:   { spInternalName: 'DefaultViewerGroupIdsJson', spType: 'Note',     serialization: 'json-array' },
  defaultViewerGroupNames: { spInternalName: 'DefaultViewerGroupNames',  spType: 'Text',     serialization: 'direct' },
  isActive:                { spInternalName: 'IsActive',                 spType: 'Choice',   serialization: 'choice-boolean' },
  lastReviewedAt:          { spInternalName: 'LastReviewedAt',           spType: 'DateTime', serialization: 'direct' },
  notes:                   { spInternalName: 'Notes',                    spType: 'Note',     serialization: 'direct' },
} as const satisfies Record<string, IViewerGroupsFieldMapEntry>;

/**
 * All SharePoint internal names for `.select()` calls.
 */
export const VIEWER_GROUPS_SELECT_FIELDS: readonly (keyof IViewerGroupsListItem)[] = Object.values(
  VIEWER_GROUPS_FIELD_MAP,
).map((entry) => entry.spInternalName);
