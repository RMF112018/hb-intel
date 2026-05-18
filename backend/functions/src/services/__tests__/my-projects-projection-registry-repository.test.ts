import { describe, expect, it } from 'vitest';

import { GraphListClient } from '../legacy-fallback/graph-list-client.js';
import { createGraphMyProjectsRegistryRepository } from '../my-projects-projection/registry/my-projects-registry-repository.js';
import type { IMyProjectsRegistryRowFields } from '../my-projects-projection/registry/my-projects-registry-row-mapper.js';

interface IListItemsCall {
  filter?: string;
  select?: readonly string[];
  top?: number;
}

class FakeGraphListClient extends GraphListClient {
  public listItemsCalls: Array<{ listTitle: string; query: IListItemsCall }> = [];
  public addItemCalls: Array<{ listTitle: string; fields: Record<string, unknown> }> = [];
  public updateAllowNullCalls: Array<{
    listTitle: string;
    itemId: number | string;
    fields: Record<string, unknown>;
  }> = [];
  public itemsToReturn: Array<{ id: string; fields: Record<string, unknown> }> = [];

  constructor() {
    super('https://example.test/site', {
      async getGraphAccessToken() {
        return 'fake-token';
      },
    });
  }

  override async listItems(listTitle: string, query: any = {}): Promise<any> {
    this.listItemsCalls.push({ listTitle, query });
    return this.itemsToReturn;
  }
  override async addItem(listTitle: string, fields: Record<string, unknown>): Promise<any> {
    this.addItemCalls.push({ listTitle, fields });
    return { id: '5001', fields };
  }
  override async updateItemAllowNulls(
    listTitle: string,
    itemId: number | string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    this.updateAllowNullCalls.push({ listTitle, itemId, fields });
  }
}

const ROW: IMyProjectsRegistryRowFields = {
  Title: 'k',
  ProjectionKey: 'k',
  RecordKey: 'projects:101',
  UserUpn: 'lead@hb.example.com',
  ProjectionSource: 'projects-only',
  IsActive: true,
  ProjectionVersion: 'v1',
  ProjectionContentHash: 'hash-1',
  ProjectNumber: '24-101',
  ProjectName: 'Riverwalk',
  AssignmentRolesJson: '["leadEstimator"]',
  SharePointActionState: 'available',
  SharePointActionKind: 'project-site',
  SharePointActionLabel: 'Open SharePoint Site',
  ProcoreActionState: 'unavailable',
  ProcoreActionLabel: 'Procore unavailable',
  BuildingConnectedActionState: 'unavailable',
  BuildingConnectedActionLabel: 'BuildingConnected unavailable',
  DocumentCrunchActionState: 'unavailable',
  DocumentCrunchActionLabel: 'Document Crunch unavailable',
  LastProjectedAtUtc: '2026-05-18T00:00:00.000Z',
  ProjectionBatchId: 'batch-1',
};

describe('createGraphMyProjectsRegistryRepository', () => {
  it('findByProjectionKey builds a $filter on indexed ProjectionKey and escapes quotes', async () => {
    const graph = new FakeGraphListClient();
    graph.itemsToReturn = [];
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    await repo.findByProjectionKey("user's-hash");
    expect(graph.listItemsCalls).toHaveLength(1);
    expect(graph.listItemsCalls[0].query.filter).toEqual("fields/ProjectionKey eq 'user''s-hash'");
    expect(graph.listItemsCalls[0].query.top).toEqual(1);
  });

  it('findByProjectsListItemId builds a numeric eq filter', async () => {
    const graph = new FakeGraphListClient();
    graph.itemsToReturn = [];
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    await repo.findByProjectsListItemId(101);
    expect(graph.listItemsCalls[0].query.filter).toEqual('fields/ProjectsListItemId eq 101');
  });

  it('findByLegacyRegistryItemId builds a numeric eq filter', async () => {
    const graph = new FakeGraphListClient();
    graph.itemsToReturn = [];
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    await repo.findByLegacyRegistryItemId(9);
    expect(graph.listItemsCalls[0].query.filter).toEqual('fields/LegacyRegistryItemId eq 9');
  });

  it('insertRow forwards a sanitized full-row field set to Graph addItem', async () => {
    const graph = new FakeGraphListClient();
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    const result = await repo.insertRow(ROW);
    expect(graph.addItemCalls).toHaveLength(1);
    expect(graph.addItemCalls[0].fields.ProjectionKey).toEqual('k');
    expect(graph.addItemCalls[0].fields.IsActive).toBe(true);
    expect(result.listItemId).toEqual(5001);
  });

  it('patchRow routes through updateItemAllowNulls so null values clear SharePoint columns', async () => {
    const graph = new FakeGraphListClient();
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    await repo.patchRow(5001, {
      IsActive: true,
      DeactivatedAtUtc: null,
      DeactivationReason: null,
      ProjectionBatchId: 'batch-2',
      LastProjectedAtUtc: '2026-05-18T01:00:00.000Z',
    });
    expect(graph.updateAllowNullCalls).toHaveLength(1);
    const payload = graph.updateAllowNullCalls[0].fields;
    expect(payload.IsActive).toBe(true);
    expect(payload.DeactivatedAtUtc).toBeNull();
    expect(payload.DeactivationReason).toBeNull();
  });

  it('mapping returns null for rows missing ProjectionKey', async () => {
    const graph = new FakeGraphListClient();
    graph.itemsToReturn = [{ id: '1', fields: {} }];
    const repo = createGraphMyProjectsRegistryRepository({ graph });
    const result = await repo.findByProjectionKey('does-not-exist');
    expect(result).toBeNull();
  });
});
