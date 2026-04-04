import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';

export type CompanyPulseCategory = 'update' | 'safety' | 'recognition' | 'milestone';

export interface CompanyPulseItem {
  id: string;
  title: string;
  summary: string;
  category?: CompanyPulseCategory;
  metadata?: string;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
  audiences?: string[];
}

export interface CompanyPulseConfig {
  heading?: string;
  items?: CompanyPulseItem[];
  maxSecondaryItems?: number;
}

export interface LeadershipMessageEntry {
  id: string;
  title: string;
  message: string;
  leaderName: string;
  leaderRole?: string;
  metadata?: string;
  media?: HomepageMediaSlot;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
}

export interface LeadershipMessageConfig {
  heading?: string;
  entries?: LeadershipMessageEntry[];
  maxArchivedEntries?: number;
}

export type PeopleCultureEventType = 'newHire' | 'anniversary' | 'promotion' | 'recognition';

export interface PeopleCultureEntry {
  id: string;
  personName: string;
  eventType: PeopleCultureEventType;
  highlight: string;
  metadata?: string;
  media?: HomepageMediaSlot;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
  audiences?: string[];
}

export interface PeopleCultureConfig {
  heading?: string;
  entries?: PeopleCultureEntry[];
  maxSecondaryEntries?: number;
}

export const DEFAULT_COMPANY_PULSE_CONFIG: Required<Pick<CompanyPulseConfig, 'heading' | 'maxSecondaryItems'>> = {
  heading: 'Company Pulse',
  maxSecondaryItems: 3,
};

export const DEFAULT_LEADERSHIP_MESSAGE_CONFIG: Required<Pick<LeadershipMessageConfig, 'heading' | 'maxArchivedEntries'>> = {
  heading: 'Leadership Message',
  maxArchivedEntries: 2,
};

export const DEFAULT_PEOPLE_CULTURE_CONFIG: Required<Pick<PeopleCultureConfig, 'heading' | 'maxSecondaryEntries'>> = {
  heading: 'People and Culture',
  maxSecondaryEntries: 4,
};
