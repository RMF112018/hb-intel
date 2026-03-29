/**
 * Page-year resolution seam for the Project Sites web part.
 *
 * Resolution order:
 *   1. Property pane override (yearOverride > 0) — for admin/testing use.
 *   2. Hosting page metadata via pageContext.listItem.fieldValues — production source.
 *   3. null — triggers "Year Not Configured" empty state.
 *
 * Contract: each unique year has its own Site Pages page in HBCentral/SitePages,
 * tagged with the appropriate page-level Year property.
 *
 * @see .claude/plans/project-sites-webpart-validation-and-architecture-report.md §3
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { IResolvedPageYear } from './types.js';
import { SP_PROJECTS_FIELDS } from './types.js';

/**
 * Resolve the active year for the Project Sites query.
 *
 * @param context    - SPFx WebPartContext (provides page metadata)
 * @param yearOverride - Value from the property pane (0 = use page metadata)
 * @returns Resolved year with source attribution, or null if unavailable
 */
export function resolvePageYear(
  context: WebPartContext,
  yearOverride: number,
): IResolvedPageYear | null {
  // 1. Property pane override
  if (typeof yearOverride === 'number' && yearOverride > 0) {
    return { year: yearOverride, source: 'property-pane' };
  }

  // 2. Page metadata from Site Pages library
  //    pageContext.listItem is available when the web part is placed on a
  //    modern page in a Site Pages library. fieldValues exposes both standard
  //    and custom columns as a Record<string, unknown>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- listItem.fieldValues is untyped for custom columns
  const fieldValues = (context.pageContext as any).listItem?.fieldValues as
    | Record<string, unknown>
    | undefined;

  if (fieldValues) {
    const rawYear = fieldValues[SP_PROJECTS_FIELDS.YEAR];

    // SharePoint Number columns come back as number | null.
    if (typeof rawYear === 'number' && rawYear > 0) {
      return { year: rawYear, source: 'page-metadata' };
    }

    // String coercion fallback — some REST responses return numbers as strings.
    if (typeof rawYear === 'string') {
      const parsed = parseInt(rawYear, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return { year: parsed, source: 'page-metadata' };
      }
    }
  }

  // 3. No year available
  return null;
}
