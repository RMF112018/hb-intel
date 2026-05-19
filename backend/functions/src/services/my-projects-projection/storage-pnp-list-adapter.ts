import { DefaultAzureCredential } from '@azure/identity';
import { InjectHeaders } from '@pnp/queryable';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/fields/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import type { IFieldDefinition, IListDefinition } from '../sharepoint-service.js';
import {
  applyFieldSettingsUpdates,
  createSharePointField,
  type ILiveSharePointFieldSnapshot,
  type ISharePointListLike,
} from '../sharepoint-schema-provisioning/index.js';

export interface IStorageListRef {
  readonly title: string;
  listFields(): Promise<ILiveSharePointFieldSnapshot[]>;
  listFieldUniqueness(): Promise<Record<string, boolean>>;
  createField(field: IFieldDefinition): Promise<void>;
  applyFieldSettingsUpdates(
    fieldInternalName: string,
    updates: {
      required?: boolean;
      indexed?: boolean;
      defaultValue?: string;
      choices?: string[];
    },
  ): Promise<void>;
  applyUniqueValuesUpdate(fieldInternalName: string, enforceUnique: boolean): Promise<void>;
}

export interface IStorageListAdapter {
  getList(listTitle: string): Promise<IStorageListRef | null>;
  createList(descriptor: IListDefinition): Promise<IStorageListRef>;
}

export interface IPnPStorageListAdapterDeps {
  readonly hostSiteUrl: string;
  readonly bearerTokenResolver: () => Promise<string>;
}

export function createPnPStorageListAdapter(deps: IPnPStorageListAdapterDeps): IStorageListAdapter {
  async function newSp(): Promise<any> {
    const bearerToken = await deps.bearerTokenResolver();
    return (spfi(deps.hostSiteUrl) as any).using(
      InjectHeaders({ Authorization: `Bearer ${bearerToken}` }),
    );
  }

  function wrap(list: any, title: string): IStorageListRef {
    return {
      title,
      async listFields() {
        return (await list.fields
          .select(
            'InternalName',
            'Title',
            'TypeAsString',
            'Required',
            'Indexed',
            'DefaultValue',
            'Choices',
          )
          .top(5000)()) as ILiveSharePointFieldSnapshot[];
      },
      async listFieldUniqueness() {
        const rows = (await list.fields
          .select('InternalName', 'EnforceUniqueValues')
          .top(5000)()) as Array<{ InternalName: string; EnforceUniqueValues?: boolean }>;
        const out: Record<string, boolean> = {};
        for (const row of rows) {
          if (typeof row.InternalName !== 'string') continue;
          out[row.InternalName] = row.EnforceUniqueValues === true;
        }
        return out;
      },
      async createField(field: IFieldDefinition) {
        await createSharePointField(list as unknown as ISharePointListLike, field);
      },
      async applyFieldSettingsUpdates(fieldInternalName, updates) {
        await applyFieldSettingsUpdates(
          list as unknown as ISharePointListLike,
          title,
          fieldInternalName,
          updates,
        );
      },
      async applyUniqueValuesUpdate(fieldInternalName: string, enforceUnique: boolean) {
        const field = list.fields.getByInternalNameOrTitle(fieldInternalName);
        await field.update({ EnforceUniqueValues: enforceUnique });
      },
    };
  }

  return {
    async getList(listTitle: string): Promise<IStorageListRef | null> {
      const sp = await newSp();
      const allLists = (await sp.web.lists.select('Id', 'Title').top(5000)()) as Array<{
        Id: string;
        Title: string;
      }>;
      const exact = allLists.find((entry) => entry.Title === listTitle);
      if (!exact) return null;
      return wrap(sp.web.lists.getById(exact.Id), exact.Title);
    },
    async createList(descriptor: IListDefinition): Promise<IStorageListRef> {
      const sp = await newSp();
      const add = await sp.web.lists.add(
        descriptor.title,
        descriptor.description,
        descriptor.template,
        true,
      );
      return wrap(add.list, descriptor.title);
    },
  };
}

export async function resolveSharePointBearerToken(hostSiteUrl: string): Promise<string> {
  const explicitToken = process.env.SHAREPOINT_BEARER_TOKEN?.trim();
  if (explicitToken) return explicitToken;

  const credential = new DefaultAzureCredential();
  const tokenPromise = credential.getToken(`${new URL(hostSiteUrl).origin}/.default`);
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          'Timed out acquiring SharePoint token from DefaultAzureCredential. Set SHAREPOINT_BEARER_TOKEN or ensure managed identity/local Azure credentials are available.',
        ),
      );
    }, 20_000);
  });
  const token = await Promise.race([tokenPromise, timeoutPromise]);
  if (!token?.token) throw new Error('Could not acquire SharePoint access token.');
  return token.token;
}
