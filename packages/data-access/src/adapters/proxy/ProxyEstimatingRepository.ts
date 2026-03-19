import type { IEstimatingRepository } from '../../ports/IEstimatingRepository.js';
import type { IEstimatingTracker, IEstimatingKickoff, IListQueryOptions, IPagedResult } from '@hbc/models';
import type { ProxyHttpClient, RequestMetadata } from './ProxyHttpClient.js';
import { NotFoundError } from '../../errors/index.js';
import { parseItemEnvelope, parsePagedEnvelope } from './envelope.js';
import { buildResourcePath, buildQueryParams } from './paths.js';

/**
 * Proxy adapter for the Estimating domain.
 *
 * Manages two entity types:
 * - Trackers: global top-level resource at /api/estimating/trackers
 * - Kickoffs: project-scoped at /api/estimating/kickoffs/{projectId}
 *
 * Tracker IDs and Kickoff IDs are numeric integers.
 */
export class ProxyEstimatingRepository implements IEstimatingRepository {
  constructor(private readonly client: ProxyHttpClient) {}

  // =========================================================================
  // Tracker methods
  // =========================================================================

  async getAllTrackers(options?: IListQueryOptions): Promise<IPagedResult<IEstimatingTracker>> {
    const raw = await this.client.get<unknown>(
      '/api/estimating/trackers',
      buildQueryParams(options),
      { domain: 'estimating', operation: 'getAllTrackers' },
    );
    return parsePagedEnvelope<IEstimatingTracker>(raw);
  }

  async getTrackerById(id: number): Promise<IEstimatingTracker | null> {
    try {
      const raw = await this.client.get<unknown>(
        `/api/estimating/trackers/${id}`,
        undefined,
        { domain: 'estimating', operation: 'getTrackerById' },
      );
      return parseItemEnvelope<IEstimatingTracker>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  async createTracker(data: Omit<IEstimatingTracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<IEstimatingTracker> {
    const raw = await this.client.post<unknown>(
      '/api/estimating/trackers',
      data,
      { domain: 'estimating', operation: 'createTracker' },
    );
    return parseItemEnvelope<IEstimatingTracker>(raw);
  }

  async updateTracker(id: number, data: Partial<IEstimatingTracker>): Promise<IEstimatingTracker> {
    const raw = await this.client.put<unknown>(
      `/api/estimating/trackers/${id}`,
      data,
      { domain: 'estimating', operation: 'updateTracker' },
    );
    return parseItemEnvelope<IEstimatingTracker>(raw);
  }

  async deleteTracker(id: number): Promise<void> {
    await this.client.delete(`/api/estimating/trackers/${id}`, { domain: 'estimating', operation: 'deleteTracker' });
  }

  // =========================================================================
  // Kickoff methods
  // =========================================================================

  async getKickoff(projectId: string): Promise<IEstimatingKickoff | null> {
    try {
      const raw = await this.client.get<unknown>(
        `/api/estimating/kickoffs/${projectId}`,
        undefined,
        { domain: 'estimating', operation: 'getKickoff' },
      );
      return parseItemEnvelope<IEstimatingKickoff>(raw);
    } catch (err) {
      if (err instanceof NotFoundError) return null;
      throw err;
    }
  }

  async createKickoff(data: Omit<IEstimatingKickoff, 'id' | 'createdAt'>): Promise<IEstimatingKickoff> {
    const raw = await this.client.post<unknown>(
      `/api/estimating/kickoffs`,
      data,
      { domain: 'estimating', operation: 'createKickoff' },
    );
    return parseItemEnvelope<IEstimatingKickoff>(raw);
  }
}
