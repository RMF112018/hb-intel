/**
 * Tenant `HB Article Promotion Rules` round-trip + selector tests.
 *
 * Pins:
 *   - mapPromotionRuleRow rejects rows missing tenant-required
 *     columns (RuleId, Title, Destination, Scope, IsActive).
 *   - selectPromotionDefaults applies the most-specific active rule
 *     for (Destination, ArticleContentType) and returns publisher
 *     defaults when no rule matches.
 *   - ManualOverrideAllowed=false flows through to the caller.
 */
import { describe, expect, it } from 'vitest';
import { mapPromotionRuleRow } from './publisherRowMappers';
import {
  selectPromotionDefaults,
  selectPromotionRule,
} from './promotionRuleSelector';
import type { PublisherPromotionRuleRow } from './publisherContracts';

const TENANT_RAW: Record<string, unknown> = {
  RuleId: 'rule-001',
  Title: 'Project Spotlight monthly featured by default',
  Destination: 'projectSpotlight',
  Scope: 'destination',
  IsActive: true,
  RuleContentType: 'monthlySpotlight',
  FeaturedDefault: true,
  PinnedDefault: false,
  ManualOverrideAllowed: false,
  FeedWindowDays: 30,
  Notes: 'Drives default featuring for monthly spotlights.',
};

describe('mapPromotionRuleRow', () => {
  it('reads every tenant-required column', () => {
    const row = mapPromotionRuleRow(TENANT_RAW);
    expect(row).toBeDefined();
    expect(row!.RuleId).toBe('rule-001');
    expect(row!.Destination).toBe('projectSpotlight');
    expect(row!.Scope).toBe('destination');
    expect(row!.IsActive).toBe(true);
    expect(row!.RuleContentType).toBe('monthlySpotlight');
    expect(row!.FeaturedDefault).toBe(true);
    expect(row!.ManualOverrideAllowed).toBe(false);
    expect(row!.FeedWindowDays).toBe(30);
  });

  it('rejects rows missing tenant-required columns', () => {
    for (const required of ['RuleId', 'Title', 'Destination', 'Scope', 'IsActive'] as const) {
      const incomplete = { ...TENANT_RAW };
      delete (incomplete as Record<string, unknown>)[required];
      expect(mapPromotionRuleRow(incomplete)).toBeUndefined();
    }
  });
});

describe('selectPromotionDefaults', () => {
  const monthly: PublisherPromotionRuleRow = {
    RuleId: 'rule-monthly',
    Title: 'Monthly featured',
    Destination: 'projectSpotlight',
    Scope: 'destination',
    IsActive: true,
    RuleContentType: 'monthlySpotlight',
    FeaturedDefault: true,
    PinnedDefault: false,
    ManualOverrideAllowed: false,
  };
  const fallback: PublisherPromotionRuleRow = {
    RuleId: 'rule-fallback',
    Title: 'Project Spotlight wildcard',
    Destination: 'projectSpotlight',
    Scope: 'destination',
    IsActive: true,
    FeaturedDefault: false,
    PinnedDefault: true,
  };
  const inactive: PublisherPromotionRuleRow = {
    ...monthly,
    RuleId: 'rule-inactive',
    IsActive: false,
    FeaturedDefault: false,
  };
  const otherDestination: PublisherPromotionRuleRow = {
    ...monthly,
    RuleId: 'rule-other-dest',
    Destination: 'companyPulse',
  };

  it('returns publisher defaults when no rule matches', () => {
    const defaults = selectPromotionDefaults([], 'projectSpotlight', 'monthlySpotlight');
    expect(defaults.featured).toBe(false);
    expect(defaults.pinned).toBe(false);
    expect(defaults.manualOverrideAllowed).toBe(true);
    expect(defaults.source).toBeUndefined();
  });

  it('prefers an exact RuleContentType match over a wildcard rule', () => {
    const defaults = selectPromotionDefaults(
      [fallback, monthly],
      'projectSpotlight',
      'monthlySpotlight',
    );
    expect(defaults.source?.RuleId).toBe('rule-monthly');
    expect(defaults.featured).toBe(true);
    expect(defaults.manualOverrideAllowed).toBe(false);
  });

  it('falls back to a wildcard rule when no content-type-specific rule matches', () => {
    const defaults = selectPromotionDefaults(
      [fallback, monthly],
      'projectSpotlight',
      'newsUpdate',
    );
    expect(defaults.source?.RuleId).toBe('rule-fallback');
    expect(defaults.pinned).toBe(true);
  });

  it('skips inactive rules', () => {
    const defaults = selectPromotionDefaults(
      [inactive],
      'projectSpotlight',
      'monthlySpotlight',
    );
    expect(defaults.featured).toBe(false);
    expect(defaults.source).toBeUndefined();
  });

  it('only considers rules that match the article destination', () => {
    expect(
      selectPromotionRule([otherDestination], 'projectSpotlight', 'monthlySpotlight'),
    ).toBeUndefined();
  });
});
