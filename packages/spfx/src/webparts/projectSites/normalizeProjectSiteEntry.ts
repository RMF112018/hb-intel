/**
 * Normalizes a raw SharePoint Projects list item into a UI-ready IProjectSiteEntry.
 *
 * Handles missing, null, and malformed field values defensively. Every field
 * resolves to a safe default so downstream UI code never encounters undefined.
 *
 * The Title field (standard SP column) contains "{number} — {name}" format.
 * When ProjectName is available (full select), it takes precedence.
 * When only core fields are available (fallback), Title is parsed.
 */
import type { IRawProjectSiteItem, IProjectSiteEntry } from './types.js';

/**
 * Safely coerce a SharePoint field value to a trimmed string.
 * Returns the fallback when the value is null, undefined, or not a string.
 */
function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

/**
 * Parse the Title field which uses "{number} — {name}" format.
 * Returns [projectNumber, projectName] or ['', title] if no separator found.
 */
function parseTitle(title: string): [string, string] {
  // Try both em-dash (—) and en-dash (–) and hyphen (-)
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
 * @param raw - Raw PnPjs list item from the Projects list
 * @returns Normalized IProjectSiteEntry
 */
export function normalizeProjectSiteEntry(raw: IRawProjectSiteItem): IProjectSiteEntry {
  const title = safeString(raw.Title);
  const [parsedNumber, parsedName] = title ? parseTitle(title) : ['', ''];

  // Prefer explicit ProjectName/ProjectNumber if available (full select),
  // otherwise fall back to parsed Title components (core-only select).
  const projectName = safeString(raw.ProjectName) || parsedName || '(Untitled Project)';
  const projectNumber = safeString(raw.ProjectNumber) || parsedNumber;
  const siteUrl = safeString(raw.SiteUrl);

  return {
    id: typeof raw.Id === 'number' ? raw.Id : 0,
    projectName,
    projectNumber,
    siteUrl,
    year: typeof raw.Year === 'number' ? raw.Year : 0,
    department: safeString(raw.Department),
    projectLocation: safeString(raw.ProjectLocation),
    projectType: safeString(raw.ProjectType),
    projectStage: safeString(raw.ProjectStage),
    clientName: safeString(raw.ClientName),
    hasSiteUrl: siteUrl.length > 0,
  };
}

/**
 * Normalize and sort an array of raw list items.
 *
 * Sort order: ProjectNumber ascending (deterministic, human-readable).
 * Items without a project number sort after numbered items.
 */
export function normalizeProjectSiteEntries(
  rawItems: IRawProjectSiteItem[],
): IProjectSiteEntry[] {
  return rawItems
    .map(normalizeProjectSiteEntry)
    .sort((a, b) => {
      // Items with project numbers come first
      if (a.projectNumber && !b.projectNumber) return -1;
      if (!a.projectNumber && b.projectNumber) return 1;
      // Lexicographic sort by project number
      if (a.projectNumber !== b.projectNumber) {
        return a.projectNumber.localeCompare(b.projectNumber);
      }
      // Fallback: alphabetical by project name
      return a.projectName.localeCompare(b.projectName);
    });
}
