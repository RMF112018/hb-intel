/**
 * Phase-11 Prompt-03 — promotion-rule health model tests.
 *
 * Pins the typed distinction the shell relies on:
 *   - a genuine empty ruleset is `readyEmpty`, not `loadFailure`,
 *   - a failed read is `loadFailure`, not `readyEmpty`,
 *   - the selector-facing `promotionRulesFor` helper degrades to an
 *     empty array for every non-ready state so rule application
 *     stays deterministic and safe.
 */
import { describe, expect, it } from 'vitest';
import {
  derivePromotionRuleHealth,
  isPromotionRuleLoadFailure,
  promotionRuleHealthHeadline,
  promotionRulesFor,
} from './promotionRuleHealthModel';
import type { PublisherPromotionRuleRow } from '../../../data/publisherAdapter/index.js';

function rule(
  over: Partial<PublisherPromotionRuleRow> = {},
): PublisherPromotionRuleRow {
  return {
    RuleId: 'rule-1',
    IsActive: true,
    IsLocked: true,
    Scope: 'destination',
    Destination: 'projectSpotlight',
    ArticleContentType: undefined,
    IsFeatured: true,
    IsPinned: false,
    Priority: 100,
    ...over,
  } as unknown as PublisherPromotionRuleRow;
}

describe('promotionRuleHealthModel — priority order', () => {
  it('returns loading while a read is in flight', () => {
    const health = derivePromotionRuleHealth({
      loading: true,
      rules: undefined,
      error: undefined,
    });
    expect(health.kind).toBe('loading');
    expect(promotionRulesFor(health)).toEqual([]);
  });

  it('prefers loadFailure over readyEmpty when the read threw', () => {
    const health = derivePromotionRuleHealth({
      loading: false,
      rules: undefined,
      error: 'SPList access denied',
    });
    expect(health.kind).toBe('loadFailure');
    if (health.kind !== 'loadFailure') throw new Error();
    expect(health.message).toBe('SPList access denied');
    expect(isPromotionRuleLoadFailure(health)).toBe(true);
    // Still degrades to an empty selector input so policy application
    // remains safe and deterministic.
    expect(promotionRulesFor(health)).toEqual([]);
  });

  it('returns readyEmpty when the read succeeded but returned zero rows', () => {
    const health = derivePromotionRuleHealth({
      loading: false,
      rules: [],
      error: undefined,
    });
    expect(health.kind).toBe('readyEmpty');
    expect(promotionRulesFor(health)).toEqual([]);
  });

  it('returns ready with rules when the read succeeded and rows exist', () => {
    const rows = [rule()];
    const health = derivePromotionRuleHealth({
      loading: false,
      rules: rows,
      error: undefined,
    });
    expect(health.kind).toBe('ready');
    expect(promotionRulesFor(health)).toBe(rows);
  });
});

describe('promotionRuleHealthModel — headline copy keeps failure and emptiness distinct', () => {
  it('emits no headline for the healthy ready state', () => {
    const health = derivePromotionRuleHealth({
      loading: false,
      rules: [rule()],
      error: undefined,
    });
    expect(promotionRuleHealthHeadline(health)).toBeUndefined();
  });

  it('emits an empty-configuration headline that is not a failure headline', () => {
    const empty = promotionRuleHealthHeadline({ kind: 'readyEmpty' });
    const failure = promotionRuleHealthHeadline({
      kind: 'loadFailure',
      message: 'network timeout',
    });
    expect(empty).toMatch(/No active promotion rules/i);
    expect(failure).toMatch(/failed to load/i);
    expect(failure).not.toBe(empty);
  });

  it('includes the underlying error message in the failure headline', () => {
    const headline = promotionRuleHealthHeadline({
      kind: 'loadFailure',
      message: 'forbidden',
    });
    expect(headline).toMatch(/forbidden/);
  });
});
