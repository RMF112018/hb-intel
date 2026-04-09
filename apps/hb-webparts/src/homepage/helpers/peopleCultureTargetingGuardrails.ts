/**
 * People & Culture targeting guardrails.
 *
 * Phase-14 pc/ Prompt-05 (Permissions, Intake, Notifications, and Work
 * Management).
 *
 * Small pure helpers that flag items whose `targeted` audience scope
 * looks dangerous. The companion surfaces the result inline so HR can
 * see targeting risk before pushing content live.
 *
 * Risk reasons, in priority order (first match wins):
 *
 *   - `emptyTargetedAudience` — the scope is `targeted` but the tag
 *     list is empty (or all tags have blank values). `isAudienceVisibleToViewer`
 *     already fails closed for this, so the item would be invisible
 *     to every viewer — almost always a mistake.
 *   - `unknownDimension` — the scope references a dimension the
 *     caller does not recognize (e.g., a legacy export that predates
 *     the split contracts). Flag so HR can migrate.
 *   - `outOfTaxonomyValue` — the scope references a dimension/value
 *     pair that does not appear in the caller-provided tenant taxonomy.
 *     Used to detect typos and stale terms.
 *
 * `detectTargetingRisks` is O(items * tags) and returns a
 * `Map<itemId, PeopleCultureTargetingRiskReason>` so callers can
 * project it alongside `detectHomepageConflicts`.
 */

import type {
  PeopleCultureAudienceDimension,
  PeopleCultureItem,
  PeopleCultureTargetingRiskReason,
} from '../webparts/peopleCultureSplitContracts.js';

export interface TargetingTaxonomyEntry {
  dimension: PeopleCultureAudienceDimension;
  values: ReadonlyArray<string>;
}

export interface DetectTargetingRisksOptions {
  /**
   * Known dimensions the tenant supports. Defaults to all split-model
   * dimensions.
   */
  knownDimensions?: ReadonlyArray<PeopleCultureAudienceDimension>;
  /**
   * Optional tenant taxonomy. When supplied, items referencing
   * dimension/value pairs not in the taxonomy are flagged with
   * `outOfTaxonomyValue`. When omitted, taxonomy checks are skipped.
   */
  taxonomy?: ReadonlyArray<TargetingTaxonomyEntry>;
}

const ALL_KNOWN_DIMENSIONS: ReadonlyArray<PeopleCultureAudienceDimension> = [
  'office',
  'department',
  'region',
  'roleFamily',
  'projectTeam',
];

function hasNonBlankValues(values: ReadonlyArray<{ value: string }>): boolean {
  return values.some((v) => Boolean(v.value?.trim()));
}

export function detectTargetingRisks(
  items: ReadonlyArray<PeopleCultureItem>,
  options: DetectTargetingRisksOptions = {},
): Map<string, PeopleCultureTargetingRiskReason> {
  const knownDimensions = new Set(options.knownDimensions ?? ALL_KNOWN_DIMENSIONS);
  const taxonomyLookup = new Map<string, Set<string>>();
  if (options.taxonomy) {
    for (const entry of options.taxonomy) {
      taxonomyLookup.set(entry.dimension, new Set(entry.values));
    }
  }

  const result = new Map<string, PeopleCultureTargetingRiskReason>();

  for (const item of items) {
    if (item.audience.kind !== 'targeted') continue;
    const tags = item.audience.tags;

    if (tags.length === 0 || !hasNonBlankValues(tags)) {
      result.set(item.id, 'emptyTargetedAudience');
      continue;
    }

    const unknownDim = tags.find((tag) => !knownDimensions.has(tag.dimension));
    if (unknownDim) {
      result.set(item.id, 'unknownDimension');
      continue;
    }

    if (options.taxonomy) {
      const outOfTaxonomy = tags.find((tag) => {
        const values = taxonomyLookup.get(tag.dimension);
        if (!values) return true;
        return !values.has(tag.value);
      });
      if (outOfTaxonomy) {
        result.set(item.id, 'outOfTaxonomyValue');
        continue;
      }
    }
  }

  return result;
}
