import { DefaultAzureCredential } from '@azure/identity';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const PROJECTS_LIST_NAME = 'Projects';

export interface IProjectRequestsService {
  upsertRequest(request: IProjectSetupRequest): Promise<void>;
  getRequest(requestId: string): Promise<IProjectSetupRequest | null>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
}

/**
 * D-PH6-08 real adapter for Project Setup Request lifecycle persistence.
 * Uses SharePoint Projects list as the central request record store.
 */
export class RealProjectRequestsService implements IProjectRequestsService {
  private readonly tenantUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  async upsertRequest(request: IProjectSetupRequest): Promise<void> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);
    const key = this.escapeODataValue(request.requestId);

    const existing = await list.items.filter(`ProjectId eq '${key}'`).top(1).select('Id')();
    const payload = this.toListItem(request);

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
    const items = await list.items.filter(`ProjectId eq '${key}'`).top(1)();

    if (!items.length) return null;
    return this.fromListItem(items[0] as Record<string, unknown>);
  }

  async listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);

    let query = list.items.select(
      'Title',
      'ProjectId',
      'ProjectNumber',
      'ProjectName',
      'ProjectLocation',
      'ProjectType',
      'ProjectStage',
      'SubmittedBy',
      'SubmittedAt',
      'RequestState',
      'GroupMembersJson',
      'ClarificationNote',
      'CompletedBy',
      'CompletedAt',
      'SiteUrl'
    );

    if (state) {
      const key = this.escapeODataValue(state);
      query = query.filter(`RequestState eq '${key}'`);
    }

    const items = await query.top(5000)();
    return (items as Array<Record<string, unknown>>).map((item) => this.fromListItem(item));
  }

  /**
   * D-PH6-08 list schema mapping:
   * - requestId/projectId are stored in ProjectId to keep an immutable key aligned with schema.
   * - Title follows "projectNumber — projectName"; fallback uses TBD during early states.
   */
  private toListItem(request: IProjectSetupRequest): Record<string, unknown> {
    const projectNumberForTitle = request.projectNumber ?? 'TBD';
    return {
      Title: `${projectNumberForTitle} — ${request.projectName}`,
      ProjectId: request.requestId,
      ProjectNumber: request.projectNumber ?? '',
      ProjectName: request.projectName,
      ProjectLocation: request.projectLocation,
      ProjectType: request.projectType,
      ProjectStage: request.projectStage,
      SubmittedBy: request.submittedBy,
      SubmittedAt: request.submittedAt,
      RequestState: request.state,
      GroupMembersJson: JSON.stringify(request.groupMembers),
      ClarificationNote: request.clarificationNote ?? '',
      CompletedBy: request.completedBy ?? '',
      CompletedAt: request.completedAt ?? '',
      SiteUrl: '',
    };
  }

  private fromListItem(item: Record<string, unknown>): IProjectSetupRequest {
    const projectId = (item.ProjectId as string) ?? '';
    return {
      requestId: projectId,
      projectId,
      projectName: (item.ProjectName as string) ?? '',
      projectLocation: (item.ProjectLocation as string) ?? '',
      projectType: (item.ProjectType as string) ?? '',
      projectStage: ((item.ProjectStage as string) || 'Pursuit') as IProjectSetupRequest['projectStage'],
      submittedBy: (item.SubmittedBy as string) ?? '',
      submittedAt: (item.SubmittedAt as string) ?? new Date().toISOString(),
      state: ((item.RequestState as string) || 'Submitted') as ProjectSetupRequestState,
      projectNumber: (item.ProjectNumber as string) || undefined,
      groupMembers: this.safeParseGroupMembers(item.GroupMembersJson as string),
      clarificationNote: (item.ClarificationNote as string) || undefined,
      completedBy: (item.CompletedBy as string) || undefined,
      completedAt: (item.CompletedAt as string) || undefined,
    };
  }

  private safeParseGroupMembers(groupMembersJson: string): string[] {
    try {
      const parsed = JSON.parse(groupMembersJson ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
  }

  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  private async getSP(): Promise<any> {
    const token = await this.credential.getToken(`${new URL(this.tenantUrl).origin}/.default`);
    return (spfi(this.tenantUrl) as any).using({
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
export class MockProjectRequestsService implements IProjectRequestsService {
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
}
