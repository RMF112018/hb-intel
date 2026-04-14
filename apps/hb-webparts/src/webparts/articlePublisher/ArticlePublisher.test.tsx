import { describe, expect, it } from 'vitest';
import type {
  PublisherArticleRow,
  PublisherPromotionRuleRow,
} from '../../homepage/data/publisherAdapter/index.js';
import { applyPromotionPolicyToDraft, update } from './ArticlePublisher';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Title',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'title',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'draft',
    Subhead: 'subhead',
    SummaryExcerpt: 'summary',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/hero.jpg',
    HeroPrimaryImageAltText: 'hero alt',
    CreatedDateUtc: '2026-04-14T00:00:00Z',
    UpdatedDateUtc: '2026-04-14T00:00:00Z',
    IsFeatured: false,
    IsPinned: false,
    ...over,
  };
}

function rule(over: Partial<PublisherPromotionRuleRow> = {}): PublisherPromotionRuleRow {
  return {
    RuleId: 'rule-1',
    Title: 'Monthly defaults',
    Destination: 'projectSpotlight',
    Scope: 'destination',
    IsActive: true,
    RuleContentType: 'monthlySpotlight',
    FeaturedDefault: true,
    PinnedDefault: false,
    ManualOverrideAllowed: true,
    ...over,
  };
}

describe('applyPromotionPolicyToDraft', () => {
  it('seeds draft from actual destination/content-type context', () => {
    const draft = article();
    const resolved = applyPromotionPolicyToDraft(draft, [rule()]);
    expect(resolved.policy.sourceRuleId).toBe('rule-1');
    expect(resolved.draft.IsFeatured).toBe(true);
    expect(resolved.draft.IsPinned).toBe(false);
  });

  it('re-resolves defaults when destination/content-type context changes', () => {
    const monthly = rule({ RuleId: 'rule-monthly', RuleContentType: 'monthlySpotlight', FeaturedDefault: true });
    const news = rule({ RuleId: 'rule-news', RuleContentType: 'newsUpdate', FeaturedDefault: false, PinnedDefault: true });
    const start = applyPromotionPolicyToDraft(article(), [monthly, news]);
    const changed = applyPromotionPolicyToDraft(
      { ...start.draft, ArticleContentType: 'newsUpdate' },
      [monthly, news],
    );
    expect(changed.policy.sourceRuleId).toBe('rule-news');
    expect(changed.draft.IsFeatured).toBe(false);
    expect(changed.draft.IsPinned).toBe(true);
  });

  it('enforces lock semantics on save-path application', () => {
    const locked = rule({ RuleId: 'rule-locked', ManualOverrideAllowed: false, FeaturedDefault: true, PinnedDefault: true });
    const unlocked = rule({ RuleId: 'rule-open', ManualOverrideAllowed: true, FeaturedDefault: true, PinnedDefault: true });

    const lockApplied = applyPromotionPolicyToDraft(
      article({ IsFeatured: false, IsPinned: false }),
      [locked],
      { enforceLockOnly: true },
    );
    expect(lockApplied.policy.isLocked).toBe(true);
    expect(lockApplied.draft.IsFeatured).toBe(true);
    expect(lockApplied.draft.IsPinned).toBe(true);

    const unlockedSkipped = applyPromotionPolicyToDraft(
      article({ IsFeatured: false, IsPinned: false }),
      [unlocked],
      { enforceLockOnly: true },
    );
    expect(unlockedSkipped.policy.isLocked).toBe(false);
    expect(unlockedSkipped.draft.IsFeatured).toBe(false);
    expect(unlockedSkipped.draft.IsPinned).toBe(false);
  });

  it('preserves advanced presentation fields when policy is applied before save', () => {
    const draft = update(
      update(
        update(
          update(article(), 'SecondaryImage', 'https://img.example/secondary.jpg'),
          'SecondaryImageAltText',
          'Secondary alt',
        ),
        'TeamViewerMode',
        'summaryExpand',
      ),
      'TeamViewerAllowExpand',
      true,
    );
    const resolved = applyPromotionPolicyToDraft(draft, [rule()]);
    expect(resolved.draft.SecondaryImage).toBe('https://img.example/secondary.jpg');
    expect(resolved.draft.SecondaryImageAltText).toBe('Secondary alt');
    expect(resolved.draft.TeamViewerMode).toBe('summaryExpand');
    expect(resolved.draft.TeamViewerAllowExpand).toBe(true);
  });
});
