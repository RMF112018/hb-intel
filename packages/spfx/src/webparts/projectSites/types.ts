/**
 * Data contract for the Project Sites web part.
 *
 * Defines the normalized shape returned to the UI after querying the
 * HBCentral Projects list filtered by a user-selected Year value.
 *
 * Year selection is driven by a dynamic selector UI, not by page metadata.
 *
 * Field naming: the HBCentral Projects list has custom columns created by
 * the provisioning backend (ProjectName, ProjectNumber, SiteUrl, etc.) but
 * SharePoint internal names may differ from display names. The query uses
 * a resilient two-pass strategy: try full select first, fall back to
 * core-only select (Id, Title, Year) if any field doesn't resolve.
 */

// ── SharePoint field constants ─────────────────────────────────────────────

/**
 * Internal field names on the HBCentral Projects list.
 *
 * Title is the standard SP field used as "{number} — {name}".
 * Year is a confirmed Number column.
 * Other fields are custom columns that may have different internal names
 * depending on how they were provisioned.
 */
export const SP_PROJECTS_FIELDS = {
  /** SharePoint list item ID — always exists. */
  ID: 'Id',
  /** SharePoint standard Title column — "{number} — {name}" format. */
  TITLE: 'Title',
  /** Year column — confirmed Number type on HBCentral Projects list. */
  YEAR: 'Year',
  /** Custom fields — may not resolve by these names on all list instances. */
  PROJECT_NAME: 'ProjectName',
  PROJECT_NUMBER: 'ProjectNumber',
  SITE_URL: 'SiteUrl',
  DEPARTMENT: 'Department',
  PROJECT_LOCATION: 'ProjectLocation',
  PROJECT_TYPE: 'ProjectType',
  PROJECT_STAGE: 'ProjectStage',
  CLIENT_NAME: 'ClientName',
} as const;

/**
 * Core fields that are confirmed to exist on the HBCentral Projects list.
 * Used as fallback if the extended select fails with a 400.
 *
 * SiteUrl is included here because it's the primary action target for
 * card links — without it, cards render as non-clickable.
 */
export const SP_PROJECTS_CORE_SELECT = [
  SP_PROJECTS_FIELDS.ID,
  SP_PROJECTS_FIELDS.TITLE,
  SP_PROJECTS_FIELDS.YEAR,
  SP_PROJECTS_FIELDS.SITE_URL,
] as const;

/**
 * Extended select clause with additional metadata fields.
 * If this fails (e.g., an internal name differs), the query
 * automatically retries with SP_PROJECTS_CORE_SELECT.
 *
 * NOTE: ProjectName is intentionally excluded — SharePoint returns 400
 * because the internal name doesn't match the display name on this list.
 * The project name is extracted from the Title field ("{number} — {name}")
 * by the normalizer instead.
 */
export const SP_PROJECTS_FULL_SELECT = [
  SP_PROJECTS_FIELDS.ID,
  SP_PROJECTS_FIELDS.TITLE,
  SP_PROJECTS_FIELDS.YEAR,
  SP_PROJECTS_FIELDS.SITE_URL,
  SP_PROJECTS_FIELDS.PROJECT_NUMBER,
  SP_PROJECTS_FIELDS.DEPARTMENT,
  SP_PROJECTS_FIELDS.PROJECT_LOCATION,
  SP_PROJECTS_FIELDS.PROJECT_TYPE,
  SP_PROJECTS_FIELDS.PROJECT_STAGE,
  SP_PROJECTS_FIELDS.CLIENT_NAME,
] as const;

// ── Raw SharePoint list item shape ─────────────────────────────────────────

/**
 * Raw item shape returned by PnPjs from the Projects list.
 * Extended fields are optional — absent when using core-only fallback.
 */
export interface IRawProjectSiteItem {
  Id: number;
  Title: string | null;
  Year: number | null;
  // Extended fields — present only when full select succeeds
  ProjectName?: string | null;
  ProjectNumber?: string | null;
  SiteUrl?: string | null;
  Department?: string | null;
  ProjectLocation?: string | null;
  ProjectType?: string | null;
  ProjectStage?: string | null;
  ClientName?: string | null;
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

// ── Year validation ────────────────────────────────────────────────────────

/** Minimum plausible project year. */
export const MIN_VALID_YEAR = 1900;
/** Maximum plausible project year. */
export const MAX_VALID_YEAR = 2100;

/** Returns true if the value is a plausible 4-digit year. */
export function isValidYear(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_VALID_YEAR && value <= MAX_VALID_YEAR;
}

// ── Available years result ─────────────────────────────────────────────────

export type AvailableYearsStatus = 'loading' | 'error' | 'empty' | 'success';

export interface IAvailableYearsResult {
  status: AvailableYearsStatus;
  /** Distinct years sorted descending (newest first). Empty when not 'success'. */
  years: number[];
  /** Error message when status is 'error'. */
  errorMessage: string | null;
}

// ── Project sites query result ─────────────────────────────────────────────

export type ProjectSitesStatus = 'loading' | 'error' | 'empty' | 'success';

export interface IProjectSitesResult {
  status: ProjectSitesStatus;
  /** The year being queried. */
  selectedYear: number;
  /** Normalized project site entries. Empty array when not in 'success' status. */
  entries: IProjectSiteEntry[];
  /** Error message when status is 'error'. */
  errorMessage: string | null;
}

// ── Default year resolution ────────────────────────────────────────────────

/**
 * Resolve the default selected year from the available years list.
 * Prefers the current calendar year if present; otherwise the most recent year.
 * Returns null if the list is empty.
 */
export function resolveDefaultYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) return null;
  const currentYear = new Date().getFullYear();
  return availableYears.includes(currentYear) ? currentYear : availableYears[0];
}
