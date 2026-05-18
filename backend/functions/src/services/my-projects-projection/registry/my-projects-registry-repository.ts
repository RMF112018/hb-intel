/**
 * Graph-backed repository for the `My Projects Registry` helper list.
 *
 * Lookups (by ProjectionKey, ProjectsListItemId, LegacyRegistryItemId) use
 * `$filter` against the indexed fields specified by
 * `03_SharePoint_My_Projects_Registry_Schema.md`. Writes go through the
 * existing `GraphListClient.addItem` / `updateItem` (federated Graph token).
 *
 * The slice engine consumes `IMyProjectsRegistryRepository` and never depends
 * on Graph directly — a fake repository drives the unit tests.
 */

import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL,
  MY_PROJECTS_REGISTRY_LIST_TITLE,
} from '../registry-list-descriptor.js';
import type {
  IMyProjectsRegistryExistingRow,
  IMyProjectsRegistryRowFields,
  IMyProjectsRegistryRowPatch,
} from './my-projects-registry-row-mapper.js';

export interface IMyProjectsRegistryRepository {
  findByProjectionKey(projectionKey: string): Promise<IMyProjectsRegistryExistingRow | null>;
  findByProjectsListItemId(
    projectsListItemId: number,
  ): Promise<readonly IMyProjectsRegistryExistingRow[]>;
  findByLegacyRegistryItemId(
    legacyRegistryItemId: number,
  ): Promise<readonly IMyProjectsRegistryExistingRow[]>;
  insertRow(fields: IMyProjectsRegistryRowFields): Promise<{ readonly listItemId: number }>;
  /**
   * Patch business fields on an existing row. `null`-valued entries explicitly
   * clear the SharePoint column (used by reactivation to clear
   * `DeactivatedAtUtc` / `DeactivationReason`).
   */
  patchRow(listItemId: number, fields: IMyProjectsRegistryRowPatch): Promise<void>;
}

export interface IGraphMyProjectsRegistryRepositoryDeps {
  readonly graph: GraphListClient;
  readonly listTitle?: string;
}

const QUERY_SELECT_FIELDS = [
  'ProjectionKey',
  'UserUpn',
  'IsActive',
  'ProjectionContentHash',
  'RecordKey',
  'ProjectsListItemId',
  'LegacyRegistryItemId',
] as const;

function mapToExisting(entry: {
  id: string;
  fields: Record<string, unknown>;
}): IMyProjectsRegistryExistingRow | null {
  const fields = entry.fields;
  const projectionKey = typeof fields.ProjectionKey === 'string' ? fields.ProjectionKey : '';
  if (!projectionKey) return null;
  const userUpn = typeof fields.UserUpn === 'string' ? fields.UserUpn : '';
  const isActive =
    fields.IsActive === true ||
    fields.IsActive === 1 ||
    fields.IsActive === '1' ||
    fields.IsActive === 'true';
  const projectionContentHash =
    typeof fields.ProjectionContentHash === 'string' ? fields.ProjectionContentHash : '';
  const recordKey = typeof fields.RecordKey === 'string' ? fields.RecordKey : '';
  const projectsListItemId =
    typeof fields.ProjectsListItemId === 'number'
      ? fields.ProjectsListItemId
      : typeof fields.ProjectsListItemId === 'string' && fields.ProjectsListItemId !== ''
        ? Number(fields.ProjectsListItemId)
        : null;
  const legacyRegistryItemId =
    typeof fields.LegacyRegistryItemId === 'number'
      ? fields.LegacyRegistryItemId
      : typeof fields.LegacyRegistryItemId === 'string' && fields.LegacyRegistryItemId !== ''
        ? Number(fields.LegacyRegistryItemId)
        : null;
  return {
    listItemId: Number(entry.id),
    projectionKey,
    userUpn,
    isActive,
    projectionContentHash,
    recordKey,
    projectsListItemId: Number.isFinite(projectsListItemId as number)
      ? (projectsListItemId as number)
      : null,
    legacyRegistryItemId: Number.isFinite(legacyRegistryItemId as number)
      ? (legacyRegistryItemId as number)
      : null,
  };
}

export function createGraphMyProjectsRegistryRepository(
  deps: IGraphMyProjectsRegistryRepositoryDeps,
): IMyProjectsRegistryRepository {
  const listTitle = deps.listTitle ?? MY_PROJECTS_REGISTRY_LIST_TITLE;
  const graph = deps.graph;

  return {
    async findByProjectionKey(projectionKey) {
      const escaped = projectionKey.replace(/'/g, "''");
      const rows = await graph.listItems(listTitle, {
        filter: `fields/ProjectionKey eq '${escaped}'`,
        select: [...QUERY_SELECT_FIELDS],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapToExisting({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async findByProjectsListItemId(projectsListItemId) {
      const rows = await graph.listItems(listTitle, {
        filter: `fields/ProjectsListItemId eq ${projectsListItemId}`,
        select: [...QUERY_SELECT_FIELDS],
      });
      const out: IMyProjectsRegistryExistingRow[] = [];
      for (const row of rows) {
        const mapped = mapToExisting({ id: String(row.id), fields: row.fields });
        if (mapped) out.push(mapped);
      }
      return out;
    },
    async findByLegacyRegistryItemId(legacyRegistryItemId) {
      const rows = await graph.listItems(listTitle, {
        filter: `fields/LegacyRegistryItemId eq ${legacyRegistryItemId}`,
        select: [...QUERY_SELECT_FIELDS],
      });
      const out: IMyProjectsRegistryExistingRow[] = [];
      for (const row of rows) {
        const mapped = mapToExisting({ id: String(row.id), fields: row.fields });
        if (mapped) out.push(mapped);
      }
      return out;
    },
    async insertRow(fields) {
      const sanitized = sanitizeFieldsForGraph(fields as unknown as Record<string, unknown>);
      const result = await graph.addItem(listTitle, sanitized);
      return { listItemId: Number(result.id) };
    },
    async patchRow(listItemId, fields) {
      const sanitized = sanitizePatchForGraph(fields as unknown as Record<string, unknown>);
      await graph.updateItemAllowNulls(listTitle, listItemId, sanitized);
    },
  };
}

function sanitizeFieldsForGraph(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function sanitizePatchForGraph(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export {
  MY_PROJECTS_REGISTRY_LIST_HOST_SITE_URL,
  MY_PROJECTS_REGISTRY_LIST_TITLE,
} from '../registry-list-descriptor.js';
