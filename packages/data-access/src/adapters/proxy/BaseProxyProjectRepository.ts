/**
 * Base class for project-scoped proxy repositories.
 *
 * Provides shared CRUD primitives using D6 nested paths for collection
 * operations and domain-level paths for single-item lookups by ID.
 *
 * Port interface note: getById/update/delete take only `id` (no projectId).
 * These use a domain-level path (e.g., /schedules/{id}) since IDs are
 * globally unique. Collection and aggregate methods use the D6 nested
 * pattern (/projects/{projectId}/{domain}).
 */

import type { IListQueryOptions, IPagedResult } from '@hbc/models';
import { BaseRepository } from '../base.js';
import { NotFoundError } from '../../errors/index.js';
import type { ProxyHttpClient } from './ProxyHttpClient.js';
import { parseItemEnvelope, parsePagedEnvelope } from './envelope.js';
import { buildProjectScopedPath, buildResourcePath, buildQueryParams } from './paths.js';

export abstract class BaseProxyProjectRepository<T> extends BaseRepository<T> {
  protected abstract readonly domain: string;

  constructor(protected readonly client: ProxyHttpClient) {
    super();
  }

  protected async fetchCollection(
    projectId: string,
    options?: IListQueryOptions,
  ): Promise<IPagedResult<T>> {
    const raw = await this.client.get<unknown>(
      buildProjectScopedPath(projectId, this.domain),
      buildQueryParams(options),
    );
    return parsePagedEnvelope<T>(raw);
  }

  protected async fetchById(id: number | string): Promise<T | null> {
    try {
      const raw = await this.client.get<unknown>(
        buildResourcePath(this.domain, id),
      );
      return parseItemEnvelope<T>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  protected async fetchCreate<D>(projectId: string, data: D): Promise<T> {
    const raw = await this.client.post<unknown>(
      buildProjectScopedPath(projectId, this.domain),
      data,
    );
    return parseItemEnvelope<T>(raw);
  }

  protected async fetchUpdate<D>(id: number | string, data: D): Promise<T> {
    const raw = await this.client.put<unknown>(
      buildResourcePath(this.domain, id),
      data,
    );
    return parseItemEnvelope<T>(raw);
  }

  protected async fetchDelete(id: number | string): Promise<void> {
    await this.client.delete(buildResourcePath(this.domain, id));
  }

  protected async fetchAggregate<A>(projectId: string, subPath: string): Promise<A> {
    const raw = await this.client.get<unknown>(
      buildProjectScopedPath(projectId, this.domain) + `/${subPath}`,
    );
    return parseItemEnvelope<A>(raw);
  }

  protected async fetchSubResource<S>(parentId: number | string, subPath: string): Promise<S[]> {
    const raw = await this.client.get<unknown>(
      buildResourcePath(this.domain, parentId) + `/${subPath}`,
    );
    return parseItemEnvelope<S[]>(raw);
  }

  protected async createSubResource<D, S>(parentId: number | string, subPath: string, data: D): Promise<S> {
    const raw = await this.client.post<unknown>(
      buildResourcePath(this.domain, parentId) + `/${subPath}`,
      data,
    );
    return parseItemEnvelope<S>(raw);
  }
}
