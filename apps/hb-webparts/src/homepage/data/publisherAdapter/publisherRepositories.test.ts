import { describe, expect, it, vi } from 'vitest';
import {
  createPublisherRepositories,
  type PublisherListAccess,
  type PublisherRepositoryWriters,
} from './publisherRepositories';
import { PUBLISHER_LISTS } from './publisherListDescriptors';

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
