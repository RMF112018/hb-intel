/**
 * My Projects projection — source-list locator (pure).
 *
 * Maps `SourceListKind` ('Projects' | 'LegacyRegistry') to a stable
 * `{ siteId, listId }` pair by resolving the configured site URL + list
 * title through a Graph-aware injected resolver (production: thin adapter
 * over `GraphListClient`'s `resolveSiteId` / `resolveListId`).
 *
 * Cached per-instance — site/list IDs do not change at runtime, so a single
 * locator instance can serve repeated calls from the timer + admin handler.
 *
 * Test seam: inject a fake `IGraphSiteListResolver` to return canonical IDs
 * without any Graph call.
 */

import type { SourceListKind } from '../projection-types.js';

export interface IGraphSiteListResolver {
  resolveSiteId(siteUrl: string): Promise<string>;
  resolveListId(siteId: string, listTitle: string): Promise<string>;
}

export interface IProjectionSourceListLocatorConfig {
  readonly sourceSiteUrl: string;
  readonly projectsListTitle: string;
  readonly legacyRegistryListTitle: string;
}

export interface IProjectionSourceListLocation {
  readonly siteId: string;
  readonly listId: string;
  readonly listTitle: string;
}

export interface IProjectionSourceListLocator {
  resolve(sourceListKind: SourceListKind): Promise<IProjectionSourceListLocation>;
  resolveResourcePath(sourceListKind: SourceListKind): Promise<string>;
}

class ProjectionSourceListLocator implements IProjectionSourceListLocator {
  private readonly resolver: IGraphSiteListResolver;
  private readonly config: IProjectionSourceListLocatorConfig;
  private cachedSiteId: string | null = null;
  private readonly cachedListIdByKind: Partial<Record<SourceListKind, string>> = {};

  constructor(opts: {
    resolver: IGraphSiteListResolver;
    config: IProjectionSourceListLocatorConfig;
  }) {
    if (typeof opts.config.sourceSiteUrl !== 'string' || opts.config.sourceSiteUrl.length === 0) {
      throw new RangeError(
        'ProjectionSourceListLocator: config.sourceSiteUrl must be a non-empty URL.',
      );
    }
    this.resolver = opts.resolver;
    this.config = opts.config;
  }

  private titleFor(sourceListKind: SourceListKind): string {
    switch (sourceListKind) {
      case 'Projects':
        return this.config.projectsListTitle;
      case 'LegacyRegistry':
        return this.config.legacyRegistryListTitle;
      default: {
        const exhaustive: never = sourceListKind;
        throw new RangeError(
          `ProjectionSourceListLocator: unknown source list kind '${String(exhaustive)}'.`,
        );
      }
    }
  }

  private async getSiteId(): Promise<string> {
    if (this.cachedSiteId !== null) return this.cachedSiteId;
    this.cachedSiteId = await this.resolver.resolveSiteId(this.config.sourceSiteUrl);
    return this.cachedSiteId;
  }

  async resolve(sourceListKind: SourceListKind): Promise<IProjectionSourceListLocation> {
    const listTitle = this.titleFor(sourceListKind);
    const siteId = await this.getSiteId();
    const cachedListId = this.cachedListIdByKind[sourceListKind];
    if (cachedListId !== undefined) {
      return { siteId, listId: cachedListId, listTitle };
    }
    const listId = await this.resolver.resolveListId(siteId, listTitle);
    this.cachedListIdByKind[sourceListKind] = listId;
    return { siteId, listId, listTitle };
  }

  async resolveResourcePath(sourceListKind: SourceListKind): Promise<string> {
    const location = await this.resolve(sourceListKind);
    return `sites/${location.siteId}/lists/${location.listId}`;
  }
}

export function createProjectionSourceListLocator(opts: {
  resolver: IGraphSiteListResolver;
  config: IProjectionSourceListLocatorConfig;
}): IProjectionSourceListLocator {
  return new ProjectionSourceListLocator(opts);
}
