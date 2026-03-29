/**
 * Page-year resolution seam for the Project Sites web part.
 *
 * Resolution order:
 *   1. Property pane override (yearOverride > 0) — for admin/testing use.
 *   2. Hosting page's Year column fetched from Site Pages via PnPjs REST call.
 *   3. Missing — triggers "Year Not Configured" empty state.
 *
 * Page item identification strategy (for step 2):
 *   a. pageContext.listItem.id — standard SPFx API (may be undefined in shell context)
 *   b. legacyPageContext.pageItemId — legacy fallback (widely available)
 *   c. Query by page filename from URL — last resort when no item ID is available
 *
 * Invalid values (present but not a plausible 4-digit year) produce an
 * 'invalid' result so the UI can show actionable guidance.
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
 * Extract the current page filename from the browser URL.
 * E.g. "https://tenant.sharepoint.com/sites/HBCentral/SitePages/2025-Projects.aspx"
 * returns "2025-Projects.aspx".
 */
function getPageFileName(): string | null {
  try {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    // Site Pages URLs end with /SitePages/PageName.aspx
    const match = pathname.match(/\/([^/]+\.aspx)$/i);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the page item ID from the SPFx context using multiple strategies.
 *
 * The ShellWebPart (generic IIFE loader) may not have pageContext.listItem
 * populated — it only appears for web parts that SharePoint recognizes as
 * native page components. The legacyPageContext and URL-based fallbacks
 * handle this gap.
 */
function resolvePageItemId(context: WebPartContext): number | null {
  // Strategy A: Standard SPFx API
  const standardId = context.pageContext.listItem?.id;
  if (typeof standardId === 'number' && standardId > 0) {
    return standardId;
  }

  // Strategy B: Legacy page context (widely available, includes pageItemId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = (context.pageContext as any).legacyPageContext;
  if (legacy) {
    const legacyId = legacy.pageItemId;
    if (typeof legacyId === 'number' && legacyId > 0) {
      return legacyId;
    }
  }

  return null;
}

/**
 * Resolve the active year for the Project Sites query.
 *
 * This is async because reading custom columns from the hosting page
 * requires a PnPjs REST call to the Site Pages library.
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

  try {
    const sp = spfi().using(SPFx(context));

    // 2a. Try to resolve by page item ID (standard or legacy)
    const pageItemId = resolvePageItemId(context);
    if (pageItemId !== null) {
      const item = await sp.web.lists
        .getByTitle(SITE_PAGES_LIST_TITLE)
        .items.getById(pageItemId)
        .select(SP_PROJECTS_FIELDS.YEAR)();

      const rawYear = item?.[SP_PROJECTS_FIELDS.YEAR];
      return validateYear(rawYear, 'page-metadata');
    }

    // 2b. Fallback: resolve by page filename from URL
    const pageFileName = getPageFileName();
    if (pageFileName) {
      const items = await sp.web.lists
        .getByTitle(SITE_PAGES_LIST_TITLE)
        .items.filter(`FileLeafRef eq '${pageFileName}'`)
        .select(SP_PROJECTS_FIELDS.YEAR)
        .top(1)();

      if (items.length > 0) {
        const rawYear = items[0][SP_PROJECTS_FIELDS.YEAR];
        return validateYear(rawYear, 'page-metadata');
      }
    }

    // 3. No page identity available
    console.warn('[ProjectSites] Could not identify hosting page — no listItem.id, no legacyPageContext.pageItemId, no page filename from URL.');
    return { kind: 'missing' };
  } catch (err) {
    console.warn(
      '[ProjectSites] Failed to read Year from Site Pages:',
      err instanceof Error ? err.message : err,
    );
    return { kind: 'missing' };
  }
}
