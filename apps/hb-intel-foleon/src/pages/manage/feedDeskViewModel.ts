export type FeedDeskState = 'token-degraded' | 'sync-blocked' | 'empty' | 'ready';

export type FeedSetupCalloutActionId = 'open-admin-diagnostics' | 'sync-foleon';

export interface FeedSetupCalloutAction {
  readonly id: FeedSetupCalloutActionId;
  readonly label: string;
}

export interface FeedSetupCalloutModel {
  readonly state: Exclude<FeedDeskState, 'ready'>;
  readonly kicker: string;
  readonly heading: string;
  readonly body: string;
  readonly action: FeedSetupCalloutAction;
}

export function resolveFeedDeskState(args: {
  readonly tokenAcquisitionDegraded: boolean;
  readonly canSync: boolean;
  readonly contentLoaded: number;
}): FeedDeskState {
  if (args.tokenAcquisitionDegraded) return 'token-degraded';
  if (!args.canSync) return 'sync-blocked';
  if (args.contentLoaded === 0) return 'empty';
  return 'ready';
}

export function buildFeedSetupCalloutModel(state: FeedDeskState): FeedSetupCalloutModel | null {
  if (state === 'ready') return null;
  if (state === 'token-degraded') {
    return {
      state,
      kicker: 'Setup',
      heading: 'API approval is required to load Foleon content.',
      body: 'A SharePoint administrator must approve the Foleon API connection before content can flow into the Feed Desk.',
      action: { id: 'open-admin-diagnostics', label: 'Open admin diagnostics' },
    };
  }
  if (state === 'sync-blocked') {
    return {
      state,
      kicker: 'Setup',
      heading: 'Sync from Foleon is unavailable.',
      body: 'Resolve sync readiness in admin so the Feed Desk can pull content from Foleon.',
      action: { id: 'open-admin-diagnostics', label: 'Open admin diagnostics' },
    };
  }
  return {
    state,
    kicker: 'Setup',
    heading: 'No Foleon content has been synced yet.',
    body: 'Run Sync from Foleon to bring content into the Feed Desk.',
    action: { id: 'sync-foleon', label: 'Sync from Foleon' },
  };
}
