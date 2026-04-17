/**
 * Data contract for the Project Sites web part.
 *
 * Defines the normalized shape returned to the UI after querying the
 * HBCentral Projects list. The UI supports both year-scoped browsing
 * and an `All Projects` scope (W01r-P12), plus client-side search,
 * sort, and advanced filters over the normalized entry set.
 *
 * IMPORTANT — Field name mapping:
 * The HBCentral Projects list was created from an import. The older
 * columns use generic internal names (`field_1`, `field_2`, …), while
 * newer columns (W01r-P12 added set) use their display name as their
 * internal name. The mapping below is confirmed from the live list
 * schema export (`/Users/bobbyfetting/Downloads/Projects-List-Schema.csv`,
 * 2026-04-09).
 *
 * The normalizer reads raw items by their confirmed internal names,
 * with display-name fallbacks for forward compatibility if the list
 * is ever re-provisioned.
 */

// ── SharePoint field name mapping ──────────────────────────────────────────

/**
 * Confirmed internal-to-display field mapping for the HBCentral Projects list.
 *
 * - Standard SP fields (`Id`, `Title`, `Year`) use their display name as internal name.
 * - Older custom fields use generic `field_N` internal names (from CSV import origin).
 * - Newer custom fields (W01r-P12 set) use their display name as internal name.
 */
export const SP_PROJECTS_FIELDS = {
  // Standard fields — internal name matches display name
  ID: 'Id',
  TITLE: 'Title',
  YEAR: 'Year',

  // Legacy custom fields — internal name is field_N (from CSV import)
  // Display name            -> Internal name
  PROJECT_ID: 'field_1',        // ProjectId (not exposed in UI; internal only)
  PROJECT_NUMBER: 'field_2',    // ProjectNumber
  PROJECT_NAME: 'field_3',      // ProjectName
  PROJECT_LOCATION: 'field_4',  // ProjectLocation (legacy free-text summary)
  PROJECT_TYPE: 'field_5',      // ProjectType
  PROJECT_STAGE: 'field_6',     // ProjectStage
  DEPARTMENT: 'field_12',       // Department
  CLIENT_NAME: 'field_14',      // ClientName
  SITE_URL: 'field_23',         // SiteUrl

  // W01r-P12 added fields — internal name matches display name
  OFFICE_DIVISION: 'officeDivision',
  PROCORE_PROJECT: 'procoreProject',
  PROJECT_STREET_ADDRESS: 'projectStreetAddress',
  PROJECT_CITY: 'projectCity',
  PROJECT_COUNTY: 'projectCounty',
  PROJECT_STATE: 'projectState',
  PROJECT_ZIP: 'projectZip',
  PROJECT_EXECUTIVE_UPN: 'projectExecutiveUpn',
  PROJECT_MANAGER_UPN: 'projectManagerUpn',
  LEAD_ESTIMATOR_UPN: 'leadEstimatorUpn',
  SUPPORTING_ESTIMATOR_UPNS: 'supportingEstimatorUpns',
} as const;

// ── Raw SharePoint list item shape ─────────────────────────────────────────

/**
 * Raw item from PnPjs — typed as Record<string, unknown> because
 * the list uses a mix of generic field_N and display-name internal names.
 */
export type IRawProjectSiteItem = Record<string, unknown>;

/**
 * Explicit selected-field contract for Projects list reads.
 * This is the canonical adapter field list for Project Sites queries.
 */
export const PROJECT_SITES_SELECT_FIELDS = [
  SP_PROJECTS_FIELDS.ID,
  SP_PROJECTS_FIELDS.TITLE,
  SP_PROJECTS_FIELDS.YEAR,
  SP_PROJECTS_FIELDS.PROJECT_ID,
  SP_PROJECTS_FIELDS.PROJECT_NUMBER,
  SP_PROJECTS_FIELDS.PROJECT_NAME,
  SP_PROJECTS_FIELDS.PROJECT_LOCATION,
  SP_PROJECTS_FIELDS.PROJECT_TYPE,
  SP_PROJECTS_FIELDS.PROJECT_STAGE,
  SP_PROJECTS_FIELDS.DEPARTMENT,
  SP_PROJECTS_FIELDS.CLIENT_NAME,
  SP_PROJECTS_FIELDS.SITE_URL,
  SP_PROJECTS_FIELDS.OFFICE_DIVISION,
  SP_PROJECTS_FIELDS.PROCORE_PROJECT,
  SP_PROJECTS_FIELDS.PROJECT_STREET_ADDRESS,
  SP_PROJECTS_FIELDS.PROJECT_CITY,
  SP_PROJECTS_FIELDS.PROJECT_COUNTY,
  SP_PROJECTS_FIELDS.PROJECT_STATE,
  SP_PROJECTS_FIELDS.PROJECT_ZIP,
  SP_PROJECTS_FIELDS.PROJECT_EXECUTIVE_UPN,
  SP_PROJECTS_FIELDS.PROJECT_MANAGER_UPN,
  SP_PROJECTS_FIELDS.LEAD_ESTIMATOR_UPN,
  SP_PROJECTS_FIELDS.SUPPORTING_ESTIMATOR_UPNS,
] as const;

/** Bounded All Projects cap for repository reads. */
export const PROJECT_SITES_ALL_SCOPE_LIMIT = 2000;

// ── Normalized UI-ready record ─────────────────────────────────────────────

/**
 * Normalized, UI-ready record for a single project site.
 *
 * Ownership contract:
 * - Shared with the UI (`ProjectSitesRoot`, `ProjectSiteCard`), the client-side
 *   filter pipeline (`projectSitesFilter.ts`), and the hook layer.
 * - Intentionally flat and user-facing — no raw SharePoint field names.
 * - `ProjectId` is deliberately NOT exposed as a user-facing concern
 *   (see `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md`).
 */
export interface IProjectSiteEntry {
  // Identity
  id: number;
  projectName: string;
  projectNumber: string;
  year: number;

  // Classification
  department: string;
  officeDivision: string;
  projectType: string;
  projectStage: string;

  // Client
  clientName: string;

  // Legacy free-text location (kept for backward compat / display fallback)
  projectLocation: string;

  // Structured location — W01r-P12 expansion
  projectStreetAddress: string;
  projectCity: string;
  projectCounty: string;
  projectState: string;
  projectZip: string;

  // People (UPN strings; display-label resolution is a future follow-up)
  projectExecutiveUpn: string;
  projectManagerUpn: string;
  leadEstimatorUpn: string;
  supportingEstimatorUpns: string[];

  // Integrations
  procoreProject: string;

  // Site state
  siteUrl: string;
  hasSiteUrl: boolean;
  dataQuality: IProjectSiteDataQuality;
  launchStatus: IProjectSiteLaunchStatus;
}

export type ProjectSiteDataIssueCode =
  | 'missing-project-name'
  | 'missing-project-number'
  | 'invalid-year'
  | 'missing-site-url'
  | 'malformed-site-url';

export interface IProjectSiteDataQuality {
  classification: 'complete' | 'partial' | 'malformed';
  issues: ProjectSiteDataIssueCode[];
  hasAnyIssue: boolean;
  hasLaunchCriticalIssue: boolean;
}

export type ProjectSiteLaunchState =
  | 'live'
  | 'provisioning'
  | 'archived'
  | 'attention-needed';

export type ProjectSiteLaunchReasonCode =
  | 'live-site-ready'
  | 'inactive-stage-live-site'
  | 'inactive-stage-no-site'
  | 'site-not-provisioned'
  | 'critical-data-issue';

export interface IProjectSiteLaunchStatus {
  state: ProjectSiteLaunchState;
  reasonCode: ProjectSiteLaunchReasonCode;
  isLaunchable: boolean;
  userMessage: string;
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

// ── Project-sites scope model ──────────────────────────────────────────────

/**
 * W01r-P12: Scope discriminated union. Replaces the previous year-only
 * selector with a cleaner model that supports an `All Projects` view.
 */
export type ProjectSitesScope =
  | { kind: 'year'; year: number }
  | { kind: 'all' };

export const SCOPE_ALL: ProjectSitesScope = { kind: 'all' };

export function scopeFromYear(year: number): ProjectSitesScope {
  return { kind: 'year', year };
}

export function scopesEqual(a: ProjectSitesScope, b: ProjectSitesScope): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'year' && b.kind === 'year') return a.year === b.year;
  return true;
}

// ── Runtime config and scope-authority contract ───────────────────────────

/**
 * Shell-injected runtime configuration for the Project Sites mount boundary.
 * Unknown fields are tolerated; the normalizer below extracts only the
 * fields that matter to Project Sites year-context authority.
 */
export interface IProjectSitesMountRuntimeConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
  hostPageYear?: unknown;
  functionAppUrl?: unknown;
  backendMode?: unknown;
  allowBackendModeSwitch?: unknown;
  apiAudience?: unknown;
  assetBaseUrl?: unknown;
}

export interface IProjectSitesRuntimeContext {
  webPartId: string | null;
  yearOverride: number | null;
  hostPageYear: number | null;
  functionAppUrl: string | null;
  backendMode: string | null;
  allowBackendModeSwitch: boolean | null;
  apiAudience: string | null;
  assetBaseUrl: string | null;
}

export type ProjectSitesScopeSource =
  | 'author-override'
  | 'host-page-year'
  | 'default-year'
  | 'all-projects-fallback'
  | 'user-selected';

export interface IResolvedProjectSitesScope {
  scope: ProjectSitesScope;
  source: ProjectSitesScopeSource;
  resolvedYear: number | null;
}

export function parseProjectSitesRuntimeYear(value: unknown): number | null {
  if (typeof value === 'number') {
    return isValidYear(value) ? value : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(trimmed)) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return isValidYear(parsed) ? parsed : null;
  }
  return null;
}

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function parseYearOverride(value: unknown): number | null {
  // Authoring semantics: 0 or blank means "no override".
  if (value === 0 || value === '0' || value === '' || value === null || value === undefined) {
    return null;
  }
  return parseProjectSitesRuntimeYear(value);
}

export function normalizeProjectSitesRuntimeConfig(
  config?: IProjectSitesMountRuntimeConfig,
): IProjectSitesRuntimeContext {
  const rawWebPartProperties =
    typeof config?.webPartProperties === 'object' && config.webPartProperties !== null
      ? (config.webPartProperties as Record<string, unknown>)
      : null;

  return {
    webPartId: parseOptionalString(config?.webPartId),
    yearOverride: parseYearOverride(rawWebPartProperties?.yearOverride),
    hostPageYear: parseProjectSitesRuntimeYear(config?.hostPageYear),
    functionAppUrl: parseOptionalString(config?.functionAppUrl),
    backendMode: parseOptionalString(config?.backendMode),
    allowBackendModeSwitch: parseOptionalBoolean(config?.allowBackendModeSwitch),
    apiAudience: parseOptionalString(config?.apiAudience),
    assetBaseUrl: parseOptionalString(config?.assetBaseUrl),
  };
}

export function resolveInitialProjectSitesScope(
  availableYears: number[],
  runtimeContext: IProjectSitesRuntimeContext | null,
): IResolvedProjectSitesScope {
  // Authoritative resolution order:
  // 1) valid author override
  // 2) valid host page year context
  // 3) fallback default year (current year if present, else newest)
  // 4) explicit All Projects fallback only when no year can be resolved
  if (runtimeContext?.yearOverride !== null && runtimeContext?.yearOverride !== undefined) {
    return {
      scope: scopeFromYear(runtimeContext.yearOverride),
      source: 'author-override',
      resolvedYear: runtimeContext.yearOverride,
    };
  }

  if (runtimeContext?.hostPageYear !== null && runtimeContext?.hostPageYear !== undefined) {
    return {
      scope: scopeFromYear(runtimeContext.hostPageYear),
      source: 'host-page-year',
      resolvedYear: runtimeContext.hostPageYear,
    };
  }

  const defaultYear = resolveDefaultYear(availableYears);
  if (defaultYear !== null) {
    return {
      scope: scopeFromYear(defaultYear),
      source: 'default-year',
      resolvedYear: defaultYear,
    };
  }

  return {
    scope: SCOPE_ALL,
    source: 'all-projects-fallback',
    resolvedYear: null,
  };
}

// ── Project sites query result ─────────────────────────────────────────────

export type ProjectSitesStatus = 'loading' | 'error' | 'empty' | 'success';

export interface IProjectSitesResult {
  status: ProjectSitesStatus;
  scope: ProjectSitesScope;
  entries: IProjectSiteEntry[];
  errorMessage: string | null;
}

// ── Sort model ─────────────────────────────────────────────────────────────

/**
 * User-facing sort options for the Project Sites surface.
 *
 * Values are stable string keys (safe to persist in URL / storage later).
 */
export type ProjectSitesSortKey =
  | 'name-asc'
  | 'name-desc'
  | 'number-asc'
  | 'number-desc'
  | 'year-desc'
  | 'year-asc';

export const DEFAULT_SORT_KEY: ProjectSitesSortKey = 'number-asc';

export interface SortOption {
  value: ProjectSitesSortKey;
  label: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'number-asc', label: 'Project Number (Asc)' },
  { value: 'number-desc', label: 'Project Number (Desc)' },
  { value: 'name-asc', label: 'Project Name (A–Z)' },
  { value: 'name-desc', label: 'Project Name (Z–A)' },
  { value: 'year-desc', label: 'Year (Newest)' },
  { value: 'year-asc', label: 'Year (Oldest)' },
] as const;

// ── Filter model ───────────────────────────────────────────────────────────

/**
 * User-facing advanced filter state for the Project Sites surface.
 *
 * All fields are optional; an empty `ProjectSitesFilters` means "no filters".
 * Multi-select fields accept an array of values — an entry matches if its
 * field value is in the selected set (logical OR inside a field, logical
 * AND across fields).
 */
export interface ProjectSitesFilters {
  /** Multi-select by project stage (case-insensitive compare). */
  stages: string[];
  /** Multi-select by project manager UPN. */
  projectManagerUpns: string[];
  /** Multi-select by lead estimator UPN. */
  leadEstimatorUpns: string[];
  /** Multi-select by project executive UPN. */
  projectExecutiveUpns: string[];
  /** Multi-select by department. */
  departments: string[];
  /** Multi-select by office division. */
  officeDivisions: string[];
  /** Only show entries with a live site URL (true), or no site (false), or any (undefined). */
  hasSiteOnly?: boolean;
}

export const EMPTY_FILTERS: ProjectSitesFilters = {
  stages: [],
  projectManagerUpns: [],
  leadEstimatorUpns: [],
  projectExecutiveUpns: [],
  departments: [],
  officeDivisions: [],
  hasSiteOnly: undefined,
};

export function filtersAreEmpty(f: ProjectSitesFilters): boolean {
  return (
    f.stages.length === 0 &&
    f.projectManagerUpns.length === 0 &&
    f.leadEstimatorUpns.length === 0 &&
    f.projectExecutiveUpns.length === 0 &&
    f.departments.length === 0 &&
    f.officeDivisions.length === 0 &&
    f.hasSiteOnly === undefined
  );
}

export function countActiveFilters(f: ProjectSitesFilters): number {
  return (
    f.stages.length +
    f.projectManagerUpns.length +
    f.leadEstimatorUpns.length +
    f.projectExecutiveUpns.length +
    f.departments.length +
    f.officeDivisions.length +
    (f.hasSiteOnly !== undefined ? 1 : 0)
  );
}

// ── Default year resolution ────────────────────────────────────────────────

export function resolveDefaultYear(availableYears: number[]): number | null {
  if (availableYears.length === 0) return null;
  const currentYear = new Date().getFullYear();
  return availableYears.includes(currentYear) ? currentYear : availableYears[0];
}
