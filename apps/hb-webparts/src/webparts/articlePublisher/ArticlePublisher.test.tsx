import { describe, expect, it } from 'vitest';
import type {
  PublisherArticleRow,
  PublisherPromotionRuleRow,
  PublisherTeamMemberRow,
} from '../../homepage/data/publisherAdapter/index.js';
import {
  applyPromotionPolicyToDraft,
  applyTeamMemberPrincipalChange,
  contentTypeOptionsForDraft,
  milestoneLegacyNotice,
  promotionLockStatusText,
  resolveTemplateKeySystemManaged,
  update,
} from './ArticlePublisher';
import type { PublisherTemplateRegistryRow } from '../../homepage/data/publisherAdapter/index.js';

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

describe('promotionLockStatusText', () => {
  it('describes save-time lock enforcement without implying toggle controls', () => {
    const text = promotionLockStatusText({
      featured: true,
      pinned: false,
      manualOverrideAllowed: false,
      isLocked: true,
      matchedScope: 'destination',
      sourceRuleId: 'rule-1',
    });
    expect(text).toContain('IsFeatured=true');
    expect(text).toContain('IsPinned=false');
    expect(text).toContain('destination scope rule rule-1');
    expect(text).toContain('No direct IsFeatured/IsPinned toggle controls');
    expect(text).toContain('save-time normalization');
  });
});

describe('applyTeamMemberPrincipalChange', () => {
  it('clears PersonPrincipalId when principal changes and keeps authored schema fields', () => {
    const row: PublisherTeamMemberRow = {
      ArticleId: 'art-1',
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      PersonPrincipal: 'alice@example.com',
      PersonPrincipalId: 42,
      DisplayName: 'Alice',
      GroupKey: 'leaders',
      ParentMemberId: 'tm-root',
      BioSnippet: 'Bio',
      ContactLink: 'https://profile.example/alice',
    };
    const next = applyTeamMemberPrincipalChange(row, 'alice2@example.com');
    expect(next.PersonPrincipal).toBe('alice2@example.com');
    expect(next.PersonPrincipalId).toBeUndefined();
    expect(next.GroupKey).toBe('leaders');
    expect(next.ParentMemberId).toBe('tm-root');
    expect(next.BioSnippet).toBe('Bio');
    expect(next.ContactLink).toBe('https://profile.example/alice');
  });
});

function template(
  over: Partial<PublisherTemplateRegistryRow> & { TemplateKey: string },
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: over.TemplateKey,
    TemplateName: over.TemplateKey,
    IsActive: over.IsActive ?? true,
    TemplatePriority: over.TemplatePriority ?? 100,
    VersionLabel: over.VersionLabel ?? '1.0.0',
    ContentTypes: over.ContentTypes ?? ['monthlySpotlight'],
    Destination: over.Destination ?? 'projectSpotlight',
    PageShellTemplateKey: over.PageShellTemplateKey ?? 'ps-shell-v1',
    HeroProfileKey: over.HeroProfileKey ?? 'hbSignatureHero',
    BodyProfileKey: over.BodyProfileKey ?? 'oobText',
    TeamViewerProfileKey: over.TeamViewerProfileKey ?? 'teamViewer',
    GalleryProfileKey: over.GalleryProfileKey ?? 'oobImageGallery',
    ShowHero: over.ShowHero ?? true,
    ShowBody: over.ShowBody ?? true,
    ShowTeamViewer: over.ShowTeamViewer ?? true,
    ShowGallery: over.ShowGallery ?? true,
    ShowSecondaryImage: over.ShowSecondaryImage ?? false,
    RequiredFieldSetKey: over.RequiredFieldSetKey ?? 'req-default',
  };
}

describe('resolveTemplateKeySystemManaged', () => {
  it('re-resolves from discriminators and ignores stale article TemplateKey', () => {
    const resolved = resolveTemplateKeySystemManaged(
      article({
        TemplateKey: 'stale-news-template',
        ArticleContentType: 'monthlySpotlight',
      }),
      [
        template({
          TemplateKey: 'monthly-template',
          ContentTypes: ['monthlySpotlight'],
          TemplatePriority: 500,
        }),
        template({
          TemplateKey: 'stale-news-template',
          ContentTypes: ['newsUpdate'],
          TemplatePriority: 1,
        }),
      ],
    );
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.entry.TemplateKey).toBe('monthly-template');
    expect(resolved.trace.selectionRule).not.toBe('adminOverride');
  });
});

describe('milestone content-type posture', () => {
  it('excludes milestoneSpotlight from ordinary live-authoring options', () => {
    const options = contentTypeOptionsForDraft('monthlySpotlight');
    expect(options).toContain('monthlySpotlight');
    expect(options).toContain('newsUpdate');
    expect(options).not.toContain('milestoneSpotlight');
  });

  it('keeps legacy milestone rows editable toward operational remediation', () => {
    const options = contentTypeOptionsForDraft('milestoneSpotlight');
    expect(options).toContain('monthlySpotlight');
    expect(options).toContain('newsUpdate');
    expect(options).toContain('milestoneSpotlight');
    expect(milestoneLegacyNotice('milestoneSpotlight')).toContain(
      'read-compatible only',
    );
    expect(milestoneLegacyNotice('monthlySpotlight')).toBeUndefined();
  });
});
