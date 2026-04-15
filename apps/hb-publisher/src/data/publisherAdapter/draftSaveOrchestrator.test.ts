import { describe, expect, it, vi } from 'vitest';
import { createDraftSaveOrchestrator } from './draftSaveOrchestrator';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from './publisherContracts';
import type { PublisherRepositories } from './publisherRepositories';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Title',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'title',
    TemplateKey: 'tmpl-v1',
    WorkflowState: 'draft',
    Subhead: 'sub',
    SummaryExcerpt: 'summary',
    BodyRichText: '<p>body</p>',
    HeroPrimaryImage: 'https://img.example/h.jpg',
    HeroPrimaryImageAltText: 'alt',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-01T00:00:00Z',
    ...over,
  };
}

function member(id: string): PublisherTeamMemberRow {
  return {
    ArticleId: 'art-1',
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    ArticleId: 'art-1',
    MediaId: id,
    Title: id,
    MediaRole: 'gallery',
    ImageAsset: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
  };
}

interface Fixture {
  repositories: PublisherRepositories;
  articleUpsert: ReturnType<typeof vi.fn>;
  teamReplace: ReturnType<typeof vi.fn>;
  mediaReplace: ReturnType<typeof vi.fn>;
}

function buildFixture(over: {
  articleImpl?: PublisherRepositories['articles']['upsert'];
  teamImpl?: PublisherRepositories['teamMembers']['replaceAllForArticle'];
  mediaImpl?: PublisherRepositories['media']['replaceAllForArticle'];
} = {}): Fixture {
  const articleUpsert = vi.fn(
    over.articleImpl ?? (async () => ({ wasCreated: false, itemId: 1 })),
  );
  const teamReplace = vi.fn(
    over.teamImpl ??
      (async () => ({ created: 0, updated: 0, deleted: 0, written: 0 })),
  );
  const mediaReplace = vi.fn(
    over.mediaImpl ??
      (async () => ({ created: 0, updated: 0, deleted: 0, written: 0 })),
  );
  const repositories: PublisherRepositories = {
    articles: {
      getByArticleId: vi.fn(async () => undefined),
      listByWorkflowState: vi.fn(async () => []),
      upsert: articleUpsert,
    },
    teamMembers: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: teamReplace,
    },
    media: {
      listByArticle: vi.fn(async () => []),
      replaceAllForArticle: mediaReplace,
    },
    templateRegistry: {
      listActive: vi.fn(async () => []),
      getByKey: vi.fn(async () => undefined),
    },
    pageBindings: {
      getByArticleId: vi.fn(async () => undefined),
      upsert: vi.fn(async () => ({
        bindingId: 'bnd',
        wasCreated: false,
        itemId: 1,
      })),
    },
    workflowHistory: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    publishingErrors: {
      listByArticle: vi.fn(async () => []),
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    promotionRules: {
      listActive: vi.fn(async () => []),
    },
  };
  return { repositories, articleUpsert, teamReplace, mediaReplace };
}

describe('createDraftSaveOrchestrator', () => {
  it('returns ok with full persistence map on the happy path, in the correct sequence', async () => {
    const f = buildFixture();
    const calls: string[] = [];
    f.articleUpsert.mockImplementation(async () => {
      calls.push('article');
      return { wasCreated: false, itemId: 1 };
    });
    f.teamReplace.mockImplementation(async () => {
      calls.push('team');
      return { created: 0, updated: 0, deleted: 0, written: 1 };
    });
    f.mediaReplace.mockImplementation(async () => {
      calls.push('media');
      return { created: 0, updated: 0, deleted: 0, written: 1 };
    });

    const save = createDraftSaveOrchestrator(f.repositories);
    const outcome = await save.save({
      article: article(),
      teamMembers: [member('alice')],
      media: [mediaRow('g1')],
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.persisted).toEqual({
      article: true,
      teamMembers: true,
      media: true,
    });
    expect(calls).toEqual(['article', 'team', 'media']);
  });

  it('classifies an articleUpsert failure; no child writes attempted; master not persisted', async () => {
    const f = buildFixture({
      articleImpl: async () => {
        throw new Error('SP 500 on articles');
      },
    });
    const save = createDraftSaveOrchestrator(f.repositories);
    const outcome = await save.save({
      article: article(),
      teamMembers: [member('alice')],
      media: [mediaRow('g1')],
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('articleUpsert');
    expect(outcome.persisted).toEqual({
      article: false,
      teamMembers: false,
      media: false,
    });
    expect(outcome.article).toBeUndefined();
    expect(outcome.message).toContain('SP 500 on articles');
    expect(f.teamReplace).not.toHaveBeenCalled();
    expect(f.mediaReplace).not.toHaveBeenCalled();
  });

  it('surfaces teamMembersWrite failure truthfully: master committed, team + media not persisted, media write is skipped', async () => {
    const f = buildFixture({
      teamImpl: async () => {
        throw new Error('team keyed-sync failed');
      },
    });
    const save = createDraftSaveOrchestrator(f.repositories);
    const articleRow = article();
    const outcome = await save.save({
      article: articleRow,
      teamMembers: [member('alice')],
      media: [mediaRow('g1')],
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('teamMembersWrite');
    expect(outcome.persisted).toEqual({
      article: true,
      teamMembers: false,
      media: false,
    });
    expect(outcome.article).toBe(articleRow);
    expect(outcome.message).toContain('team keyed-sync failed');
    expect(f.mediaReplace).not.toHaveBeenCalled();
  });

  it('surfaces mediaWrite failure truthfully: master + team committed, media not persisted', async () => {
    const f = buildFixture({
      mediaImpl: async () => {
        throw new Error('media keyed-sync failed');
      },
    });
    const save = createDraftSaveOrchestrator(f.repositories);
    const articleRow = article();
    const outcome = await save.save({
      article: articleRow,
      teamMembers: [member('alice')],
      media: [mediaRow('g1')],
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.stage).toBe('mediaWrite');
    expect(outcome.persisted).toEqual({
      article: true,
      teamMembers: true,
      media: false,
    });
    expect(outcome.article).toBe(articleRow);
    expect(outcome.message).toContain('media keyed-sync failed');
  });

  it('passes the article row, team, and media through to the repositories unchanged (no destructive rewrite)', async () => {
    const f = buildFixture();
    const save = createDraftSaveOrchestrator(f.repositories);
    const articleRow = article({ Title: 'Preserved title' });
    const team = [member('alice'), member('bob')];
    const media = [mediaRow('g1'), mediaRow('g2')];
    await save.save({ article: articleRow, teamMembers: team, media });
    expect(f.articleUpsert).toHaveBeenCalledWith(articleRow);
    expect(f.teamReplace).toHaveBeenCalledWith('art-1', team);
    expect(f.mediaReplace).toHaveBeenCalledWith('art-1', media);
  });
});
