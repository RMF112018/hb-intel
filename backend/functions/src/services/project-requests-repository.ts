import { DefaultAzureCredential } from '@azure/identity';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const PROJECTS_LIST_NAME = 'Projects';

export interface IProjectRequestsRepository {
  upsertRequest(request: IProjectSetupRequest): Promise<void>;
  getRequest(requestId: string): Promise<IProjectSetupRequest | null>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
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

    const existing = await list.items.filter(`field_1 eq '${key}'`).top(1).select('Id')();
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
    const items = await list.items.filter(`field_1 eq '${key}'`).top(1)();

    if (!items.length) return null;
    return this.fromListItem(items[0] as Record<string, unknown>);
  }

  async listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(PROJECTS_LIST_NAME);

    let query = list.items.select(
      'Title',
      'field_1', 'field_2', 'field_3', 'field_4', 'field_5',
      'field_6', 'field_7', 'field_8', 'field_9', 'field_10',
      'field_11', 'field_12', 'field_13', 'field_14', 'field_15',
      'field_16', 'field_17', 'field_18', 'field_19', 'field_20',
      'field_21', 'field_22', 'field_23', 'field_24',
      'Year'
    );

    if (state) {
      const key = this.escapeODataValue(state);
      query = query.filter(`field_9 eq '${key}'`);
    }

    const items = await query.getAll(5000);
    return (items as Array<Record<string, unknown>>).map((item) => this.fromListItem(item));
  }

  /**
   * SharePoint field_N mapping — confirmed from HBCentral Projects list schema.
   *
   * The list was created via CSV import so custom columns have generic internal
   * names (field_1..field_24). Standard SP columns (Title, Year, Id) retain
   * their display names as internal names.
   *
   * Mapping (display name → internal name):
   *   Title          → Title       (standard SP column)
   *   ProjectId      → field_1
   *   ProjectNumber  → field_2
   *   ProjectName    → field_3
   *   ProjectLocation→ field_4
   *   ProjectType    → field_5
   *   ProjectStage   → field_6
   *   SubmittedBy    → field_7
   *   SubmittedAt    → field_8    (Number in SP)
   *   RequestState   → field_9
   *   GroupMembersJson→ field_10
   *   GroupLeadersJson→ field_11
   *   Department     → field_12
   *   EstimatedValue → field_13   (Number in SP)
   *   ClientName     → field_14
   *   StartDate      → field_15   (Number in SP)
   *   ContractType   → field_16
   *   ProjectLeadId  → field_17
   *   ViewerUPNsJson → field_18
   *   AddOnsJson     → field_19
   *   ClarificationNote→ field_20 (Number in SP — stores epoch or 0)
   *   CompletedBy    → field_21   (Number in SP — stores epoch or 0)
   *   CompletedAt    → field_22   (Number in SP — stores epoch or 0)
   *   SiteUrl        → field_23
   *   RetryCount     → field_24   (Number in SP)
   *   Year           → Year       (Number, added post-import)
   */
  private toListItem(request: IProjectSetupRequest): Record<string, unknown> {
    const projectNumberForTitle = request.projectNumber ?? 'TBD';
    return {
      Title: `${projectNumberForTitle} — ${request.projectName}`,
      field_1: request.requestId,
      field_2: request.projectNumber ?? '',
      field_3: request.projectName,
      field_4: request.projectLocation,
      field_5: request.projectType,
      field_6: request.projectStage,
      field_7: request.submittedBy,
      field_8: request.submittedAt,
      field_9: request.state,
      field_10: JSON.stringify(request.groupMembers),
      field_11: JSON.stringify(request.groupLeaders ?? []),
      field_12: request.department ?? '',
      field_13: request.estimatedValue ?? null,
      field_14: request.clientName ?? '',
      field_15: request.startDate ?? '',
      field_16: request.contractType ?? '',
      field_17: request.projectLeadId ?? '',
      field_18: JSON.stringify(request.viewerUPNs ?? []),
      field_19: JSON.stringify(request.addOns ?? []),
      field_20: request.clarificationNote ?? '',
      field_21: request.completedBy ?? '',
      field_22: request.completedAt ?? '',
      field_23: request.siteUrl ?? '',
      field_24: request.retryCount,
      Year: request.year ?? null,
    };
  }

  private fromListItem(item: Record<string, unknown>): IProjectSetupRequest {
    const projectId = (item.field_1 as string) ?? '';
    return {
      requestId: projectId,
      projectId,
      projectName: (item.field_3 as string) ?? '',
      projectLocation: (item.field_4 as string) ?? '',
      projectType: (item.field_5 as string) ?? '',
      projectStage: ((item.field_6 as string) || 'Pursuit') as IProjectSetupRequest['projectStage'],
      submittedBy: (item.field_7 as string) ?? '',
      submittedAt: String(item.field_8 ?? new Date().toISOString()),
      state: ((item.field_9 as string) || 'Submitted') as ProjectSetupRequestState,
      projectNumber: (item.field_2 as string) || undefined,
      groupMembers: this.safeParseJsonArray(item.field_10 as string),
      groupLeaders: this.safeParseJsonArray(item.field_11 as string) as string[] | undefined,
      department: ((item.field_12 as string) || undefined) as IProjectSetupRequest['department'],
      estimatedValue: typeof item.field_13 === 'number' ? item.field_13 : undefined,
      clientName: (item.field_14 as string) || undefined,
      startDate: String(item.field_15 ?? '') || undefined,
      contractType: (item.field_16 as string) || undefined,
      projectLeadId: (item.field_17 as string) || undefined,
      viewerUPNs: this.safeParseJsonArray(item.field_18 as string) as string[] | undefined,
      addOns: this.safeParseJsonArray(item.field_19 as string) as string[] | undefined,
      clarificationNote: String(item.field_20 ?? '') || undefined,
      completedBy: String(item.field_21 ?? '') || undefined,
      completedAt: String(item.field_22 ?? '') || undefined,
      siteUrl: (item.field_23 as string) || undefined,
      retryCount: typeof item.field_24 === 'number' ? item.field_24 : 0,
      year: typeof item.Year === 'number' ? item.Year : undefined,
    };
  }

  private safeParseJsonArray(json: string): string[] {
    try {
      const parsed = JSON.parse(json ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
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
}
