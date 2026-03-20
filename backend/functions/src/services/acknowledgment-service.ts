import { DefaultAzureCredential } from '@azure/identity';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';

const LIST_NAME = 'HbcAcknowledgmentEvents';

/**
 * SF04-T06: SharePoint list item schema for HbcAcknowledgmentEvents.
 */
export interface IAcknowledgmentListItem {
  EventId: string;
  ContextType: string;
  ContextId: string;
  PartyUserId: string;
  PartyDisplayName: string;
  Status: 'acknowledged' | 'declined' | 'bypassed';
  AcknowledgedAt: string;
  DeclineReason: string;
  DeclineCategory: string;
  PromptMessage: string;
  IsBypass: boolean;
  BypassedBy: string;
}

/**
 * SF04-T06: Service interface for acknowledgment event persistence.
 */
export interface IAcknowledgmentService {
  createEvent(event: IAcknowledgmentListItem): Promise<void>;
  getEvents(contextType: string, contextId: string): Promise<IAcknowledgmentListItem[]>;
}

/**
 * SF04-T06: Real adapter using SharePoint HbcAcknowledgmentEvents list.
 * Follows SharePointProjectRequestsAdapter pattern (D-PH6-08).
 */
export class RealAcknowledgmentService implements IAcknowledgmentService {
  private readonly tenantUrl: string;
  private readonly credential = new DefaultAzureCredential();

  constructor() {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  async createEvent(event: IAcknowledgmentListItem): Promise<void> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(LIST_NAME);
    await list.items.add({
      Title: event.EventId,
      EventId: event.EventId,
      ContextType: event.ContextType,
      ContextId: event.ContextId,
      PartyUserId: event.PartyUserId,
      PartyDisplayName: event.PartyDisplayName,
      Status: event.Status,
      AcknowledgedAt: event.AcknowledgedAt,
      DeclineReason: event.DeclineReason,
      DeclineCategory: event.DeclineCategory,
      PromptMessage: event.PromptMessage,
      IsBypass: event.IsBypass,
      BypassedBy: event.BypassedBy,
    });
  }

  async getEvents(contextType: string, contextId: string): Promise<IAcknowledgmentListItem[]> {
    const sp: any = await this.getSP();
    const list = sp.web.lists.getByTitle(LIST_NAME);
    const safeType = this.escapeODataValue(contextType);
    const safeId = this.escapeODataValue(contextId);
    const items = await list.items
      .filter(`ContextType eq '${safeType}' and ContextId eq '${safeId}'`)
      .orderBy('AcknowledgedAt', true)
      .top(5000)();

    return (items as Array<Record<string, unknown>>).map((item) => this.fromListItem(item));
  }

  private fromListItem(item: Record<string, unknown>): IAcknowledgmentListItem {
    return {
      EventId: (item.EventId as string) ?? '',
      ContextType: (item.ContextType as string) ?? '',
      ContextId: (item.ContextId as string) ?? '',
      PartyUserId: (item.PartyUserId as string) ?? '',
      PartyDisplayName: (item.PartyDisplayName as string) ?? '',
      Status: ((item.Status as string) ?? 'acknowledged') as IAcknowledgmentListItem['Status'],
      AcknowledgedAt: (item.AcknowledgedAt as string) ?? '',
      DeclineReason: (item.DeclineReason as string) ?? '',
      DeclineCategory: (item.DeclineCategory as string) ?? '',
      PromptMessage: (item.PromptMessage as string) ?? '',
      IsBypass: (item.IsBypass as boolean) ?? false,
      BypassedBy: (item.BypassedBy as string) ?? '',
    };
  }

  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  private async getSP(): Promise<any> {
    const token = await this.credential.getToken(`${new URL(this.tenantUrl).origin}/.default`);
    return (spfi(this.tenantUrl) as any).using({
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
 * SF04-T06: Mock adapter for deterministic local/unit usage.
 */
export class MockAcknowledgmentService implements IAcknowledgmentService {
  private readonly events = new Map<string, IAcknowledgmentListItem[]>();

  private key(contextType: string, contextId: string): string {
    return `${contextType}|${contextId}`;
  }

  async createEvent(event: IAcknowledgmentListItem): Promise<void> {
    const k = this.key(event.ContextType, event.ContextId);
    const existing = this.events.get(k) ?? [];
    existing.push({ ...event });
    this.events.set(k, existing);
  }

  async getEvents(contextType: string, contextId: string): Promise<IAcknowledgmentListItem[]> {
    const k = this.key(contextType, contextId);
    const existing = this.events.get(k) ?? [];
    return existing
      .map((e) => ({ ...e }))
      .sort((a, b) => a.AcknowledgedAt.localeCompare(b.AcknowledgedAt));
  }
}
