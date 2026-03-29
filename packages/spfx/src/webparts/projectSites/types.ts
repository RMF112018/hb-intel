/**
 * Data contract for the Project Sites web part.
 *
 * Defines the normalized shape returned to the UI after querying the
 * HBCentral Projects list filtered by a user-selected Year value.
 *
 * Year selection is driven by a dynamic selector UI, not by page metadata.
 *
 * IMPORTANT — Field name mapping:
 * The HBCentral Projects list was created from an import. Most custom columns
 * have generic internal names (field_1, field_2, etc.) that differ from their
 * display names. The mapping below was confirmed from the actual list schema.
 */

// ── SharePoint field name mapping ──────────────────────────────────────────

/**
 * Confirmed internal-to-display field mapping for the HBCentral Projects list.
 *
 * Source: list schema export (2026-03-29).
 * Standard SP fields (Id, Title, Year) use their display name as internal name.
 * Custom fields use generic field_N internal names from the CSV import origin.
 */
export const SP_PROJECTS_FIELDS = {
  // Standard fields — internal name matches display name
  ID: 'Id',
  TITLE: 'Title',
  YEAR: 'Year',

  // Custom fields — internal name is field_N (from import)
  // Display name         -> Internal name
  PROJECT_ID: 'field_1',     // ProjectId
  PROJECT_NUMBER: 'field_2', // ProjectNumber
  PROJECT_NAME: 'field_3',   // ProjectName
  PROJECT_LOCATION: 'field_4', // ProjectLocation
  PROJECT_TYPE: 'field_5',   // ProjectType
  PROJECT_STAGE: 'field_6',  // ProjectStage
  DEPARTMENT: 'field_12',    // Department
  CLIENT_NAME: 'field_14',   // ClientName
  SITE_URL: 'field_23',      // SiteUrl
} as const;

// ── Raw SharePoint list item shape ─────────────────────────────────────────

/**
 * Raw item from PnPjs — typed as Record<string, unknown> because
 * the list uses generic field_N internal names.
 */
export type IRawProjectSiteItem = Record<string, unknown>;

// ── Normalized UI-ready record ─────────────────────────────────────────────

/** Normalized, UI-ready record for a single project site card. */
export interface IProjectSiteEntry {
  id: number;
  projectName: string;
  projectNumber: string;
  siteUrl: string;
  year: number;
  department: string;
  projectLocation: string;
  projectType: string;
  projectStage: string;
  clientName: string;
  hasSiteUrl: boolean;
}

// ── Year validation ────────────────────────────────────────────────────────

export const MIN_VALID_YEAR = 1900;
export const MAX_VALID_YEAR = 2100;

export function isValidYear(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_VALID_YEAR && value <= MAX_VALID_YEAR;
}

// ── Available years result ─────────────────────────────────────────────────

export type AvailableYearsStatus = 'loading' | 'error' | 'empty' | 'success';

export interface IAvailableYearsResult {
  status: AvailableYearsStatus;
  years: number[];
  errorMessage: string | null;
}

// ── Project sites query result ─────────────────────────────────────────────

export type ProjectSitesStatus = 'loading' | 'error' | 'empty' | 'success';

export interface IProjectSitesResult {
  status: ProjectSitesStatus;
  selectedYear: number;
  entries: IProjectSiteEntry[];
  errorMessage: string | null;
}

// ── Default year resolution ────────────────────────────────────────────────

export function resolveDefaultYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) return null;
  const currentYear = new Date().getFullYear();
  return availableYears.includes(currentYear) ? currentYear : availableYears[0];
}
