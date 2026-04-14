/**
 * Terminology boundary drift guard (Phase-02 Prompt-14).
 *
 * Pins the three identities the codebase must keep separate:
 *   - App identity:        Article Publisher
 *   - Destination identity: Project Spotlight (current sprint's only
 *                           destination; preserved per the rebranding
 *                           report). Company Pulse is a planned future
 *                           destination, not yet implemented.
 *   - Data-model identity:  the tenant `HB Article*` lists keyed by
 *                           `ArticleId`; never `Post*`/`PostId`.
 *
 * The assertions below fail to compile or fail at runtime if the
 * publisher adapter surface drifts back toward the legacy `posts` /
 * `PostId` / `PublisherPostRow` framing.
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  PUBLISHER_LISTS,
  PUBLISHER_LIST_HOST_SITE_URL,
  type PublisherArticleRow,
  type PublisherListKey,
  type PublisherRepositories,
} from './index';

describe('terminology boundary — app / destination / data-model identities', () => {
  it('PublisherListKey carries the tenant-aligned `articles` key (not legacy `posts`)', () => {
    const all: readonly PublisherListKey[] = [
      'articles',
      'teamMembers',
      'media',
      'templateRegistry',
      'pageBindings',
      'workflowHistory',
      'publishingErrors',
      'promotionRules',
    ];
    for (const k of all) {
      expect(PUBLISHER_LISTS[k]).toBeDefined();
    }
    // Legacy `posts` key must not exist on the type.
    expectTypeOf<PublisherListKey>().not.toEqualTypeOf<'posts'>();
    expect((PUBLISHER_LISTS as unknown as Record<string, unknown>)['posts']).toBeUndefined();
  });

  it('the master list descriptor binds to the tenant `HB Articles` title on HBCentral', () => {
    expect(PUBLISHER_LISTS.articles.displayName).toBe('HB Articles');
    expect(PUBLISHER_LISTS.articles.hostSiteUrl).toBe(PUBLISHER_LIST_HOST_SITE_URL);
    expect(PUBLISHER_LIST_HOST_SITE_URL).toMatch(/sites\/HBCentral$/);
  });

  it('the master row contract is `PublisherArticleRow` keyed by `ArticleId` (no PostId field)', () => {
    expectTypeOf<PublisherArticleRow>().toHaveProperty('ArticleId').toBeString();
    // PostId is not on the master contract.
    expectTypeOf<PublisherArticleRow>().not.toHaveProperty('PostId');
  });

  it('the master repository exposes `getByArticleId` (no `getByPostId`)', () => {
    expectTypeOf<PublisherRepositories['articles']>().toHaveProperty('getByArticleId');
    expectTypeOf<PublisherRepositories['articles']>().not.toHaveProperty('getByPostId');
  });

  it('child repository methods speak the tenant `Article` vocabulary', () => {
    expectTypeOf<PublisherRepositories['teamMembers']>().toHaveProperty('listByArticle');
    expectTypeOf<PublisherRepositories['teamMembers']>().toHaveProperty('replaceAllForArticle');
    expectTypeOf<PublisherRepositories['media']>().toHaveProperty('listByArticle');
    expectTypeOf<PublisherRepositories['media']>().toHaveProperty('replaceAllForArticle');
    expectTypeOf<PublisherRepositories['pageBindings']>().toHaveProperty('getByArticleId');
    expectTypeOf<PublisherRepositories['workflowHistory']>().toHaveProperty('listByArticle');
    expectTypeOf<PublisherRepositories['publishingErrors']>().toHaveProperty('listByArticle');
  });
});
