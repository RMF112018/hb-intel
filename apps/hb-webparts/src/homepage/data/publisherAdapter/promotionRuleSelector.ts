/**
 * Pure selectors over tenant `HB Article Promotion Rules`.
 *
 * Application points (Phase-02 Prompt-08, tightly bounded):
 *   1. Authoring defaults — when creating a new article, seed
 *      `IsFeatured` / `IsPinned` from the most-specific active rule
 *      for (Destination, ArticleContentType).
 *   2. Manual-override gating — when a matching rule's
 *      `ManualOverrideAllowed === false`, the authoring surface
 *      must lock the IsFeatured / IsPinned toggles to the
 *      rule-derived defaults.
 *
 * Specificity: a rule whose `RuleContentType` matches the article's
 * `ArticleContentType` exactly outranks a rule with no
 * `RuleContentType` (which acts as a destination-wide fallback).
 * If multiple rules share the same specificity at the chosen
 * scope, the first one in the input order wins (tenant-curated
 * registry order).
 *
 * Scope precedence (high → low): destination > homepage > global.
 * The publisher cares about destination-scoped defaults during
 * authoring; homepage / global rules are recorded by the tenant for
 * downstream surfaces but never override a destination-scoped match.
 */
import type { PublisherPromotionRuleRow } from './publisherContracts';
import type { ArticleContentType, Destination } from './publisherEnums';

export interface PromotionDefaults {
  readonly featured: boolean;
  readonly pinned: boolean;
  readonly manualOverrideAllowed: boolean;
  readonly source?: PublisherPromotionRuleRow;
}

const DEFAULT_DEFAULTS: PromotionDefaults = {
  featured: false,
  pinned: false,
  manualOverrideAllowed: true,
};

/**
 * Pick the most-specific active promotion rule that applies to the
 * (destination, contentType) pair. Returns undefined when no rule
 * matches — the caller should fall back to publisher defaults.
 */
export function selectPromotionRule(
  rules: readonly PublisherPromotionRuleRow[],
  destination: Destination,
  contentType: ArticleContentType,
): PublisherPromotionRuleRow | undefined {
  const candidates = rules.filter(
    (r) => r.IsActive && r.Destination === destination && r.Scope === 'destination',
  );
  // Exact RuleContentType match outranks the wildcard.
  const exact = candidates.find((r) => r.RuleContentType === contentType);
  if (exact) return exact;
  return candidates.find((r) => !r.RuleContentType);
}

/**
 * Derive the promotion defaults that the authoring surface should
 * apply when seeding a new article. When a matching rule disallows
 * manual override, the caller must lock IsFeatured / IsPinned to
 * the returned values.
 */
export function selectPromotionDefaults(
  rules: readonly PublisherPromotionRuleRow[],
  destination: Destination,
  contentType: ArticleContentType,
): PromotionDefaults {
  const rule = selectPromotionRule(rules, destination, contentType);
  if (!rule) return DEFAULT_DEFAULTS;
  return {
    featured: rule.FeaturedDefault ?? false,
    pinned: rule.PinnedDefault ?? false,
    manualOverrideAllowed: rule.ManualOverrideAllowed ?? true,
    source: rule,
  };
}
