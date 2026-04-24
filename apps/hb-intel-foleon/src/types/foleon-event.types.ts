export type FoleonEventType =
  | 'Card Impression'
  | 'Card Click'
  | 'Reader Open'
  | 'Reader Close'
  | 'External Open'
  | 'Embed Error'
  | 'Search'
  | 'Filter';

export type FoleonPageContext = 'Homepage' | 'Content Hub' | 'Reader' | 'Project Site';

export interface FoleonInteractionEvent {
  readonly eventId: string;
  readonly eventType: FoleonEventType;
  readonly foleonDocId?: number;
  readonly contentRegistryItemId?: number;
  readonly pageContext?: FoleonPageContext;
  readonly searchQuery?: string;
  readonly eventTimestamp: string;
  readonly sessionId?: string;
}
