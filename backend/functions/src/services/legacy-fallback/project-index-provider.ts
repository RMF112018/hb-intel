import { DefaultAzureCredential } from '@azure/identity';
import { InjectHeaders } from '@pnp/queryable';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import { PROJECTS_LIST_NAME } from '../projects-list-contract.js';
import { resolveSpField } from '../projects-list-mapper.js';
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
  private readonly credential = new DefaultAzureCredential();
  private readonly siteUrl = getLegacyFallbackListHostSiteUrl();

  async loadIndex(): Promise<readonly ILegacyFallbackProjectIndexRecord[]> {
    const sp: any = await this.getSP();
    const fieldNames = resolveProjectIndexFieldNames();
    const rows = (await sp.web.lists
      .getByTitle(PROJECTS_LIST_NAME)
      .items.select('Id', 'Title', fieldNames.numberField, fieldNames.nameField, fieldNames.yearField)
      .top(5000)()) as Array<Record<string, unknown>>;

    return rows
      .map((row) => mapProjectIndexRow(row, fieldNames))
      .filter((entry): entry is ILegacyFallbackProjectIndexRecord => entry !== null);
  }

  private async getSP(): Promise<any> {
    const origin = new URL(this.siteUrl).origin;
    const token = await this.credential.getToken(`${origin}/.default`);
    if (!token?.token) {
      throw new Error('Unable to acquire SharePoint access token for project index provider.');
    }

    return (spfi(this.siteUrl) as any).using(
      InjectHeaders({
        Authorization: `Bearer ${token.token}`,
      }),
    );
  }
}
