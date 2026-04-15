/**
 * Pure selectors over tenant `HB Article Promotion Rules`.
 *
 * **Implemented behavior:**
 *   - The selector resolves an explicit policy for
 *     `(Destination, ArticleContentType)` with deterministic scope
 *     precedence: destination > homepage > global.
 *   - The authoring surface can consume that policy to seed and
 *     re-apply `IsFeatured` / `IsPinned`, including lock semantics
 *     when `ManualOverrideAllowed=false`.
 *
 * **UI-toggle gating still deferred in the editor:**
 *   - The current surface has no direct `IsFeatured` / `IsPinned`
 *     controls, so there is no toggle-level lock behavior to bind.
 *   - Current enforcement is save-time normalization:
 *     callers apply resolved defaults when
 *     `ManualOverrideAllowed=false` so persisted values cannot
 *     drift from locked rule policy.
 *   - If/when toggle controls are introduced, bind
 *     `disabled` / `readOnly` to
 *     `!defaults.manualOverrideAllowed` and keep save-time
 *     normalization as a backstop.
 *
 * Specificity: a rule whose `RuleContentType` matches the article's
 * `ArticleContentType` exactly outranks a rule with no
 * `RuleContentType` (which acts as a destination-wide fallback).
 * If multiple rules share the same specificity at the chosen
 * scope, the first one in the input order wins (tenant-curated
 * registry order).
 *
 * Scope precedence (high → low): destination > homepage > global.
 * Homepage/global are no longer implicit no-ops: they participate as
 * deterministic fallbacks when a destination-scoped rule is absent.
 */
import type { PublisherPromotionRuleRow } from './publisherContracts';
import type { ArticleContentType, Destination } from './publisherEnums';

export interface PromotionDefaults {
  readonly featured: boolean;
  readonly pinned: boolean;
  readonly manualOverrideAllowed: boolean;
  readonly source?: PublisherPromotionRuleRow;
}

export type PromotionRuleMatchScope = 'destination' | 'homepage' | 'global' | 'none';

export interface PromotionPolicyResult {
  readonly featured: boolean;
  readonly pinned: boolean;
  readonly manualOverrideAllowed: boolean;
  readonly isLocked: boolean;
  readonly matchedScope: PromotionRuleMatchScope;
  readonly source?: PublisherPromotionRuleRow;
  readonly sourceRuleId?: string;
}

const DEFAULT_DEFAULTS: PromotionDefaults = {
  featured: false,
  pinned: false,
  manualOverrideAllowed: true,
};

const DEFAULT_POLICY: PromotionPolicyResult = {
  ...DEFAULT_DEFAULTS,
  isLocked: false,
  matchedScope: 'none',
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
  return selectPromotionPolicy(rules, destination, contentType).source;
}

function findInScope(
  rules: readonly PublisherPromotionRuleRow[],
  destination: Destination,
  contentType: ArticleContentType,
  scope: 'destination' | 'homepage' | 'global',
): PublisherPromotionRuleRow | undefined {
  const candidates = rules.filter(
    (r) => r.IsActive && r.Destination === destination && r.Scope === scope,
  );
  const exact = candidates.find((r) => r.RuleContentType === contentType);
  if (exact) return exact;
  return candidates.find((r) => !r.RuleContentType);
}

/**
 * Resolve effective promotion policy for an article draft.
 *
 * Scope precedence is deterministic and explicit:
 *   destination > homepage > global
 *
 * Within a scope, exact RuleContentType matches outrank wildcard
 * (missing RuleContentType) rules.
 */
export function selectPromotionPolicy(
  rules: readonly PublisherPromotionRuleRow[],
  destination: Destination,
  contentType: ArticleContentType,
): PromotionPolicyResult {
  for (const scope of ['destination', 'homepage', 'global'] as const) {
    const rule = findInScope(rules, destination, contentType, scope);
    if (!rule) continue;
    const manualOverrideAllowed = rule.ManualOverrideAllowed ?? true;
    return {
      featured: rule.FeaturedDefault ?? false,
      pinned: rule.PinnedDefault ?? false,
      manualOverrideAllowed,
      isLocked: !manualOverrideAllowed,
      matchedScope: scope,
      source: rule,
      sourceRuleId: rule.RuleId,
    };
  }
  return DEFAULT_POLICY;
}

/**
 * Derive promotion defaults for current authoring policy
 * application. `manualOverrideAllowed` is returned so callers can
 * (a) normalize locked values on save today, and (b) wire
 * toggle-level disablement in a future UI that exposes direct
 * `IsFeatured` / `IsPinned` controls.
 */
export function selectPromotionDefaults(
  rules: readonly PublisherPromotionRuleRow[],
  destination: Destination,
  contentType: ArticleContentType,
): PromotionDefaults {
  const policy = selectPromotionPolicy(rules, destination, contentType);
  if (!policy.source) return DEFAULT_DEFAULTS;
  return {
    featured: policy.featured,
    pinned: policy.pinned,
    manualOverrideAllowed: policy.manualOverrideAllowed,
    source: policy.source,
  };
}
