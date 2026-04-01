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
  /** ViewerUPNs — JSON-serialized `string[]`. Named column added to live schema (replaces legacy field_18). */
  viewerUPNs: string;
  /** AddOns — JSON-serialized `string[]`. Named column added to live schema (replaces legacy field_19). */
  addOns: string;
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

  // ── Phase 2 gap fields (P2-07) ────────────────────────────────────────
  // Added to production schema 2026-03-31. These columns use domain
  // property names as SP internal names (unlike the CSV-import field_N
  // columns above).

  /** Structured location — street address. */
  projectStreetAddress: string;
  /** Structured location — city. */
  projectCity: string;
  /** Structured location — county. */
  projectCounty: string;
  /** Structured location — state. */
  projectState: string;
  /** Structured location — ZIP code (SP Number; domain stores as string). */
  projectZip: number | null;
  /** Office/division classification. */
  officeDivision: string;
  /** Procore project flag (`'Yes'` | `'No'` | `''`). */
  procoreProject: string;
  /** Project executive UPN. */
  projectExecutiveUpn: string;
  /** Project manager UPN. */
  projectManagerUpn: string;
  /** Lead estimator UPN. */
  leadEstimatorUpn: string;
  /** Supporting estimator UPNs — JSON-serialized `string[]` in SP MultiLineText. */
  supportingEstimatorUpns: string;
  /** Timberscan approver UPN. */
  timberscanApproverUpn: string;
  /** Sage 300 access UPNs — JSON-serialized `string[]` in SP MultiLineText. */
  sageAccessUpns: string;
  /** ISO 8601 timestamp when clarification was requested (SP DateTime). */
  clarificationRequestedAt: string;
  /** Whether requester used their retry opportunity (`'true'` | `'false'`). */
  requesterRetryUsed: string;
  /** Structured clarification items — JSON-serialized array in SP MultiLineText. */
  clarificationItems: string;

  // ── P9-G5-05: Stable identity fields ──────────────────────────────────
  // Added for oid-based ownership and actor attribution. Optional: absent
  // on pre-migration rows.

  /** P9-G5-05: Entra Object ID of the submitter. */
  submittedByOid: string;
  /** P9-G5-05: Entra Object ID of the user who completed the request. */
  completedByOid: string;
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
 * All canonical domain properties are mapped. Phase 2 gap fields were added
 * to the production schema on 2026-03-31 (P2-07) and use domain property
 * names as SP internal names.
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
  viewerUPNs:      { spInternalName: 'viewerUPNs', spType: 'MultiLineText', serialization: 'json-array' },
  addOns:          { spInternalName: 'addOns',     spType: 'MultiLineText', serialization: 'json-array' },

  // ── Clarification ─────────────────────────────────────────────────────
  clarificationNote: { spInternalName: 'field_20', spType: 'Number',      serialization: 'direct' },

  // ── Completion ────────────────────────────────────────────────────────
  completedBy:     { spInternalName: 'field_21', spType: 'Number',        serialization: 'direct' },
  completedAt:     { spInternalName: 'field_22', spType: 'Number',        serialization: 'direct' },
  siteUrl:         { spInternalName: 'field_23', spType: 'URL',           serialization: 'direct' },

  // ── Retry & Year ──────────────────────────────────────────────────────
  retryCount:      { spInternalName: 'field_24', spType: 'Number',        serialization: 'number' },
  year:            { spInternalName: 'Year',     spType: 'Number',        serialization: 'number' },

  // ── Phase 2 gap fields (P2-07) ────────────────────────────────────────
  // Added to production schema 2026-03-31. These columns use domain
  // property names as SP internal names.

  // Location (structured)
  projectStreetAddress: { spInternalName: 'projectStreetAddress', spType: 'Text',     serialization: 'direct' },
  projectCity:          { spInternalName: 'projectCity',          spType: 'Text',     serialization: 'direct' },
  projectCounty:        { spInternalName: 'projectCounty',       spType: 'Text',     serialization: 'direct' },
  projectState:         { spInternalName: 'projectState',        spType: 'Text',     serialization: 'direct' },
  projectZip:           { spInternalName: 'projectZip',          spType: 'Number',   serialization: 'number' },

  // Classification
  officeDivision:       { spInternalName: 'officeDivision',      spType: 'Text',     serialization: 'direct' },
  procoreProject:       { spInternalName: 'procoreProject',      spType: 'Text',     serialization: 'direct' },

  // Team roles
  projectExecutiveUpn:      { spInternalName: 'projectExecutiveUpn',      spType: 'Text',     serialization: 'direct' },
  projectManagerUpn:        { spInternalName: 'projectManagerUpn',        spType: 'Text',     serialization: 'direct' },
  leadEstimatorUpn:         { spInternalName: 'leadEstimatorUpn',         spType: 'Text',     serialization: 'direct' },
  supportingEstimatorUpns:  { spInternalName: 'supportingEstimatorUpns',  spType: 'MultiLineText', serialization: 'json-array' },
  timberscanApproverUpn:    { spInternalName: 'timberscanApproverUpn',    spType: 'Text',     serialization: 'direct' },
  sageAccessUpns:           { spInternalName: 'sageAccessUpns',           spType: 'MultiLineText', serialization: 'json-array' },

  // Clarification lifecycle
  clarificationRequestedAt:  { spInternalName: 'clarificationRequestedAt',  spType: 'DateTime', serialization: 'direct' },
  requesterRetryUsed:        { spInternalName: 'requesterRetryUsed',        spType: 'Text',     serialization: 'direct' },
  clarificationItems:        { spInternalName: 'clarificationItems',        spType: 'MultiLineText', serialization: 'json-array' },

  // ── P9-G5-05: Stable identity fields ──────────────────────────────────
  // Entra Object ID columns for oid-based ownership and actor attribution.
  // Absent on pre-migration rows; columns require manual SP admin creation.
  submittedByOid:            { spInternalName: 'submittedByOid',            spType: 'Text',          serialization: 'direct' },
  completedByOid:            { spInternalName: 'completedByOid',            spType: 'Text',          serialization: 'direct' },
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
