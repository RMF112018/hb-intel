/**
 * Page-year resolution seam for the Project Sites web part.
 *
 * Resolution order:
 *   1. Property pane override (yearOverride > 0) — for admin/testing use.
 *   2. Hosting page's Year column fetched from Site Pages via PnPjs REST call.
 *   3. Missing — triggers "Year Not Configured" empty state.
 *
 * Invalid values (present but not a plausible 4-digit year) produce an
 * 'invalid' result so the UI can show actionable guidance.
 *
 * Contract: each unique year has its own Site Pages page in HBCentral/SitePages,
 * tagged with the appropriate page-level Year property.
 *
 * @see .claude/plans/project-sites-webpart-validation-and-architecture-report.md §3
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import type { PageYearResolution } from './types.js';
import { SP_PROJECTS_FIELDS, isValidYear } from './types.js';

/**
 * Attempt to parse a raw value into a number.
 * Returns NaN if the value cannot be coerced.
 */
function coerceToNumber(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? Number(trimmed) : NaN;
  }
  return NaN;
}

/**
 * Validate a raw year value and return a PageYearResolution.
 */
function validateYear(rawYear: unknown, source: 'property-pane' | 'page-metadata'): PageYearResolution {
  if (rawYear === null || rawYear === undefined) {
    return { kind: 'missing' };
  }
  const num = coerceToNumber(rawYear);
  if (!Number.isNaN(num)) {
    const rounded = Math.round(num);
    if (isValidYear(rounded)) {
      return { kind: 'resolved', year: rounded, source };
    }
    return { kind: 'invalid', rawValue: rawYear, source };
  }
  return { kind: 'invalid', rawValue: rawYear, source };
}

/** Site Pages library title — standard for all SharePoint modern sites. */
const SITE_PAGES_LIST_TITLE = 'Site Pages';

/**
 * Resolve the active year for the Project Sites query.
 *
 * This is async because reading custom columns from the hosting page
 * requires a PnPjs REST call to the Site Pages library. SPFx's
 * pageContext.listItem only exposes the item ID, not custom field values.
 *
 * @param context      - SPFx WebPartContext (provides page context + SP REST access)
 * @param yearOverride - Value from the property pane (0 = use page metadata)
 * @returns Discriminated union: resolved | missing | invalid
 */
export async function resolvePageYear(
  context: WebPartContext,
  yearOverride: number,
): Promise<PageYearResolution> {
  // 1. Property pane override (synchronous — no REST call needed)
  if (typeof yearOverride === 'number' && yearOverride > 0) {
    return validateYear(yearOverride, 'property-pane');
  }

  // 2. Fetch the hosting page's Year column from Site Pages via PnPjs.
  //    pageContext.listItem.id gives us the current page's list item ID
  //    in the Site Pages library.
  const pageItemId = context.pageContext.listItem?.id;
  if (typeof pageItemId !== 'number' || pageItemId <= 0) {
    return { kind: 'missing' };
  }

  try {
    const sp = spfi().using(SPFx(context));
    const item = await sp.web.lists
      .getByTitle(SITE_PAGES_LIST_TITLE)
      .items.getById(pageItemId)
      .select(SP_PROJECTS_FIELDS.YEAR)();

    const rawYear = item?.[SP_PROJECTS_FIELDS.YEAR];
    return validateYear(rawYear, 'page-metadata');
  } catch (err) {
    // If the REST call fails (e.g., field doesn't exist, permissions),
    // fall through to missing rather than crashing.
    console.warn(
      '[ProjectSites] Failed to read Year from Site Pages item:',
      err instanceof Error ? err.message : err,
    );
    return { kind: 'missing' };
  }
}
