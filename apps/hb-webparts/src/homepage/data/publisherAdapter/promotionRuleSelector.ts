/**
 * Pure selectors over tenant `HB Article Promotion Rules`.
 *
 * **Implemented behavior (current sprint):**
 *   - The selector resolves an explicit policy for
 *     `(Destination, ArticleContentType)` with deterministic scope
 *     precedence: destination > homepage > global.
 *   - The authoring surface can consume that policy to seed and
 *     re-apply `IsFeatured` / `IsPinned`, including lock semantics
 *     when `ManualOverrideAllowed=false`.
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
  const policy = selectPromotionPolicy(rules, destination, contentType);
  if (!policy.source) return DEFAULT_DEFAULTS;
  return {
    featured: policy.featured,
    pinned: policy.pinned,
    manualOverrideAllowed: policy.manualOverrideAllowed,
    source: policy.source,
  };
}
