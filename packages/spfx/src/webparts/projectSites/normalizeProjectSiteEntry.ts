/**
 * Normalizes raw SharePoint Projects list items into UI-ready `IProjectSiteEntry`
 * records.
 *
 * Uses the confirmed internal field name mapping (legacy `field_N` columns for
 * the older set, display-name internal names for the W01r-P12 added set) from
 * the HBCentral Projects list schema. No fuzzy matching — direct key access
 * using the known internal names, with display-name fallbacks for forward
 * compatibility if the list is ever re-provisioned.
 *
 * The Title field (`{number} — {name}`) is used as a fallback when the
 * dedicated ProjectName (`field_3`) or ProjectNumber (`field_2`) fields are
 * empty.
 */
import type {
  IProjectSiteEntry,
  IProjectSiteDataQuality,
  ProjectSiteDataIssueCode,
  ProjectSiteLaunchTargetKind,
} from './types.js';
import { PROJECT_SITES_FALLBACK_FIELDS, SP_PROJECTS_FIELDS, isValidYear } from './types.js';
import { deriveProjectSiteLaunchStatus } from './projectSiteLaunchState.js';

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Safely coerce a value to a trimmed string.
 */
function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

/**
 * Safely coerce a potentially-number/string zip value to a trimmed string.
 * The Projects list stores `projectZip` as a Number column, so raw values
 * come back as `number | null`.
 */
function safeZip(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

/**
 * Extract a usable URL string from a SharePoint field value.
 *
 * SharePoint URL/Hyperlink columns can return:
 *   - Plain string: "https://..."
 *   - Hyperlink object: `{ Url: "https://...", Description: "..." }`
 *   - null / undefined
 */
function extractUrl(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.Url === 'string') return obj.Url.trim();
    if (typeof obj.url === 'string') return obj.url.trim();
    if (typeof obj.uri === 'string') return obj.uri.trim();
  }
  return '';
}

function isHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Parse a Note-type SharePoint field value into an array of trimmed string
 * tokens. The `supportingEstimatorUpns` column is stored as a Note (text
 * blob). Accepted shapes:
 *
 *   - JSON array:     `'["a@x","b@y"]'`
 *   - Comma list:     `'a@x, b@y'`
 *   - Semicolon list: `'a@x; b@y'`
 *   - Plain array:    `['a@x', 'b@y']`
 *   - null / undefined → empty array
 */
function parseUpnList(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
  }
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  // Try JSON array first
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
      }
    } catch {
      // fall through to delimited parsing
    }
  }

  // Fall back to delimiter split
  return trimmed
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Parse the Title field which uses `{number} — {name}` or `{number} - {name}` format.
 */
function parseTitle(title: string): [string, string] {
  const separators = [' — ', ' – ', ' - '];
  for (const sep of separators) {
    const idx = title.indexOf(sep);
    if (idx > 0) {
      return [title.substring(0, idx).trim(), title.substring(idx + sep.length).trim()];
    }
  }
  return ['', title];
}

// ── Main normalizer ───────────────────────────────────────────────────────

/**
 * Normalize a single raw SharePoint list item into a UI-ready record.
 *
 * Reads fields by their confirmed internal names with display-name fallbacks
 * for forward compatibility if the list is ever re-provisioned.
 */
export function normalizeProjectSiteEntry(raw: Record<string, unknown>): IProjectSiteEntry {
  // Standard fields
  const id = typeof raw.Id === 'number' ? raw.Id : (typeof raw.ID === 'number' ? raw.ID : 0);
  const title = safeString(raw[SP_PROJECTS_FIELDS.TITLE]);
  const year = typeof raw[SP_PROJECTS_FIELDS.YEAR] === 'number'
    ? (raw[SP_PROJECTS_FIELDS.YEAR] as number)
    : Number.NaN;

  // Parse Title for fallback name/number
  const [parsedNumber, parsedName] = title ? parseTitle(title) : ['', ''];

  // Legacy custom fields — read by confirmed internal name, fallback to display name
  const projectNameRaw = raw[SP_PROJECTS_FIELDS.PROJECT_NAME] ?? raw['ProjectName'];
  const projectNumberRaw = raw[SP_PROJECTS_FIELDS.PROJECT_NUMBER] ?? raw['ProjectNumber'];
  const siteUrlRaw = raw[SP_PROJECTS_FIELDS.SITE_URL] ?? raw['SiteUrl'];
  const departmentRaw = raw[SP_PROJECTS_FIELDS.DEPARTMENT] ?? raw['Department'];
  const locationRaw = raw[SP_PROJECTS_FIELDS.PROJECT_LOCATION] ?? raw['ProjectLocation'];
  const typeRaw = raw[SP_PROJECTS_FIELDS.PROJECT_TYPE] ?? raw['ProjectType'];
  const stageRaw = raw[SP_PROJECTS_FIELDS.PROJECT_STAGE] ?? raw['ProjectStage'];
  const clientRaw = raw[SP_PROJECTS_FIELDS.CLIENT_NAME] ?? raw['ClientName'];

  // W01r-P12 added fields — read by display-name internal name
  const officeDivisionRaw = raw[SP_PROJECTS_FIELDS.OFFICE_DIVISION];
  const procoreProjectRaw = raw[SP_PROJECTS_FIELDS.PROCORE_PROJECT];
  const streetAddressRaw = raw[SP_PROJECTS_FIELDS.PROJECT_STREET_ADDRESS];
  const cityRaw = raw[SP_PROJECTS_FIELDS.PROJECT_CITY];
  const countyRaw = raw[SP_PROJECTS_FIELDS.PROJECT_COUNTY];
  const stateRaw = raw[SP_PROJECTS_FIELDS.PROJECT_STATE];
  const zipRaw = raw[SP_PROJECTS_FIELDS.PROJECT_ZIP];
  const executiveUpnRaw = raw[SP_PROJECTS_FIELDS.PROJECT_EXECUTIVE_UPN];
  const managerUpnRaw = raw[SP_PROJECTS_FIELDS.PROJECT_MANAGER_UPN];
  const leadEstimatorUpnRaw = raw[SP_PROJECTS_FIELDS.LEAD_ESTIMATOR_UPN];
  const supportingEstimatorUpnsRaw = raw[SP_PROJECTS_FIELDS.SUPPORTING_ESTIMATOR_UPNS];

  const projectName = safeString(projectNameRaw) || parsedName || '(Untitled Project)';
  const projectNumber = safeString(projectNumberRaw) || parsedNumber;
  const rawPrimarySiteUrl = extractUrl(siteUrlRaw);
  const primarySiteUrl = isHttpUrl(rawPrimarySiteUrl) ? rawPrimarySiteUrl : '';

  const rawLegacyFallbackFolderUrl = extractUrl(raw[PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_FOLDER_URL]);
  const legacyFallbackFolderUrl = isHttpUrl(rawLegacyFallbackFolderUrl) ? rawLegacyFallbackFolderUrl : '';
  const legacyFallbackSourceYearRaw = raw[PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_SOURCE_YEAR];
  const legacyFallbackSourceYear =
    typeof legacyFallbackSourceYearRaw === 'number' && Number.isInteger(legacyFallbackSourceYearRaw)
      ? legacyFallbackSourceYearRaw
      : null;
  const legacyFallbackMatchStatusRaw = safeString(raw[PROJECT_SITES_FALLBACK_FIELDS.LEGACY_FALLBACK_MATCH_STATUS]);
  const legacyFallbackMatchStatus: IProjectSiteEntry['legacyFallbackMatchStatus'] =
    legacyFallbackMatchStatusRaw === 'matched' ? 'matched' : '';

  const launchTargetKind: ProjectSiteLaunchTargetKind = primarySiteUrl
    ? 'primary-site'
    : legacyFallbackFolderUrl
      ? 'legacy-fallback'
      : 'none';
  const siteUrl = launchTargetKind === 'primary-site' ? primarySiteUrl : legacyFallbackFolderUrl;

  const issues: ProjectSiteDataIssueCode[] = [];
  if (!(safeString(projectNameRaw) || parsedName)) issues.push('missing-project-name');
  if (!(safeString(projectNumberRaw) || parsedNumber)) issues.push('missing-project-number');
  if (!isValidYear(year)) issues.push('invalid-year');
  if (!siteUrl) {
    issues.push('missing-site-url');
    if (rawPrimarySiteUrl && !primarySiteUrl && !legacyFallbackFolderUrl) {
      issues.push('malformed-site-url');
    }
  }

  const hasMalformedIssue = issues.includes('invalid-year') || issues.includes('malformed-site-url');
  const dataQuality: IProjectSiteDataQuality = {
    classification: issues.length === 0 ? 'complete' : (hasMalformedIssue ? 'malformed' : 'partial'),
    issues,
    hasAnyIssue: issues.length > 0,
    hasLaunchCriticalIssue:
      issues.includes('missing-project-name') ||
      issues.includes('missing-project-number') ||
      issues.includes('invalid-year') ||
      issues.includes('missing-site-url') ||
      issues.includes('malformed-site-url'),
  };
  const launchStatus = deriveProjectSiteLaunchStatus({
    hasPrimarySiteUrl: primarySiteUrl.length > 0,
    hasLegacyFallbackFolderUrl: legacyFallbackFolderUrl.length > 0,
    launchTargetKind,
    projectStage: safeString(stageRaw),
    dataQuality,
  });

  return {
    id,
    projectName,
    projectNumber,
    year,
    department: safeString(departmentRaw),
    officeDivision: safeString(officeDivisionRaw),
    projectType: safeString(typeRaw),
    projectStage: safeString(stageRaw),
    clientName: safeString(clientRaw),
    projectLocation: safeString(locationRaw),
    projectStreetAddress: safeString(streetAddressRaw),
    projectCity: safeString(cityRaw),
    projectCounty: safeString(countyRaw),
    projectState: safeString(stateRaw),
    projectZip: safeZip(zipRaw),
    projectExecutiveUpn: safeString(executiveUpnRaw),
    projectManagerUpn: safeString(managerUpnRaw),
    leadEstimatorUpn: safeString(leadEstimatorUpnRaw),
    supportingEstimatorUpns: parseUpnList(supportingEstimatorUpnsRaw),
    procoreProject: safeString(procoreProjectRaw),
    primarySiteUrl,
    legacyFallbackFolderUrl,
    legacyFallbackSourceYear,
    legacyFallbackMatchStatus,
    launchTargetKind,
    siteUrl,
    hasSiteUrl: siteUrl.length > 0,
    dataQuality,
    launchStatus,
  };
}

/**
 * Normalize an array of raw list items. Uses a stable default sort by
 * `projectNumber` then `projectName`, which the UI's sort pipeline will
 * override per the user's selected sort key.
 */
export function normalizeProjectSiteEntries(
  rawItems: Record<string, unknown>[],
): IProjectSiteEntry[] {
  return rawItems
    .map(normalizeProjectSiteEntry)
    .sort((a, b) => {
      if (a.projectNumber && !b.projectNumber) return -1;
      if (!a.projectNumber && b.projectNumber) return 1;
      if (a.projectNumber !== b.projectNumber) {
        return a.projectNumber.localeCompare(b.projectNumber);
      }
      return a.projectName.localeCompare(b.projectName);
    });
}
