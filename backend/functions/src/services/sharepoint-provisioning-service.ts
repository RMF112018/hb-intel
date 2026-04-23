import * as fs from 'node:fs';
import * as path from 'node:path';
import '@pnp/sp/appcatalog/index.js';
import '@pnp/sp/files/index.js';
import '@pnp/sp/folders/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/site-groups/index.js';
import '@pnp/sp/site-users/index.js';
import '@pnp/sp/security/index.js';
import '@pnp/sp/sites/index.js';
import '@pnp/sp/webs/index.js';
import type { IProvisioningAuditRecord } from '@hbc/models';
import {
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import {
  getPnPContext,
  isNotFoundError,
  waitForSite,
} from './sharepoint-common.js';

export interface IListDefinition {
  title: string;
  description: string;
  template: number;
  fields: IFieldDefinition[];
  provisioningOrder?: number;
  parentListTitle?: string;
  listFamily?: string;
}

export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User' | 'URL' | 'Lookup' | 'MultiLineText';
  required?: boolean;
  choices?: string[];
  defaultValue?: string;
  indexed?: boolean;
  lookupListTitle?: string;
  lookupFieldName?: string;
}

/**
 * Seam: SharePoint / PnP provisioning.
 *
 * Owns everything that mutates or inspects SharePoint through PnP/REST —
 * sites, libraries, lists, fields, permissions, hub association, web-part
 * install, file/folder upload, audit log writes, and readiness checks.
 *
 * Does NOT know about Safety-specific policy; Safety provisioning composes
 * this service along with `GraphListDiscoveryService`.
 */
export interface ISharePointProvisioningService {
  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string>;
  siteExists(projectId: string): Promise<string | null>;
  deleteSite(siteUrl: string): Promise<void>;

  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void>;
  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean>;
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;

  createDataLists(
    siteUrl: string,
    listDefinitions: IListDefinition[],
    context?: { projectNumber?: string },
  ): Promise<void>;

  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void>;
  uploadTemplateFile(
    siteUrl: string,
    entry: { fileName: string; targetLibrary: string; assetPath: string },
  ): Promise<boolean>;
  createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void>;
  fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean>;

  installWebParts(siteUrl: string): Promise<void>;
  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void>;
  assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string,
  ): Promise<void>;

  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void>;
  isHubAssociated(siteUrl: string): Promise<boolean>;
  disassociateHubSite(siteUrl: string): Promise<void>;

  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void>;

  /** Internal helper exposed for Safety provisioning composition. */
  ensureListExistsDetailed(siteUrl: string, listTitle: string): Promise<boolean>;
  /** Internal helper exposed for Safety provisioning composition. */
  ensureLibraryExistsDetailed(siteUrl: string, libraryName: string): Promise<boolean>;
  /** Exposes an authenticated PnPjs context for callers that need raw list access. */
  openPnPContext(siteUrl: string): Promise<any>;
  /** Exposes field creation for Safety container provisioning field-by-field path. */
  addListField(list: any, field: IFieldDefinition, siteUrl: string): Promise<void>;
}

export class SharePointProvisioningService implements ISharePointProvisioningService {
  private readonly tenantUrl: string;
  private readonly tokenService: IManagedIdentityTokenService;

  constructor(tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService()) {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    this.tokenService = tokenService;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  openPnPContext(siteUrl: string): Promise<any> {
    return getPnPContext(siteUrl, this.tokenService);
  }

  private getSiteUrl(projectNumber: string, projectName: string): string {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
    return `${this.tenantUrl}/sites/${projectNumber}-${slug}`;
  }

  async siteExists(projectId: string): Promise<string | null> {
    const sp: any = await this.openPnPContext(this.tenantUrl);
    try {
      const items = await sp.web.lists
        .getByTitle('ProvisioningAuditLog')
        .items.filter(`ProjectId eq '${projectId}' and Event eq 'Completed'`)
        .select('SiteUrl')();
      if (items.length > 0 && items[0].SiteUrl) {
        return items[0].SiteUrl as string;
      }
    } catch {
      // First runs may not have the audit list yet.
    }
    return null;
  }

  async createSite(projectId: string, projectNumber: string, projectName: string): Promise<string> {
    void projectId;
    const siteUrl = this.getSiteUrl(projectNumber, projectName);
    const sp: any = await this.openPnPContext(this.tenantUrl);

    await sp.sites.createCommunicationSite({
      Title: `${projectNumber} — ${projectName}`,
      Url: siteUrl,
      Description: `HB Intel project site for ${projectNumber} — ${projectName}`,
      Lcid: 1033,
    });

    await waitForSite(siteUrl, this.tokenService, 60_000);
    return siteUrl;
  }

  async deleteSite(siteUrl: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    await sp.site.delete();
  }

  async createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    await sp.web.lists.add(libraryName, '', 101, true);
  }

  async documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean> {
    const sp: any = await this.openPnPContext(siteUrl);
    try {
      await sp.web.lists.getByTitle(libraryName).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp: any = await this.openPnPContext(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async uploadTemplateFiles(siteUrl: string, _libraryName: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    const folder = sp.web.getFolderByServerRelativePath(
      `/${new URL(siteUrl).pathname.slice(1)}/Shared Documents`,
    );
    await folder.files.addUsingPath(
      'README.txt',
      Buffer.from(`HB Intel Project Site — ${siteUrl}\nCreated by provisioning saga.`),
      {
        Overwrite: true,
      },
    );
  }

  async createDataLists(
    siteUrl: string,
    listDefinitions: IListDefinition[],
    context?: { projectNumber?: string },
  ): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);

    const sorted = [...listDefinitions].sort(
      (a, b) => (a.provisioningOrder ?? 0) - (b.provisioningOrder ?? 0),
    );

    for (const def of sorted) {
      const alreadyExists = await this.listExists(siteUrl, def.title);
      if (alreadyExists) continue;

      const { list } = await sp.web.lists.add(def.title, def.description, def.template, true);
      for (const field of def.fields) {
        const resolvedDefault =
          field.defaultValue !== undefined && context?.projectNumber
            ? field.defaultValue.replace(/\{\{projectNumber\}\}/g, context.projectNumber)
            : field.defaultValue;

        switch (field.type) {
          case 'Number':
            await list.fields.addNumber(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'DateTime':
            await list.fields.addDateTime(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Boolean':
            await list.fields.addBoolean(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Choice':
            await list.fields.addChoice(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              Choices: field.choices ?? [],
            });
            break;
          case 'User':
            await list.fields.addUser(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'URL':
            await list.fields.addUrl(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Lookup': {
            const targetList = sp.web.lists.getByTitle(field.lookupListTitle ?? '');
            const targetInfo = await targetList.select('Id')();
            await list.fields.addLookup(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              LookupListId: targetInfo.Id,
              LookupFieldName: field.lookupFieldName ?? 'ID',
            });
            break;
          }
          case 'MultiLineText':
            await list.fields.addMultilineText(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              RichText: false,
            });
            break;
          case 'Text':
          default:
            await list.fields.addText(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
        }

        if (field.indexed === true) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ Indexed: true });
        }
        if (resolvedDefault !== undefined) {
          await list.fields
            .getByInternalNameOrTitle(field.internalName)
            .update({ DefaultValue: resolvedDefault });
        }
      }
    }
  }

  async createFolderIfNotExists(
    siteUrl: string,
    libraryName: string,
    folderPath: string,
  ): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    const relUrl = `/${new URL(siteUrl).pathname.slice(1)}/${libraryName}/${folderPath}`;
    try {
      await sp.web.getFolderByServerRelativePath(relUrl).select('Exists')();
    } catch {
      await sp.web.folders.addUsingPath(relUrl);
    }
  }

  async uploadTemplateFile(
    siteUrl: string,
    entry: { fileName: string; targetLibrary: string; assetPath: string },
  ): Promise<boolean> {
    const fullPath = path.resolve(__dirname, '../assets/templates/', entry.assetPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    const alreadyExists = await this.fileExists(siteUrl, entry.targetLibrary, entry.fileName);
    if (alreadyExists) {
      return true;
    }
    const sp: any = await this.openPnPContext(siteUrl);
    const folderUrl = `/${new URL(siteUrl).pathname.slice(1)}/${entry.targetLibrary}`;
    const folder = sp.web.getFolderByServerRelativePath(folderUrl);
    await folder.files.addUsingPath(entry.fileName, fs.readFileSync(fullPath), { Overwrite: false });
    return true;
  }

  async fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean> {
    const sp: any = await this.openPnPContext(siteUrl);
    const relUrl = `/${new URL(siteUrl).pathname.slice(1)}/${libraryName}/${fileName}`;
    try {
      await sp.web.getFileByServerRelativePath(relUrl).select('Exists')();
      return true;
    } catch {
      return false;
    }
  }

  async installWebParts(siteUrl: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    const appCatalogUrl = process.env.SHAREPOINT_APP_CATALOG_URL!;
    if (!appCatalogUrl) throw new Error('SHAREPOINT_APP_CATALOG_URL env var is required');

    const hbIntelAppId = process.env.HB_INTEL_SPFX_APP_ID!;
    if (!hbIntelAppId) throw new Error('HB_INTEL_SPFX_APP_ID env var is required');

    await sp.web.appcatalog.getAppById(hbIntelAppId).install();

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const apps = await sp.web.appcatalog.filter(`ProductId eq '${hbIntelAppId}'`)();
      if (apps[0]?.InstalledVersion) return;
      await new Promise((r) => setTimeout(r, 5000));
    }

    throw new Error('Web part installation did not complete within 60 seconds');
  }

  async setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    await sp.web.breakRoleInheritance(false, true);
    for (const upn of [...memberUpns, opexUpn]) {
      await sp.web.siteUsers
        .getByEmail(upn)
        .then(async (user: any) => {
          await sp.web.roleAssignments.add(user.Id, 1073741827);
        })
        .catch((err: unknown) => {
          throw new Error(
            `Failed to add user ${upn}: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    }
  }

  async assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string,
  ): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);

    await sp.web.breakRoleInheritance(false, true);

    const tenantId = process.env.AZURE_TENANT_ID;
    if (!tenantId) throw new Error('AZURE_TENANT_ID env var is required for group permission assignment');
    const claimIdentity = `c:0t.c|tenant|${entraGroupId}`;
    const userInfo = await sp.web.ensureUser(claimIdentity);
    const principalId: number = userInfo.data?.Id ?? userInfo.Id;

    const roleDef = await sp.web.roleDefinitions.getByName(permissionLevel).select('Id')();
    const roleDefId: number = roleDef.Id;

    try {
      await sp.web.roleAssignments.add(principalId, roleDefId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        return;
      }
      throw err;
    }
  }

  async associateHubSite(siteUrl: string, hubSiteId: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    await sp.site.joinHubSiteById(hubSiteId);
  }

  async isHubAssociated(siteUrl: string): Promise<boolean> {
    const sp: any = await this.openPnPContext(siteUrl);
    const siteInfo = (await sp.site.select('HubSiteId')()) as { HubSiteId?: string };
    return !!siteInfo.HubSiteId && siteInfo.HubSiteId !== '00000000-0000-0000-0000-000000000000';
  }

  async disassociateHubSite(siteUrl: string): Promise<void> {
    const sp: any = await this.openPnPContext(siteUrl);
    await sp.site.unJoinHubSite();
  }

  async writeAuditRecord(record: IProvisioningAuditRecord): Promise<void> {
    const sp: any = await this.openPnPContext(this.tenantUrl);
    const list = sp.web.lists.getByTitle('ProvisioningAuditLog');
    await list.items.add({
      Title: `${record.projectNumber} — ${record.event}`,
      ProjectId: record.projectId,
      ProjectNumber: record.projectNumber,
      ProjectName: record.projectName,
      CorrelationId: record.correlationId,
      Event: record.event,
      TriggeredBy: record.triggeredBy,
      SubmittedBy: record.submittedBy,
      Timestamp: record.timestamp,
      SiteUrl: record.siteUrl ?? '',
      ErrorSummary: record.errorSummary ?? '',
    });
  }

  async ensureListExistsDetailed(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp: any = await this.openPnPContext(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch (err) {
      if (isNotFoundError(err)) return false;
      throw err;
    }
  }

  ensureLibraryExistsDetailed(siteUrl: string, libraryName: string): Promise<boolean> {
    return this.ensureListExistsDetailed(siteUrl, libraryName);
  }

  async addListField(list: any, field: IFieldDefinition, siteUrl: string): Promise<void> {
    switch (field.type) {
      case 'Number':
        await list.fields.addNumber(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'DateTime':
        await list.fields.addDateTime(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Boolean':
        await list.fields.addBoolean(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Choice':
        await list.fields.addChoice(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          Choices: field.choices ?? [],
        });
        break;
      case 'User':
        await list.fields.addUser(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'URL':
        await list.fields.addUrl(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Lookup': {
        const sp: any = await this.openPnPContext(siteUrl);
        const targetList = sp.web.lists.getByTitle(field.lookupListTitle ?? '');
        const targetInfo = await targetList.select('Id')();
        await list.fields.addLookup(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          LookupListId: targetInfo.Id,
          LookupFieldName: field.lookupFieldName ?? 'ID',
        });
        break;
      }
      case 'MultiLineText':
        await list.fields.addMultilineText(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          RichText: false,
        });
        break;
      case 'Text':
      default:
        await list.fields.addText(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
    }
  }
}
