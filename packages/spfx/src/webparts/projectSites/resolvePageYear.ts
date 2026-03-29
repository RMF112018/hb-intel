/**
 * Page-year resolution seam for the Project Sites web part.
 *
 * Resolution order:
 *   1. Property pane override (yearOverride > 0) — for admin/testing use.
 *   2. Hosting page metadata via pageContext.listItem.fieldValues — production source.
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
 * Resolve the active year for the Project Sites query.
 *
 * @param context      - SPFx WebPartContext (provides page metadata)
 * @param yearOverride - Value from the property pane (0 = use page metadata)
 * @returns Discriminated union: resolved | missing | invalid
 */
export function resolvePageYear(
  context: WebPartContext,
  yearOverride: number,
): PageYearResolution {
  // 1. Property pane override
  if (typeof yearOverride === 'number' && yearOverride > 0) {
    const num = Math.round(yearOverride);
    if (isValidYear(num)) {
      return { kind: 'resolved', year: num, source: 'property-pane' };
    }
    return { kind: 'invalid', rawValue: yearOverride, source: 'property-pane' };
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

    // Attempt coercion — SharePoint may return number or string
    if (rawYear !== null && rawYear !== undefined) {
      const num = coerceToNumber(rawYear);
      if (!Number.isNaN(num)) {
        const rounded = Math.round(num);
        if (isValidYear(rounded)) {
          return { kind: 'resolved', year: rounded, source: 'page-metadata' };
        }
        // Present but out of range
        return { kind: 'invalid', rawValue: rawYear, source: 'page-metadata' };
      }
      // Present but not a number at all
      return { kind: 'invalid', rawValue: rawYear, source: 'page-metadata' };
    }
  }

  // 3. No year available
  return { kind: 'missing' };
}
