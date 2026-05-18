/**
 * Targeted source-list fetch client for the projection slice engine.
 *
 * The legacy aggregation provider loads the full Projects + Registry lists on
 * every read. The projection engine instead resolves only the rows it needs:
 *   - the changed source item (by ID),
 *   - counterpart resolution by explicit `MatchedProjectListItemId`,
 *   - counterpart resolution by `ProjectNumber + Year` (unique-fallback).
 *
 * The Graph-backed implementation reuses `GraphListClient` (federated app
 * token, same as the legacy loader path). Tests provide an in-memory fake
 * implementing `IProjectionSourceFetchClient`.
 */

import { MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS } from '@hbc/models/myWork';

import { PROJECTS_LIST_NAME } from '../../projects-list-contract.js';
import { resolveSpField } from '../../projects-list-mapper.js';
import { LEGACY_FALLBACK_REGISTRY_LIST_TITLE } from '../../legacy-fallback/list-descriptors.js';
import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  buildRoleFieldObjectFromRow,
  readOptionalNumber,
  readOptionalUrl,
  trimToString,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from '../../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';

export interface IProjectionSourceFetchClient {
  fetchProjectsRow(id: number): Promise<IProjectSourceRow | null>;
  fetchRegistryRow(id: number): Promise<ILegacyRegistrySourceRow | null>;
  findRegistryRowsByMatchedProjectId(
    projectsListItemId: number,
  ): Promise<readonly ILegacyRegistrySourceRow[]>;
  findRegistryRowsByNumberYear(
    projectNumber: string,
    year: number | null,
  ): Promise<readonly ILegacyRegistrySourceRow[]>;
  findProjectsRowsByNumberYear(
    projectNumber: string,
    year: number | null,
  ): Promise<readonly IProjectSourceRow[]>;
}

export interface ICreateGraphProjectionSourceFetchClientDeps {
  readonly graph: GraphListClient;
  readonly projectsListTitle?: string;
  readonly registryListTitle?: string;
}

function escapeFilterLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function projectSelectFields(): readonly string[] {
  return [
    'Title',
    resolveSpField('projectNumber'),
    resolveSpField('projectName'),
    resolveSpField('year'),
    resolveSpField('projectStage'),
    resolveSpField('siteUrl'),
    resolveSpField('procoreProject'),
    resolveSpField('buildingConnectedUrl'),
    resolveSpField('documentCrunchUrl'),
    resolveSpField('leadEstimatorUpn'),
    resolveSpField('supportingEstimatorUpns'),
    resolveSpField('projectManagerUpn'),
    resolveSpField('projectExecutiveUpn'),
    ...MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((d) => d.internalField),
  ];
}

function registrySelectFields(): readonly string[] {
  return [
    'ProjectNumber',
    'ProjectNameRaw',
    'LegacyYear',
    'FolderWebUrl',
    'MatchStatus',
    'MatchConfidence',
    'MatchMethod',
    'MatchedProjectListItemId',
    'IsActive',
    'procoreProject',
    'projectStage',
    'buildingConnectedUrl',
    'documentCrunchUrl',
    ...MY_PROJECT_ASSIGNMENT_ROLE_DEFINITIONS.map((d) => d.internalField),
  ];
}

function mapProjectsRow(entry: {
  id: string;
  fields: Record<string, unknown>;
}): IProjectSourceRow | null {
  const row: Record<string, unknown> = { Id: Number(entry.id), ...entry.fields };
  const projectNumber = trimToString(row[resolveSpField('projectNumber')]);
  const projectName = trimToString(row[resolveSpField('projectName')]) || trimToString(row.Title);
  if (!projectNumber || !projectName) return null;
  return {
    id: Number(row.Id),
    projectNumber,
    projectName,
    year: readOptionalNumber(row[resolveSpField('year')]),
    projectStage: trimToString(row[resolveSpField('projectStage')]) || undefined,
    siteUrl: readOptionalUrl(row[resolveSpField('siteUrl')]),
    procoreProject: trimToString(row[resolveSpField('procoreProject')]) || undefined,
    buildingConnectedUrl: trimToString(row[resolveSpField('buildingConnectedUrl')]) || undefined,
    documentCrunchUrl: trimToString(row[resolveSpField('documentCrunchUrl')]) || undefined,
    roleArrays: buildRoleFieldObjectFromRow(row),
    legacyRoleFallbacks: {
      leadEstimatorUpn: trimToString(row[resolveSpField('leadEstimatorUpn')]) || undefined,
      supportingEstimatorUpns: row[resolveSpField('supportingEstimatorUpns')],
      projectManagerUpn: trimToString(row[resolveSpField('projectManagerUpn')]) || undefined,
      projectExecutiveUpn: trimToString(row[resolveSpField('projectExecutiveUpn')]) || undefined,
    },
  };
}

function mapRegistryRow(entry: {
  id: string;
  fields: Record<string, unknown>;
}): ILegacyRegistrySourceRow {
  const row: Record<string, unknown> = { Id: Number(entry.id), ...entry.fields };
  return {
    id: Number(row.Id),
    projectNumber: trimToString(row.ProjectNumber),
    projectNameRaw: trimToString(row.ProjectNameRaw),
    legacyYear: readOptionalNumber(row.LegacyYear),
    isActive: row.IsActive === true || row.IsActive === 1 || row.IsActive === '1',
    folderWebUrl: readOptionalUrl(row.FolderWebUrl),
    matchStatus: trimToString(row.MatchStatus),
    matchConfidence: trimToString(row.MatchConfidence) || undefined,
    matchMethod: trimToString(row.MatchMethod) || undefined,
    matchedProjectListItemId: readOptionalNumber(row.MatchedProjectListItemId),
    procoreProject: trimToString(row.procoreProject) || undefined,
    projectStage: trimToString(row.projectStage) || undefined,
    buildingConnectedUrl: trimToString(row.buildingConnectedUrl) || undefined,
    documentCrunchUrl: trimToString(row.documentCrunchUrl) || undefined,
    roleArrays: buildRoleFieldObjectFromRow(row),
  };
}

export function createGraphProjectionSourceFetchClient(
  deps: ICreateGraphProjectionSourceFetchClientDeps,
): IProjectionSourceFetchClient {
  const projectsList = deps.projectsListTitle ?? PROJECTS_LIST_NAME;
  const registryList = deps.registryListTitle ?? LEGACY_FALLBACK_REGISTRY_LIST_TITLE;
  const graph = deps.graph;

  return {
    async fetchProjectsRow(id) {
      const rows = await graph.listItems(projectsList, {
        filter: `fields/Id eq ${id}`,
        select: [...projectSelectFields()],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapProjectsRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async fetchRegistryRow(id) {
      const rows = await graph.listItems(registryList, {
        filter: `fields/Id eq ${id}`,
        select: [...registrySelectFields()],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapRegistryRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async findRegistryRowsByMatchedProjectId(projectsListItemId) {
      const rows = await graph.listItems(registryList, {
        filter: `fields/MatchedProjectListItemId eq ${projectsListItemId}`,
        select: [...registrySelectFields()],
      });
      return rows.map((r) => mapRegistryRow({ id: String(r.id), fields: r.fields }));
    },
    async findRegistryRowsByNumberYear(projectNumber, year) {
      const filterClauses = [`fields/ProjectNumber eq '${escapeFilterLiteral(projectNumber)}'`];
      if (year !== null) {
        filterClauses.push(`fields/LegacyYear eq ${year}`);
      }
      const rows = await graph.listItems(registryList, {
        filter: filterClauses.join(' and '),
        select: [...registrySelectFields()],
      });
      const mapped = rows.map((r) => mapRegistryRow({ id: String(r.id), fields: r.fields }));
      // For null-year queries, surface only registry rows whose LegacyYear is
      // also null. Graph $filter cannot express `is null` reliably across
      // list-field types, so post-filter in memory.
      if (year === null) {
        return mapped.filter((row) => row.legacyYear === null);
      }
      return mapped;
    },
    async findProjectsRowsByNumberYear(projectNumber, year) {
      const filterClauses = [
        `fields/${resolveSpField('projectNumber')} eq '${escapeFilterLiteral(projectNumber)}'`,
      ];
      if (year !== null) {
        filterClauses.push(`fields/${resolveSpField('year')} eq ${year}`);
      }
      const rows = await graph.listItems(projectsList, {
        filter: filterClauses.join(' and '),
        select: [...projectSelectFields()],
      });
      const mapped: IProjectSourceRow[] = [];
      for (const r of rows) {
        const row = mapProjectsRow({ id: String(r.id), fields: r.fields });
        if (row) mapped.push(row);
      }
      if (year === null) {
        return mapped.filter((row) => row.year === null);
      }
      return mapped;
    },
  };
}
