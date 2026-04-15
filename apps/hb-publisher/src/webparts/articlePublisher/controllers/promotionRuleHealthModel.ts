/**
 * Phase-11 Prompt-03 — promotion-rule health model.
 *
 * The workspace loader previously swallowed a failed
 * `repositories.promotionRules.listActive()` call into an empty
 * ruleset, which collapsed two materially different operational
 * states — "no active rules are configured" vs. "the rules failed
 * to load" — into one silent fallback. This module expresses the
 * distinction as a typed union so the shell can narrate policy
 * health truthfully without destabilising selection precedence.
 *
 * Pure. No React, no I/O.
 */
import type { PublisherPromotionRuleRow } from '../../../data/publisherAdapter/index.js';

export type PromotionRuleHealth =
  | { readonly kind: 'loading' }
  | {
      readonly kind: 'ready';
      readonly rules: readonly PublisherPromotionRuleRow[];
    }
  | { readonly kind: 'readyEmpty' }
  | { readonly kind: 'loadFailure'; readonly message: string };

export interface PromotionRuleHealthInputs {
  readonly loading: boolean;
  readonly rules: readonly PublisherPromotionRuleRow[] | undefined;
  readonly error: string | undefined;
}

/**
 * Priority order (first match wins):
 *   1. loading — a read is in flight
 *   2. loadFailure — the read threw; message preserved for copy
 *   3. readyEmpty — successful read, zero active rows
 *   4. ready — successful read, at least one active row
 *
 * `loadFailure` outranks `readyEmpty` so an intermittent throw is
 * never misreported as "no rules configured". If a caller wants to
 * degrade to deterministic defaults after a failure, they can still
 * pass `[]` to the selector — the selector does not change — but the
 * health signal makes that choice visible in the shell.
 */
export function derivePromotionRuleHealth(
  inputs: PromotionRuleHealthInputs,
): PromotionRuleHealth {
  if (inputs.loading) return { kind: 'loading' };
  if (inputs.error !== undefined) {
    return { kind: 'loadFailure', message: inputs.error };
  }
  const rules = inputs.rules ?? [];
  if (rules.length === 0) return { kind: 'readyEmpty' };
  return { kind: 'ready', rules };
}

/**
 * Extract the rules array used by the selector. Falls back to an
 * empty array for non-ready states so callers keep the existing
 * deterministic-defaults behavior — critically including the
 * load-failure case, where the shell has already made the failure
 * visible and the selector should still produce a safe (empty)
 * ruleset rather than throwing.
 */
export function promotionRulesFor(
  health: PromotionRuleHealth,
): readonly PublisherPromotionRuleRow[] {
  return health.kind === 'ready' ? health.rules : [];
}

export function isPromotionRuleLoadFailure(
  health: PromotionRuleHealth,
): boolean {
  return health.kind === 'loadFailure';
}

/**
 * Short operator-facing summary line. Kept deliberately concise so
 * the readiness rail can render it alongside the existing promotion
 * summary without overwhelming the author.
 */
export function promotionRuleHealthHeadline(
  health: PromotionRuleHealth,
): string | undefined {
  switch (health.kind) {
    case 'loading':
      return 'Loading promotion rules…';
    case 'ready':
      return undefined;
    case 'readyEmpty':
      return 'No active promotion rules are configured — publisher defaults apply.';
    case 'loadFailure':
      return `Promotion rules failed to load — ${health.message}. Publisher defaults are applied as a safety fallback.`;
  }
}
