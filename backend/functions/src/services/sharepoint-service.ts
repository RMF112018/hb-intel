import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/appcatalog/index.js';
import '@pnp/sp/files/index.js';
import '@pnp/sp/folders/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/site-groups/index.js';
import '@pnp/sp/site-users/index.js';
import '@pnp/sp/sites/index.js';
import '@pnp/sp/webs/index.js';
import type { IProvisioningAuditRecord } from '@hbc/models';

export interface ISharePointService {
  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string>;
  siteExists(projectId: string): Promise<string | null>;
  deleteSite(siteUrl: string): Promise<void>;
  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void>;
  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean>;
  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void>;
  createDataLists(siteUrl: string, listDefinitions: IListDefinition[]): Promise<void>;
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;
  installWebParts(siteUrl: string): Promise<void>;
  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void>;
  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void>;
  isHubAssociated(siteUrl: string): Promise<boolean>;
  disassociateHubSite(siteUrl: string): Promise<void>;
  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void>;

  // Backward-compatible methods retained for transition compatibility.
  applyWebParts(siteUrl: string): Promise<void>;
  setPermissions(siteUrl: string, projectId: string): Promise<void>;
  associateHub(siteUrl: string, hubSiteUrl: string): Promise<void>;
  removeHubAssociation(siteUrl: string): Promise<void>;
}

export interface IListDefinition {
  title: string;
  description: string;
  template: number;
  fields: IFieldDefinition[];
}

export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User' | 'URL';
  required?: boolean;
  choices?: string[];
}

/**
 * D-PH6-05: Real SharePoint adapter for provisioning saga idempotency + compensation contracts.
 * Uses Managed Identity tokens with PnPjs and centralizes list/site operations for Steps 1-7.
 */
export class SharePointService implements ISharePointService {
  private readonly tenantUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  /** Derives a deterministic site URL from project metadata for idempotent retries. */
  private getSiteUrl(projectNumber: string, projectName: string): string {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
    return `${this.tenantUrl}/sites/${projectNumber}-${slug}`;
  }

  async siteExists(projectId: string): Promise<string | null> {
    // D-PH6-05 idempotency guard: audit log lookup avoids duplicating site creation.
    const sp: any = await this.getSP(this.tenantUrl);
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
    const sp: any = await this.getSP(this.tenantUrl);

    await sp.sites.createCommunicationSite({
      Title: `${projectNumber} — ${projectName}`,
      Url: siteUrl,
      Description: `HB Intel project site for ${projectNumber} — ${projectName}`,
      Lcid: 1033,
    });

    // D-PH6-05: poll readiness to avoid race conditions in downstream steps.
    await this.waitForSite(siteUrl, 60_000);
    return siteUrl;
  }

  async deleteSite(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.delete();
  }

  async createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.web.lists.add(libraryName, '', 101, true);
  }

  async documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(libraryName).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async uploadTemplateFiles(siteUrl: string, _libraryName: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    const folder = sp.web.getFolderByServerRelativePath(
      `/${new URL(siteUrl).pathname.slice(1)}/Shared Documents`
    );
    await folder.files.addUsingPath(
      'README.txt',
      Buffer.from(`HB Intel Project Site — ${siteUrl}\nCreated by provisioning saga.`),
      {
        Overwrite: true,
      }
    );
  }

  async createDataLists(siteUrl: string, listDefinitions: IListDefinition[]): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    for (const def of listDefinitions) {
      const alreadyExists = await this.listExists(siteUrl, def.title);
      if (alreadyExists) continue;

      const { list } = await sp.web.lists.add(def.title, def.description, def.template, true);
      for (const field of def.fields) {
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
  }

  async listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * D-PH6-05 Step 5 implementation: installs HB Intel SPFx app from tenant App Catalog
   * and polls until installation is visible or timeout is reached.
   */
  async installWebParts(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    const appCatalogUrl = process.env.SHAREPOINT_APP_CATALOG_URL!;
    if (!appCatalogUrl) throw new Error('SHAREPOINT_APP_CATALOG_URL env var is required');

    const hbIntelAppId = process.env.HB_INTEL_SPFX_APP_ID!;
    if (!hbIntelAppId) throw new Error('HB_INTEL_SPFX_APP_ID env var is required');

    // The app catalog URL is validated by env presence; installation call executes on target web.
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
    const sp: any = await this.getSP(siteUrl);
    await sp.web.breakRoleInheritance(false, true);
    for (const upn of [...memberUpns, opexUpn]) {
      await sp.web.siteUsers
        .getByEmail(upn)
        .then(async (user: any) => {
          await sp.web.roleAssignments.add(user.Id, 1073741827);
        })
        .catch((err: unknown) => {
          throw new Error(
            `Failed to add user ${upn}: ${err instanceof Error ? err.message : String(err)}`
          );
        });
    }
  }

  async associateHubSite(siteUrl: string, hubSiteId: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.joinHubSiteById(hubSiteId);
  }

  async isHubAssociated(siteUrl: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    const siteInfo = (await sp.site.select('HubSiteId')()) as { HubSiteId?: string };
    return (
      !!siteInfo.HubSiteId && siteInfo.HubSiteId !== '00000000-0000-0000-0000-000000000000'
    );
  }

  async disassociateHubSite(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.unJoinHubSite();
  }

  async writeAuditRecord(record: IProvisioningAuditRecord): Promise<void> {
    const sp: any = await this.getSP(this.tenantUrl);
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

  /** Compatibility wrapper for older Step 5 callsites. */
  async applyWebParts(siteUrl: string): Promise<void> {
    await this.installWebParts(siteUrl);
  }

  /** Compatibility wrapper for pre-PH6.5 step contract. */
  async setPermissions(_siteUrl: string, _projectId: string): Promise<void> {
    return;
  }

  /** Compatibility wrapper for pre-PH6.5 step contract. */
  async associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    const hubSiteId = hubSiteUrl;
    await this.associateHubSite(siteUrl, hubSiteId);
  }

  /** Compatibility wrapper for pre-PH6.5 compensation contract. */
  async removeHubAssociation(siteUrl: string): Promise<void> {
    await this.disassociateHubSite(siteUrl);
  }

  private async getSP(siteUrl: string): Promise<any> {
    const token = await this.credential.getToken(`${new URL(this.tenantUrl).origin}/.default`);
    return (spfi(siteUrl) as any).using({
      // D-PH6-05 Managed Identity token binding for all PnPjs requests.
      bind(instance: any) {
        instance.on.auth.replace(async (_: unknown, req: Request, done: (request: Request) => void) => {
          req.headers.set('Authorization', `Bearer ${token!.token}`);
          done(req);
        });
      },
    } as any);
  }

  /** D-PH6-05 readiness poll loop for post-create eventual consistency in SharePoint. */
  private async waitForSite(siteUrl: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const sp = await this.getSP(siteUrl);
        await sp.web.select('Title')();
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    throw new Error(`Site at ${siteUrl} did not become available within ${timeoutMs}ms`);
  }
}

/**
 * D-PH6-05 mock adapter used for tests/local mock mode where real SharePoint access is disabled.
 */
export class MockSharePointService implements ISharePointService {
  async createSite(_projectId: string, projectNumber: string, _projectName: string): Promise<string> {
    return `https://contoso.sharepoint.com/sites/${projectNumber}`;
  }

  async siteExists(_projectId: string): Promise<string | null> {
    return null;
  }

  async deleteSite(_siteUrl: string): Promise<void> {}

  async createDocumentLibrary(_siteUrl: string, _libraryName: string): Promise<void> {}

  async documentLibraryExists(_siteUrl: string, _libraryName: string): Promise<boolean> {
    return false;
  }

  async uploadTemplateFiles(_siteUrl: string, _libraryName: string): Promise<void> {}

  async createDataLists(_siteUrl: string, _listDefinitions: IListDefinition[]): Promise<void> {}

  async listExists(_siteUrl: string, _listTitle: string): Promise<boolean> {
    return false;
  }

  async installWebParts(_siteUrl: string): Promise<void> {}

  async setGroupPermissions(_siteUrl: string, _memberUpns: string[], _opexUpn: string): Promise<void> {}

  async associateHubSite(_siteUrl: string, _hubSiteId: string): Promise<void> {}

  async isHubAssociated(_siteUrl: string): Promise<boolean> {
    return false;
  }

  async disassociateHubSite(_siteUrl: string): Promise<void> {}

  async writeAuditRecord(_record: IProvisioningAuditRecord): Promise<void> {}

  async applyWebParts(siteUrl: string): Promise<void> {
    await this.installWebParts(siteUrl);
  }

  async setPermissions(siteUrl: string, _projectId: string): Promise<void> {
    await this.setGroupPermissions(siteUrl, [], '');
  }

  async associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    await this.associateHubSite(siteUrl, hubSiteUrl);
  }

  async removeHubAssociation(siteUrl: string): Promise<void> {
    await this.disassociateHubSite(siteUrl);
  }
}
