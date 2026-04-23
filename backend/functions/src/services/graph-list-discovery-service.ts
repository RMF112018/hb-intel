import { GraphListClient } from './legacy-fallback/graph-list-client.js';

/**
 * Graph data-plane list discovery seam.
 *
 * Centralizes all "does this SharePoint list exist / what is its id / what
 * writable columns does it have" calls behind Microsoft Graph, so Safety
 * provisioning and ingestion do not reach into PnP/REST for discovery and so
 * the `GraphListClient` cache lives in exactly one place.
 */
export interface IGraphListDiscoveryService {
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;
  resolveListId(siteUrl: string, listTitle: string): Promise<string>;
  getWritableColumnNames(siteUrl: string, listTitle: string): Promise<Set<string>>;
  /** Returns the raw cached `GraphListClient` for callers that need Graph access beyond list discovery. */
  getClient(siteUrl: string): GraphListClient;
}

export class GraphListDiscoveryService implements IGraphListDiscoveryService {
  private readonly clients = new Map<string, GraphListClient>();

  getClient(siteUrl: string): GraphListClient {
    const normalized = siteUrl.replace(/\/+$/, '');
    const cached = this.clients.get(normalized);
    if (cached) return cached;
    const client = new GraphListClient(normalized);
    this.clients.set(normalized, client);
    return client;
  }

  listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    return this.getClient(siteUrl).listExists(listTitle);
  }

  resolveListId(siteUrl: string, listTitle: string): Promise<string> {
    return this.getClient(siteUrl).resolveListId(listTitle);
  }

  getWritableColumnNames(siteUrl: string, listTitle: string): Promise<Set<string>> {
    return this.getClient(siteUrl).getWritableColumnNames(listTitle);
  }
}
