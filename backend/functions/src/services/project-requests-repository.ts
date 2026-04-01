import { DefaultAzureCredential } from '@azure/identity';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import { PROJECTS_LIST_NAME, PROJECTS_LIST_SELECT_FIELDS } from './projects-list-contract.js';
import { toDomain, toListItem, resolveSpField } from './projects-list-mapper.js';

export interface IProjectRequestsRepository {
  upsertRequest(request: IProjectSetupRequest): Promise<void>;
  getRequest(requestId: string): Promise<IProjectSetupRequest | null>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  /** P2-03: Find a request by projectNumber for uniqueness enforcement. Returns null if no match. */
  findByProjectNumber(projectNumber: string): Promise<IProjectSetupRequest | null>;
}

/**
 * D-PH6-08 real adapter for Project Setup Request lifecycle persistence.
 * Uses SharePoint Projects list as the central request record store.
 *
 * SharePoint target resolution:
 *   SHAREPOINT_PROJECTS_SITE_URL  — preferred; points directly to the site
 *     that hosts the Projects list (e.g. .../sites/HBCentral)
 *   SHAREPOINT_TENANT_URL         — legacy fallback; tenant root URL
 *
 * Production target: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
 * List title: Projects
 *
 * NOTE: The HBCentral Projects list was created via CSV import; custom columns
 * have generic internal names (field_1..field_23). The Year column was added
 * after import and uses internal name 'Year'. Future field-name reconciliation
 * may be required if this adapter and the project-sites webpart share the same list.
 */
export class SharePointProjectRequestsAdapter implements IProjectRequestsRepository {
  private readonly siteUrl: string;
  private readonly tenantUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    // Prefer the site-scoped URL when available; fall back to tenant root.
    this.siteUrl = process.env.SHAREPOINT_PROJECTS_SITE_URL ?? process.env.SHAREPOINT_TENANT_URL ?? '';
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL ?? '';
    if (!this.siteUrl) {
      throw new Error(
        'SHAREPOINT_PROJECTS_SITE_URL or SHAREPOINT_TENANT_URL env var is required. ' +
        'Expected: https://hedrickbrotherscom.sharepoint.com/sites/HBCentral'
      );
    }
  }

  async upsertRequest(request: IProjectSetupRequest): Promise<void> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);
    const key = this.escapeODataValue(request.requestId);
    const idField = resolveSpField('requestId');

    const existing = await list.items.filter(`${idField} eq '${key}'`).top(1).select('Id')();
    const payload = toListItem(request);

    if (existing.length > 0) {
      await list.items.getById(existing[0].Id).update(payload);
      return;
    }

    await list.items.add(payload);
  }

  async getRequest(requestId: string): Promise<IProjectSetupRequest | null> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);
    const key = this.escapeODataValue(requestId);
    const idField = resolveSpField('requestId');
    const items = await list.items.filter(`${idField} eq '${key}'`).top(1)();

    if (!items.length) return null;
    return toDomain(items[0] as Record<string, unknown>);
  }

  async listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);

    let query = list.items.select(...PROJECTS_LIST_SELECT_FIELDS);

    if (state) {
      const key = this.escapeODataValue(state);
      const stateField = resolveSpField('state');
      query = query.filter(`${stateField} eq '${key}'`);
    }

    const items = await query.getAll(5000);
    return (items as Array<Record<string, unknown>>).map((item) => toDomain(item));
  }

  async findByProjectNumber(projectNumber: string): Promise<IProjectSetupRequest | null> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);
    const key = this.escapeODataValue(projectNumber);
    const pnField = resolveSpField('projectNumber');
    const items = await list.items.filter(`${pnField} eq '${key}'`).top(1)();

    if (!items.length) return null;
    return toDomain(items[0] as Record<string, unknown>);
  }

  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  private async getSP(): Promise<any> {
    // Token scope uses tenant origin; PnPjs connects to the site-scoped URL.
    const origin = new URL(this.siteUrl).origin;
    const token = await this.credential.getToken(`${origin}/.default`);
    return (spfi(this.siteUrl) as any).using({
      // D-PH6-08 Managed Identity binding for Projects-list request lifecycle operations.
      bind(instance: any) {
        instance.on.auth.replace(async (_: unknown, req: Request, done: (request: Request) => void) => {
          req.headers.set('Authorization', `Bearer ${token!.token}`);
          done(req);
        });
      },
    } as any);
  }
}

/**
 * D-PH6-08 mock adapter for deterministic local/unit usage.
 */
export class MockProjectRequestsRepository implements IProjectRequestsRepository {
  private readonly requests = new Map<string, IProjectSetupRequest>();

  async upsertRequest(request: IProjectSetupRequest): Promise<void> {
    this.requests.set(request.requestId, { ...request, groupMembers: [...request.groupMembers] });
  }

  async getRequest(requestId: string): Promise<IProjectSetupRequest | null> {
    const request = this.requests.get(requestId);
    if (!request) return null;
    return { ...request, groupMembers: [...request.groupMembers] };
  }

  async listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]> {
    const values = [...this.requests.values()];
    return values
      .filter((request) => (state ? request.state === state : true))
      .map((request) => ({ ...request, groupMembers: [...request.groupMembers] }));
  }

  async findByProjectNumber(projectNumber: string): Promise<IProjectSetupRequest | null> {
    for (const request of this.requests.values()) {
      if (request.projectNumber === projectNumber) {
        return { ...request, groupMembers: [...request.groupMembers] };
      }
    }
    return null;
  }
}
