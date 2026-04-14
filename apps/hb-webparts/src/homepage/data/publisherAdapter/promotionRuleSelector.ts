/**
 * Pure selectors over tenant `HB Article Promotion Rules`.
 *
 * **Implemented behavior (current sprint):**
 *   - Authoring defaults only — when creating a new article the
 *     authoring surface calls `selectPromotionDefaults(...)` once
 *     and seeds the in-memory `IsFeatured` / `IsPinned` fields
 *     from the most-specific active rule for
 *     `(Destination, ArticleContentType)`. The seeded values are
 *     written through to the upsert like any other authoring
 *     field; subsequent edits pass through unchanged.
 *
 * **NOT enforced in the editor (Phase-05 Prompt-05 scope-down):**
 *   - The `manualOverrideAllowed` flag and `source` rule are
 *     returned on `PromotionDefaults` so a future editor can gate
 *     `IsFeatured` / `IsPinned` toggles, but the current
 *     authoring UI does not expose those toggles and therefore
 *     does not enforce manual-override gating. Reading this
 *     module's output as "the editor locks the toggle when the
 *     rule disallows override" is a false promise — there is no
 *     such toggle to lock today. Callers that want real
 *     enforcement must (a) expose the toggles, and (b) bind
 *     `disabled` / `readOnly` to
 *     `!defaults.manualOverrideAllowed`. When that lands, move
 *     the relevant bullet back into "Implemented behavior" above.
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
 * Derive the promotion defaults that the authoring surface seeds
 * onto a new article. `manualOverrideAllowed` is populated from
 * the matching rule so a future editor can choose to lock
 * `IsFeatured` / `IsPinned` toggles, but the current surface does
 * not expose those toggles and does not enforce gating.
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
