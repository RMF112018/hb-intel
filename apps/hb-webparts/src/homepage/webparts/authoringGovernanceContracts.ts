export type HomepageZone =
  | 'topBand'
  | 'utility'
  | 'awareness'
  | 'operationalAwareness'
  | 'discovery';

export type FreshnessCadence = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'eventDriven';

export interface AuthoringMessage {
  title: string;
  description: string;
}

export interface AuthoringMessageSet {
  noData: AuthoringMessage;
  invalid: AuthoringMessage;
  noResults?: AuthoringMessage;
  /** Shown when the live SharePoint list returns zero active items. */
  listEmpty?: AuthoringMessage;
  /**
   * Shown when the webpart's data-fetch path failed (network, permission,
   * SharePoint API) and there is no usable fallback content. Deliberately
   * distinct from `noData` / `invalid` so homepage users and page authors
   * can tell a runtime failure apart from an authoring gap.
   */
  fetchError?: AuthoringMessage;
}

export interface HomepageAuthoringGovernanceEntry {
  webpartKey: string;
  zone: HomepageZone;
  ownerRole: string;
  freshnessCadence: FreshnessCadence;
  rotationExpectation: string;
  zoneIntent: string;
  allowedContentScope: string;
  messages: AuthoringMessageSet;
  /** When true, this webpart is no longer used for flagship homepage composition. */
  deprecated?: boolean;
}
