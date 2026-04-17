import { describe, expect, it, vi } from 'vitest';
import {
  createPublisherRepositories,
  type PublisherListAccess,
  type PublisherRepositoryWriters,
} from './publisherRepositories';
import { PUBLISHER_LISTS } from './publisherListDescriptors';
import { createReadDiagnosticsSink } from './publisherRowMappers';

function writersStub(): PublisherRepositoryWriters {
  return {
    articles: {
      upsert: vi.fn(async () => ({ wasCreated: false, itemId: 1 })),
    },
    teamMembers: {
      replaceAllForArticle: vi.fn(async () => ({
        deleted: 0,
        written: 0,
        created: 0,
        updated: 0,
      })),
    },
    media: {
      replaceAllForArticle: vi.fn(async () => ({
        deleted: 0,
        written: 0,
        created: 0,
        updated: 0,
      })),
    },
    pageBindings: {
      upsert: vi.fn(async () => ({
        ok: true,
        bindingId: 'bnd-1',
        itemId: 1,
        wasCreated: true,
      })),
    },
    workflowHistory: {
      append: vi.fn(async () => ({ itemId: 1 })),
    },
    publishingErrors: {
      append: vi.fn(async () => ({ itemId: 1 })),
    },
  } as unknown as PublisherRepositoryWriters;
}

describe('createPublisherRepositories.articles.listByWorkflowState', () => {
  it('adds destination scope filter when destinations are provided', async () => {
    const readList = vi.fn(async () => []);
    const access: PublisherListAccess = { readList };
    const repos = createPublisherRepositories(access, PUBLISHER_LISTS, writersStub());

    await repos.articles.listByWorkflowState('draft', {
      destinations: ['projectSpotlight'],
    });

    expect(readList).toHaveBeenCalledWith(
      PUBLISHER_LISTS.articles,
      expect.objectContaining({
        filter: "WorkflowState eq 'draft' and (Destination eq 'projectSpotlight')",
        orderBy: 'UpdatedDateUtc desc',
      }),
    );
  });

  it('keeps workflow-only filter when no destination scope is supplied', async () => {
    const readList = vi.fn(async () => []);
    const access: PublisherListAccess = { readList };
    const repos = createPublisherRepositories(access, PUBLISHER_LISTS, writersStub());

    await repos.articles.listByWorkflowState('review');

    expect(readList).toHaveBeenCalledWith(
      PUBLISHER_LISTS.articles,
      expect.objectContaining({
        filter: "WorkflowState eq 'review'",
        orderBy: 'UpdatedDateUtc desc',
      }),
    );
  });
});

describe('createPublisherRepositories — read-diagnostics (Wave-03 Prompt-03)', () => {
  function validTeamMemberRaw(over: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      Id: 42,
      ArticleId: 'art-001',
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      DisplayName: 'Alice',
      PersonPrincipal: { EMail: 'alice@example.com', Title: 'Alice' },
      ...over,
    };
  }

  function validMediaRaw(over: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      Id: 7,
      ArticleId: 'art-001',
      MediaId: 'm-1',
      Title: 'Gallery one',
      MediaRole: 'gallery',
      ImageAsset: 'https://img.example/g1.jpg',
      AltText: 'Gallery one alt text',
      ...over,
    };
  }

  function validBindingRaw(over: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      Id: 9,
      BindingId: 'bnd-001',
      ArticleId: 'art-001',
      Title: 'My binding',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageTemplateKey: 'ps-inprogress-monthly-v1',
      PublishStatus: 'published',
      ...over,
    };
  }

  it('captures a team-member rejection and preserves surviving valid rows — child row no longer silently dropped', async () => {
    const good = validTeamMemberRaw({ TeamMemberId: 'tm-1' });
    const bad = validTeamMemberRaw({
      Id: 43,
      TeamMemberId: 'tm-broken',
      PersonPrincipal: undefined,
    });
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [good, bad]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const rows = await repos.teamMembers.listByArticle('art-001');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.TeamMemberId).toBe('tm-1');

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('teamMembers');
    expect(diagnostics[0]?.reason).toMatch(/PersonPrincipal/);
    expect(diagnostics[0]?.rawItemId).toBe(43);
    expect(diagnostics[0]?.articleId).toBe('art-001');
  });

  it('captures a media-row rejection and preserves surviving valid rows', async () => {
    const good = validMediaRaw({ MediaId: 'm-ok' });
    const bad = validMediaRaw({ Id: 13, MediaId: 'm-bad', AltText: '' });
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [good, bad]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const rows = await repos.media.listByArticle('art-001');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.MediaId).toBe('m-ok');

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('media');
    expect(diagnostics[0]?.reason).toMatch(/missing or empty/i);
    expect(diagnostics[0]?.rawItemId).toBe(13);
  });

  it('fails closed on a malformed binding (primary-identity read) — surfaces as a control-plane diagnostic, not a silent undefined', async () => {
    const bad = validBindingRaw({ BindingId: '', PublishStatus: 'not-a-status' });
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [bad]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const result = await repos.pageBindings.getByArticleId('art-001');
    expect(result).toBeUndefined();

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('pageBindings');
    expect(diagnostics[0]?.reason).toMatch(/missing or empty|PublishStatus/i);
    // Must preserve the articleId the caller asked about so the
    // operator-facing surface can identify which article the failure
    // belongs to, even when the binding's own ArticleId column is
    // also malformed.
    expect(diagnostics[0]?.articleId).toBe('art-001');
  });

  it('does not push a diagnostic when SharePoint simply returned no rows — "not found" is distinct from "malformed"', async () => {
    const access: PublisherListAccess = { readList: vi.fn(async () => []) };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const result = await repos.pageBindings.getByArticleId('art-missing');
    expect(result).toBeUndefined();
    expect(sink.drain()).toHaveLength(0);
  });

  it('surfaces diagnostics through the repositories.readDiagnostics sink for downstream callers', async () => {
    const bad = validTeamMemberRaw({ Id: 5, TeamMemberId: undefined });
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [bad]),
    };
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
    );

    await repos.teamMembers.listByArticle('art-001');
    const diagnostics = repos.readDiagnostics.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('teamMembers');
    // Second drain is empty — drain clears the buffer.
    expect(repos.readDiagnostics.drain()).toHaveLength(0);
  });

  it('fails closed on duplicate master articles — first-match blind trust is gone (Wave-03 Prompt-04)', async () => {
    const row1 = { Id: 1, ArticleId: 'art-001' };
    const row2 = { Id: 2, ArticleId: 'art-001' };
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [row1, row2]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const result = await repos.articles.getByArticleId('art-001');
    expect(result).toBeUndefined();

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('articles');
    expect(diagnostics[0]?.reason).toMatch(/Duplicate master rows/);
    expect(diagnostics[0]?.reason).toContain('item ids 1, 2');
  });

  it('fails closed on duplicate binding rows — refuses to pick one', async () => {
    const row1 = { Id: 10, ArticleId: 'art-001', BindingId: 'bnd-a' };
    const row2 = { Id: 11, ArticleId: 'art-001', BindingId: 'bnd-b' };
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [row1, row2]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const result = await repos.pageBindings.getByArticleId('art-001');
    expect(result).toBeUndefined();

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('pageBindings');
    expect(diagnostics[0]?.reason).toMatch(/Duplicate binding rows/);
    expect(diagnostics[0]?.articleId).toBe('art-001');
  });

  it('fails closed on duplicate template registry rows — getByKey refuses to pick one', async () => {
    const row1 = { Id: 20, TemplateKey: 'tmpl-v1' };
    const row2 = { Id: 21, TemplateKey: 'tmpl-v1' };
    const access: PublisherListAccess = {
      readList: vi.fn(async () => [row1, row2]),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    const result = await repos.templateRegistry.getByKey('tmpl-v1');
    expect(result).toBeUndefined();

    const diagnostics = sink.drain();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.list).toBe('templateRegistry');
    expect(diagnostics[0]?.reason).toMatch(/Duplicate template registry rows/);
  });

  it('issues $top=2 on identity reads so a duplicate is always detectable', async () => {
    const readList = vi.fn(async () => []);
    const access: PublisherListAccess = { readList };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    await repos.articles.getByArticleId('art-001');
    await repos.pageBindings.getByArticleId('art-001');
    await repos.templateRegistry.getByKey('tmpl-v1');
    for (const call of readList.mock.calls) {
      const opts = call[1] as { top?: number } | undefined;
      expect(opts?.top).toBe(2);
    }
  });

  it('valid rows never push diagnostics (regression guard)', async () => {
    const access: PublisherListAccess = {
      readList: vi.fn(async (descriptor) => {
        if (descriptor.displayName === PUBLISHER_LISTS.teamMembers.displayName) {
          return [validTeamMemberRaw()];
        }
        if (descriptor.displayName === PUBLISHER_LISTS.media.displayName) {
          return [validMediaRaw()];
        }
        return [];
      }),
    };
    const sink = createReadDiagnosticsSink();
    const repos = createPublisherRepositories(
      access,
      PUBLISHER_LISTS,
      writersStub(),
      sink,
    );

    await repos.teamMembers.listByArticle('art-001');
    await repos.media.listByArticle('art-001');
    expect(sink.drain()).toHaveLength(0);
  });
});
