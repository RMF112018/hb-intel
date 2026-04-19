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

interface IRawProjectsRow {
  Id: number;
  Title?: string;
  field_2?: string;
  field_3?: string;
  Year?: number | null;
}

function trimToString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export interface ILegacyFallbackProjectIndexProvider {
  loadIndex(): Promise<readonly ILegacyFallbackProjectIndexRecord[]>;
}

export class LegacyFallbackProjectIndexProvider implements ILegacyFallbackProjectIndexProvider {
  private readonly credential = new DefaultAzureCredential();
  private readonly siteUrl = getLegacyFallbackListHostSiteUrl();

  async loadIndex(): Promise<readonly ILegacyFallbackProjectIndexRecord[]> {
    const sp: any = await this.getSP();
    const numberField = resolveSpField('projectNumber');
    const nameField = resolveSpField('projectName');
    const rows = (await sp.web.lists
      .getByTitle(PROJECTS_LIST_NAME)
      .items.select('Id', 'Title', numberField, nameField, 'Year')
      .top(5000)()) as IRawProjectsRow[];

    return rows
      .map((row) => {
        const projectNumber = trimToString(row.field_2);
        const explicitName = trimToString(row.field_3);
        const projectTitle = explicitName || trimToString(row.Title);
        if (!projectTitle) {
          return null;
        }
        return {
          projectListItemId: row.Id,
          projectNumber,
          projectTitle,
          normalizedProjectTitle: normalizeLegacyCandidateName(projectTitle),
          year: typeof row.Year === 'number' && Number.isInteger(row.Year) ? row.Year : null,
        } satisfies ILegacyFallbackProjectIndexRecord;
      })
      .filter((entry): entry is ILegacyFallbackProjectIndexRecord => Boolean(entry));
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
