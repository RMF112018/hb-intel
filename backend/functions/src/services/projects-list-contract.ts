/**
 * Projects list data contract — SharePoint persistence layer.
 *
 * This module defines the boundary between the domain model (`IProjectSetupRequest`
 * from `@hbc/models`) and the SharePoint Projects list storage schema.
 *
 * The HBCentral Projects list was created via CSV import, so custom columns have
 * generic internal names (`field_1`..`field_24`). The `Year` column was added
 * post-import and retains its display name as internal name.
 *
 * Domain logic should never reference `field_N` names directly.
 * SharePoint persistence logic should never assume domain property names match
 * storage column names.
 *
 * Mapping functions are implemented in `projects-list-mapper.ts`.
 *
 * @see Phase-2_Field-Map-Baseline.md for the complete mapping matrix
 * @see Phase-2_Normalization-Rules.md for type conversion and null handling
 */

// ─────────────────────────────────────────────────────────────────────────────
// List metadata
// ─────────────────────────────────────────────────────────────────────────────

/** SharePoint list title used by the Projects list on HBCentral. */
export const PROJECTS_LIST_NAME = 'Projects';

// ─────────────────────────────────────────────────────────────────────────────
// Persistence DTO — matches the production SharePoint list schema exactly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw SharePoint list item shape for the HBCentral Projects list.
 *
 * Every property name is the SharePoint *internal* name — not the display name.
 * This type is what PnPjs returns on read and what must be passed on write.
 *
 * Fields marked as `Number` in SharePoint may store string content (e.g. ISO
 * dates, UPNs) due to the CSV import origin — see normalization rules.
 */
export interface IProjectsListItem {
  /** Standard SP column. Computed: `"{projectNumber} — {projectName}"`. */
  Title: string;

  /** ProjectId — primary key for request lookup. */
  field_1: string;
  /** ProjectNumber — format `##-###-##`. */
  field_2: string;
  /** ProjectName. */
  field_3: string;
  /** ProjectLocation — legacy derived location summary. */
  field_4: string;
  /** ProjectType — Choice column. */
  field_5: string;
  /** ProjectStage — Choice column. */
  field_6: string;
  /** SubmittedBy — UPN. */
  field_7: string;
  /** SubmittedAt — ISO 8601 string (stored as SP Number). */
  field_8: string | number;
  /** RequestState — Choice column (ProjectSetupRequestState values). */
  field_9: string;
  /** GroupMembersJson — JSON-serialized `string[]`. */
  field_10: string;
  /** GroupLeadersJson — JSON-serialized `string[]`. */
  field_11: string;
  /** Department — Choice column (`commercial` | `luxury-residential`). */
  field_12: string;
  /** EstimatedValue — Number. */
  field_13: number | null;
  /** ClientName. */
  field_14: string;
  /** StartDate — ISO 8601 string (stored as SP Number). */
  field_15: string | number;
  /** ContractType — Choice column. */
  field_16: string;
  /** ProjectLeadId — UPN. */
  field_17: string;
  /** ViewerUPNsJson — JSON-serialized `string[]`. */
  field_18: string;
  /** AddOnsJson — JSON-serialized `string[]`. */
  field_19: string;
  /** ClarificationNote (stored as SP Number — may return `0` for empty). */
  field_20: string | number;
  /** CompletedBy (stored as SP Number — may return `0` for empty). */
  field_21: string | number;
  /** CompletedAt (stored as SP Number — may return `0` for empty). */
  field_22: string | number;
  /** SiteUrl — URL. */
  field_23: string;
  /** RetryCount — Number. */
  field_24: number;
  /** Year — Number (post-import column, uses display name as internal name). */
  Year: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field map — single authoritative mapping between domain and SP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapping entry linking a domain property to its SharePoint internal name,
 * the SP type, and serialization category.
 */
export interface IFieldMapEntry {
  /** SharePoint internal name (`field_N`, `Title`, `Year`). */
  spInternalName: keyof IProjectsListItem;
  /** SharePoint column type as created. */
  spType: 'Text' | 'Number' | 'Choice' | 'MultiLineText' | 'DateTime' | 'URL';
  /** How the value is serialized to/from SharePoint. */
  serialization: 'direct' | 'json-array' | 'number' | 'computed';
}

/**
 * Authoritative field map for the Projects list.
 *
 * Keys are domain property names (matching `IProjectSetupRequest`).
 * Values describe the corresponding SharePoint column.
 *
 * Only mapped fields are persisted. Domain properties not listed here
 * (e.g. `projectStreetAddress`, `projectExecutiveUpn`) are intentionally
 * unmapped — see Phase-2_Data-Contract-Gaps.md.
 */
export const PROJECTS_LIST_FIELD_MAP = {
  // ── Identity ───────────────────────────────────────────────────────────
  _title:          { spInternalName: 'Title',    spType: 'Text',          serialization: 'computed' },
  requestId:       { spInternalName: 'field_1',  spType: 'Text',          serialization: 'direct' },
  projectNumber:   { spInternalName: 'field_2',  spType: 'Text',          serialization: 'direct' },
  projectName:     { spInternalName: 'field_3',  spType: 'Text',          serialization: 'direct' },

  // ── Location ───────────────────────────────────────────────────────────
  projectLocation: { spInternalName: 'field_4',  spType: 'Text',          serialization: 'direct' },

  // ── Classification ─────────────────────────────────────────────────────
  projectType:     { spInternalName: 'field_5',  spType: 'Choice',        serialization: 'direct' },
  projectStage:    { spInternalName: 'field_6',  spType: 'Choice',        serialization: 'direct' },

  // ── Submission ─────────────────────────────────────────────────────────
  submittedBy:     { spInternalName: 'field_7',  spType: 'Text',          serialization: 'direct' },
  submittedAt:     { spInternalName: 'field_8',  spType: 'Number',        serialization: 'direct' },
  state:           { spInternalName: 'field_9',  spType: 'Choice',        serialization: 'direct' },

  // ── Team (JSON arrays) ────────────────────────────────────────────────
  groupMembers:    { spInternalName: 'field_10', spType: 'MultiLineText', serialization: 'json-array' },
  groupLeaders:    { spInternalName: 'field_11', spType: 'MultiLineText', serialization: 'json-array' },

  // ── Business details ──────────────────────────────────────────────────
  department:      { spInternalName: 'field_12', spType: 'Choice',        serialization: 'direct' },
  estimatedValue:  { spInternalName: 'field_13', spType: 'Number',        serialization: 'number' },
  clientName:      { spInternalName: 'field_14', spType: 'Text',          serialization: 'direct' },
  startDate:       { spInternalName: 'field_15', spType: 'Number',        serialization: 'direct' },
  contractType:    { spInternalName: 'field_16', spType: 'Choice',        serialization: 'direct' },
  projectLeadId:   { spInternalName: 'field_17', spType: 'Text',          serialization: 'direct' },
  viewerUPNs:      { spInternalName: 'field_18', spType: 'MultiLineText', serialization: 'json-array' },
  addOns:          { spInternalName: 'field_19', spType: 'MultiLineText', serialization: 'json-array' },

  // ── Clarification ─────────────────────────────────────────────────────
  clarificationNote: { spInternalName: 'field_20', spType: 'Number',      serialization: 'direct' },

  // ── Completion ────────────────────────────────────────────────────────
  completedBy:     { spInternalName: 'field_21', spType: 'Number',        serialization: 'direct' },
  completedAt:     { spInternalName: 'field_22', spType: 'Number',        serialization: 'direct' },
  siteUrl:         { spInternalName: 'field_23', spType: 'URL',           serialization: 'direct' },

  // ── Retry & Year ──────────────────────────────────────────────────────
  retryCount:      { spInternalName: 'field_24', spType: 'Number',        serialization: 'number' },
  year:            { spInternalName: 'Year',     spType: 'Number',        serialization: 'number' },
} as const satisfies Record<string, IFieldMapEntry>;

/** Domain property names that have a corresponding SharePoint column. */
export type MappedDomainProperty = keyof typeof PROJECTS_LIST_FIELD_MAP;

/**
 * All SharePoint internal names used in `.select()` calls.
 * Derived from the field map to prevent drift.
 */
export const PROJECTS_LIST_SELECT_FIELDS: readonly (keyof IProjectsListItem)[] = Object.values(
  PROJECTS_LIST_FIELD_MAP,
).map((entry) => entry.spInternalName);
