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
