/**
 * Data contract for the Project Sites web part.
 *
 * Defines the normalized shape returned to the UI after querying the
 * HBCentral Projects list filtered by page-level Year.
 *
 * Kept local to the web part — the Year field is a SharePoint list filter
 * column, not a core domain property of the provisioning model.
 *
 * @see .claude/plans/project-sites-webpart-validation-and-architecture-report.md
 */

// ── SharePoint field constants ─────────────────────────────────────────────

/**
 * Internal field names on the HBCentral Projects list.
 *
 * If the SharePoint internal name for `Year` differs from the display name
 * (e.g. `OData__x0059_ear`), update `YEAR` here — all queries and mappings
 * resolve through this constant.
 */
export const SP_PROJECTS_FIELDS = {
  ID: 'Id',
  PROJECT_NAME: 'ProjectName',
  PROJECT_NUMBER: 'ProjectNumber',
  SITE_URL: 'SiteUrl',
  YEAR: 'Year',
  DEPARTMENT: 'Department',
  PROJECT_LOCATION: 'ProjectLocation',
  PROJECT_TYPE: 'ProjectType',
  PROJECT_STAGE: 'ProjectStage',
  CLIENT_NAME: 'ClientName',
} as const;

/** The select clause sent to SharePoint — derived from the field constants. */
export const SP_PROJECTS_SELECT = [
  SP_PROJECTS_FIELDS.ID,
  SP_PROJECTS_FIELDS.PROJECT_NAME,
  SP_PROJECTS_FIELDS.PROJECT_NUMBER,
  SP_PROJECTS_FIELDS.SITE_URL,
  SP_PROJECTS_FIELDS.YEAR,
  SP_PROJECTS_FIELDS.DEPARTMENT,
  SP_PROJECTS_FIELDS.PROJECT_LOCATION,
  SP_PROJECTS_FIELDS.PROJECT_TYPE,
  SP_PROJECTS_FIELDS.PROJECT_STAGE,
  SP_PROJECTS_FIELDS.CLIENT_NAME,
] as const;

// ── Raw SharePoint list item shape ─────────────────────────────────────────

/** Raw item shape returned by PnPjs from the Projects list. */
export interface IRawProjectSiteItem {
  Id: number;
  ProjectName: string | null;
  ProjectNumber: string | null;
  SiteUrl: string | null;
  Year: number | null;
  Department: string | null;
  ProjectLocation: string | null;
  ProjectType: string | null;
  ProjectStage: string | null;
  ClientName: string | null;
}

// ── Normalized UI-ready record ─────────────────────────────────────────────

/** Normalized, UI-ready record for a single project site card. */
export interface IProjectSiteEntry {
  /** SharePoint list item ID. */
  id: number;
  /** Display name of the project. */
  projectName: string;
  /** Human-assigned project number (format: ##-###-##). Empty string if absent. */
  projectNumber: string;
  /** SharePoint site URL for the project. Empty string if not yet provisioned. */
  siteUrl: string;
  /** The fiscal/calendar year this project belongs to. */
  year: number;
  /** Department classification (e.g. "commercial", "luxury-residential"). */
  department: string;
  /** Geographic location of the project. */
  projectLocation: string;
  /** Project classification type. */
  projectType: string;
  /** Lifecycle stage ("Pursuit" | "Active" or empty). */
  projectStage: string;
  /** Client or owner name. */
  clientName: string;
  /** Whether the project has a usable site URL. */
  hasSiteUrl: boolean;
}

// ── Web part property contract ─────────────────────────────────────────────

/** SPFx property pane configuration for the Project Sites web part. */
export interface IProjectSitesWebPartProps {
  /**
   * Manual year override.
   *   - When > 0, takes priority over page metadata.
   *   - When 0 or absent, the web part reads the hosting page's Year column.
   */
  yearOverride: number;
}

// ── Page-year resolution result ────────────────────────────────────────────

export type PageYearSource = 'property-pane' | 'page-metadata';

export interface IResolvedPageYear {
  year: number;
  source: PageYearSource;
}

// ── Query result wrapper ───────────────────────────────────────────────────

export type ProjectSitesStatus =
  | 'no-year'
  | 'loading'
  | 'error'
  | 'empty'
  | 'success';

export interface IProjectSitesResult {
  status: ProjectSitesStatus;
  /** Resolved page year, or null if not available. */
  resolvedYear: IResolvedPageYear | null;
  /** Normalized project site entries. Empty array when not in 'success' status. */
  entries: IProjectSiteEntry[];
  /** Error message when status is 'error'. */
  errorMessage: string | null;
}
