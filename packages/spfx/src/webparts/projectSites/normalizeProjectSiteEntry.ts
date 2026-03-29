/**
 * Normalizes a raw SharePoint Projects list item into a UI-ready IProjectSiteEntry.
 *
 * Handles missing, null, and malformed field values defensively. Every field
 * resolves to a safe default so downstream UI code never encounters undefined.
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
 * Normalize a single raw SharePoint list item into a UI-ready record.
 *
 * @param raw - Raw PnPjs list item from the Projects list
 * @returns Normalized IProjectSiteEntry
 */
export function normalizeProjectSiteEntry(raw: IRawProjectSiteItem): IProjectSiteEntry {
  const siteUrl = safeString(raw.SiteUrl);

  return {
    id: typeof raw.Id === 'number' ? raw.Id : 0,
    projectName: safeString(raw.ProjectName, '(Untitled Project)'),
    projectNumber: safeString(raw.ProjectNumber),
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
