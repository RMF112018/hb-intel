/**
 * Normalizes raw SharePoint Projects list items into UI-ready IProjectSiteEntry records.
 *
 * Uses the confirmed internal field name mapping (field_1 through field_23)
 * from the HBCentral Projects list schema. No fuzzy matching — direct key access
 * using the known internal names.
 *
 * The Title field ("{number} — {name}") is used as a fallback when the dedicated
 * ProjectName (field_3) or ProjectNumber (field_2) fields are empty.
 */
import type { IProjectSiteEntry } from './types.js';
import { SP_PROJECTS_FIELDS } from './types.js';

/**
 * Safely coerce a value to a trimmed string.
 */
function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

/**
 * Extract a usable URL string from a SharePoint field value.
 *
 * SharePoint URL/Hyperlink columns can return:
 *   - Plain string: "https://..."
 *   - Hyperlink object: { Url: "https://...", Description: "..." }
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

/**
 * Parse the Title field which uses "{number} — {name}" or "{number} - {name}" format.
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

/**
 * Normalize a single raw SharePoint list item into a UI-ready record.
 *
 * Reads fields by their confirmed internal names (field_N) with display-name
 * fallbacks for forward compatibility if the list is ever re-provisioned.
 */
export function normalizeProjectSiteEntry(raw: Record<string, unknown>): IProjectSiteEntry {
  // Standard fields
  const id = typeof raw.Id === 'number' ? raw.Id : (typeof raw.ID === 'number' ? raw.ID : 0);
  const title = safeString(raw[SP_PROJECTS_FIELDS.TITLE]);
  const year = typeof raw[SP_PROJECTS_FIELDS.YEAR] === 'number'
    ? (raw[SP_PROJECTS_FIELDS.YEAR] as number)
    : 0;

  // Parse Title for fallback name/number
  const [parsedNumber, parsedName] = title ? parseTitle(title) : ['', ''];

  // Custom fields — read by confirmed internal name, fallback to display name
  const projectNameRaw = raw[SP_PROJECTS_FIELDS.PROJECT_NAME] ?? raw['ProjectName'];
  const projectNumberRaw = raw[SP_PROJECTS_FIELDS.PROJECT_NUMBER] ?? raw['ProjectNumber'];
  const siteUrlRaw = raw[SP_PROJECTS_FIELDS.SITE_URL] ?? raw['SiteUrl'];
  const departmentRaw = raw[SP_PROJECTS_FIELDS.DEPARTMENT] ?? raw['Department'];
  const locationRaw = raw[SP_PROJECTS_FIELDS.PROJECT_LOCATION] ?? raw['ProjectLocation'];
  const typeRaw = raw[SP_PROJECTS_FIELDS.PROJECT_TYPE] ?? raw['ProjectType'];
  const stageRaw = raw[SP_PROJECTS_FIELDS.PROJECT_STAGE] ?? raw['ProjectStage'];
  const clientRaw = raw[SP_PROJECTS_FIELDS.CLIENT_NAME] ?? raw['ClientName'];

  const projectName = safeString(projectNameRaw) || parsedName || '(Untitled Project)';
  const projectNumber = safeString(projectNumberRaw) || parsedNumber;
  const siteUrl = extractUrl(siteUrlRaw);

  return {
    id,
    projectName,
    projectNumber,
    siteUrl,
    year,
    department: safeString(departmentRaw),
    projectLocation: safeString(locationRaw),
    projectType: safeString(typeRaw),
    projectStage: safeString(stageRaw),
    clientName: safeString(clientRaw),
    hasSiteUrl: siteUrl.length > 0,
  };
}

/**
 * Normalize and sort an array of raw list items.
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
