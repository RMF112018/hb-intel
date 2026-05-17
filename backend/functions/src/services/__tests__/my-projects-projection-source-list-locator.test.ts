import { describe, expect, it, vi } from 'vitest';
import {
  createProjectionSourceListLocator,
  type IGraphSiteListResolver,
} from '../my-projects-projection/subscriptions/projection-source-list-locator.js';

const CONFIG = {
  sourceSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
  projectsListTitle: 'Projects',
  legacyRegistryListTitle: 'Legacy Project Fallback Registry',
} as const;

function makeResolver(opts: { siteId?: string; listIds?: Record<string, string> } = {}): {
  resolver: IGraphSiteListResolver;
  siteCalls: string[];
  listCalls: Array<{ siteId: string; title: string }>;
} {
  const siteId = opts.siteId ?? 'site-123';
  const listIds = opts.listIds ?? {
    Projects: 'list-projects-id',
    'Legacy Project Fallback Registry': 'list-legacy-id',
  };
  const siteCalls: string[] = [];
  const listCalls: Array<{ siteId: string; title: string }> = [];
  const resolver: IGraphSiteListResolver = {
    async resolveSiteId(url) {
      siteCalls.push(url);
      return siteId;
    },
    async resolveListId(siteIdArg, title) {
      listCalls.push({ siteId: siteIdArg, title });
      const value = listIds[title];
      if (value === undefined) {
        throw new Error(`fake resolver: list '${title}' not configured`);
      }
      return value;
    },
  };
  return { resolver, siteCalls, listCalls };
}

describe('ProjectionSourceListLocator', () => {
  it('resolves Projects to canonical siteId + listId', async () => {
    const fake = makeResolver();
    const locator = createProjectionSourceListLocator({
      resolver: fake.resolver,
      config: CONFIG,
    });
    const location = await locator.resolve('Projects');
    expect(location).toEqual({
      siteId: 'site-123',
      listId: 'list-projects-id',
      listTitle: 'Projects',
    });
  });

  it('resolves LegacyRegistry to canonical siteId + listId', async () => {
    const fake = makeResolver();
    const locator = createProjectionSourceListLocator({
      resolver: fake.resolver,
      config: CONFIG,
    });
    const location = await locator.resolve('LegacyRegistry');
    expect(location).toEqual({
      siteId: 'site-123',
      listId: 'list-legacy-id',
      listTitle: 'Legacy Project Fallback Registry',
    });
  });

  it('caches the siteId across repeated resolves', async () => {
    const fake = makeResolver();
    const locator = createProjectionSourceListLocator({
      resolver: fake.resolver,
      config: CONFIG,
    });
    await locator.resolve('Projects');
    await locator.resolve('LegacyRegistry');
    expect(fake.siteCalls).toHaveLength(1);
  });

  it('caches the listId per source kind', async () => {
    const fake = makeResolver();
    const locator = createProjectionSourceListLocator({
      resolver: fake.resolver,
      config: CONFIG,
    });
    await locator.resolve('Projects');
    await locator.resolve('Projects');
    expect(fake.listCalls.filter((entry) => entry.title === 'Projects')).toHaveLength(1);
  });

  it('builds the canonical resource path', async () => {
    const fake = makeResolver();
    const locator = createProjectionSourceListLocator({
      resolver: fake.resolver,
      config: CONFIG,
    });
    expect(await locator.resolveResourcePath('Projects')).toBe(
      'sites/site-123/lists/list-projects-id',
    );
    expect(await locator.resolveResourcePath('LegacyRegistry')).toBe(
      'sites/site-123/lists/list-legacy-id',
    );
  });

  it('throws when sourceSiteUrl is empty', () => {
    const resolver: IGraphSiteListResolver = {
      resolveSiteId: vi.fn(),
      resolveListId: vi.fn(),
    };
    expect(() =>
      createProjectionSourceListLocator({
        resolver,
        config: { ...CONFIG, sourceSiteUrl: '' },
      }),
    ).toThrow(RangeError);
  });
});
