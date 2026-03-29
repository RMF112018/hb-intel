/**
 * Normalizes a raw SharePoint Projects list item into a UI-ready IProjectSiteEntry.
 *
 * SharePoint internal field names often differ from display names.
 * This normalizer searches each raw item's keys using case-insensitive
 * matching with known name variants, making it resilient to whatever
 * internal names SharePoint assigned during column creation.
 *
 * The Title field (standard SP column) contains "{number} — {name}" format
 * and is used as the primary fallback for project name and number.
 */
import type { IProjectSiteEntry } from './types.js';

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
 *   - SP REST expanded: { __metadata: {...}, Url: "...", Description: "..." }
 *   - null / undefined
 *
 * This function handles all cases and returns a trimmed URL or ''.
 */
function extractUrl(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // SharePoint Hyperlink field: { Url: "...", Description: "..." }
    if (typeof obj.Url === 'string') return obj.Url.trim();
    if (typeof obj.url === 'string') return obj.url.trim();
    // SP REST sometimes nests: { __deferred: { uri: "..." } }
    if (typeof obj.uri === 'string') return obj.uri.trim();
  }
  return '';
}

/**
 * Find a field value from a raw SP item by trying multiple possible key names.
 * SharePoint internal names can be: exact match, with OData prefix, with
 * _x00XX_ encoding, or with numeric suffix (e.g., SiteUrl0, SiteUrl1).
 *
 * @param item - Raw SharePoint list item (Record<string, unknown>)
 * @param candidates - Possible field name substrings to match (case-insensitive)
 * @returns The first matching value found, or undefined
 */
function findField(item: Record<string, unknown>, candidates: string[]): unknown {
  // First pass: try exact key matches (fastest)
  for (const key of candidates) {
    if (key in item) return item[key];
  }

  // Second pass: case-insensitive substring match against all item keys
  const lowerCandidates = candidates.map((c) => c.toLowerCase());
  for (const key of Object.keys(item)) {
    const lowerKey = key.toLowerCase();
    for (const candidate of lowerCandidates) {
      if (lowerKey === candidate || lowerKey.endsWith(candidate.toLowerCase())) {
        return item[key];
      }
    }
  }

  return undefined;
}

/**
 * Parse the Title field which uses "{number} — {name}" format.
 * Returns [projectNumber, projectName] or ['', title] if no separator found.
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
 */
export function normalizeProjectSiteEntry(raw: Record<string, unknown>): IProjectSiteEntry {
  const item = raw as Record<string, unknown>;

  // Standard fields (always use these exact names)
  const id = typeof item.Id === 'number' ? item.Id : (typeof item.ID === 'number' ? item.ID : 0);
  const title = safeString(item.Title);
  const year = typeof item.Year === 'number' ? item.Year : 0;

  // Parse Title for fallback name/number
  const [parsedNumber, parsedName] = title ? parseTitle(title) : ['', ''];

  // Custom fields — search by multiple possible internal names
  const siteUrlRaw = findField(item, ['SiteUrl', 'Site_x0020_Url', 'siteurl', 'Site Url']);
  const projectNameRaw = findField(item, ['ProjectName', 'Project_x0020_Name', 'projectname']);
  const projectNumberRaw = findField(item, ['ProjectNumber', 'Project_x0020_Number', 'projectnumber']);
  const departmentRaw = findField(item, ['Department', 'department']);
  const locationRaw = findField(item, ['ProjectLocation', 'Project_x0020_Location', 'projectlocation']);
  const typeRaw = findField(item, ['ProjectType', 'Project_x0020_Type', 'projecttype']);
  const stageRaw = findField(item, ['ProjectStage', 'Project_x0020_Stage', 'projectstage']);
  const clientRaw = findField(item, ['ClientName', 'Client_x0020_Name', 'clientname']);

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
