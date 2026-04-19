import { PROJECTS_LIST_NAME } from '../projects-list-contract.js';
import { resolveSpField } from '../projects-list-mapper.js';
import { GraphListClient } from './graph-list-client.js';
import { getLegacyFallbackListHostSiteUrl } from './list-descriptors.js';
import { normalizeLegacyCandidateName } from './matching-contracts.js';
import type { ILegacyFallbackProjectIndexRecord } from './matching-engine.js';

export interface IProjectIndexFieldNames {
  readonly numberField: string;
  readonly nameField: string;
  readonly yearField: string;
}

function trimToString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveProjectIndexFieldNames(): IProjectIndexFieldNames {
  return {
    numberField: resolveSpField('projectNumber'),
    nameField: resolveSpField('projectName'),
    yearField: resolveSpField('year'),
  };
}

export function mapProjectIndexRow(
  row: Record<string, unknown>,
  fieldNames: IProjectIndexFieldNames,
): ILegacyFallbackProjectIndexRecord | null {
  const projectNumber = trimToString(row[fieldNames.numberField]);
  const explicitName = trimToString(row[fieldNames.nameField]);
  const projectTitle = explicitName || trimToString(row.Title);
  if (!projectTitle) {
    return null;
  }
  const rawYear = row[fieldNames.yearField];
  const year =
    typeof rawYear === 'number' && Number.isInteger(rawYear) ? rawYear : null;
  const projectListItemId = typeof row.Id === 'number' ? row.Id : Number(row.Id ?? 0);
  return {
    projectListItemId,
    projectNumber,
    projectTitle,
    normalizedProjectTitle: normalizeLegacyCandidateName(projectTitle),
    year,
  };
}

export interface ILegacyFallbackProjectIndexProvider {
  loadIndex(): Promise<readonly ILegacyFallbackProjectIndexRecord[]>;
}

export class LegacyFallbackProjectIndexProvider implements ILegacyFallbackProjectIndexProvider {
  private readonly graph = new GraphListClient(getLegacyFallbackListHostSiteUrl());

  async loadIndex(): Promise<readonly ILegacyFallbackProjectIndexRecord[]> {
    const fieldNames = resolveProjectIndexFieldNames();
    const rows = await this.graph.listItems(PROJECTS_LIST_NAME, {
      select: ['Title', fieldNames.numberField, fieldNames.nameField, fieldNames.yearField],
      top: 5000,
    });
    return rows
      .map((r) => mapProjectIndexRow({ Id: Number(r.id), ...r.fields }, fieldNames))
      .filter((entry): entry is ILegacyFallbackProjectIndexRecord => entry !== null);
  }
}
