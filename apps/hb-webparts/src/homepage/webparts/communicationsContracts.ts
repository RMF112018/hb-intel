import type { HomepageCtaLink, HomepageMediaSlot } from '../models/contentModels.js';

export type CompanyPulseCategory = 'update' | 'safety' | 'recognition' | 'milestone';

export interface CompanyPulseItem {
  id: string;
  title: string;
  summary: string;
  category?: CompanyPulseCategory;
  metadata?: string;
  byline?: string;
  publishDate?: string;
  media?: HomepageMediaSlot;
  cta?: HomepageCtaLink;
  featured?: boolean;
  order?: number;
  audiences?: string[];
}

export interface CompanyPulseConfig {
  heading?: string;
  items?: CompanyPulseItem[];
  maxSecondaryItems?: number;
  maxTertiaryItems?: number;
  archiveHref?: string;
}

export interface NewsroomOutput {
  heading: string;
  lead?: CompanyPulseItem;
  secondary: CompanyPulseItem[];
  tertiary: CompanyPulseItem[];
  archiveHref?: string;
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
  archiveHref?: string;
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

export const DEFAULT_COMPANY_PULSE_CONFIG: Required<Pick<CompanyPulseConfig, 'heading' | 'maxSecondaryItems' | 'maxTertiaryItems'>> = {
  heading: 'Company Pulse',
  maxSecondaryItems: 3,
  maxTertiaryItems: 4,
};

export const DEFAULT_LEADERSHIP_MESSAGE_CONFIG: Required<Pick<LeadershipMessageConfig, 'heading' | 'maxArchivedEntries'>> = {
  heading: 'Leadership Message',
  maxArchivedEntries: 2,
};

export const DEFAULT_PEOPLE_CULTURE_CONFIG: Required<Pick<PeopleCultureConfig, 'heading' | 'maxSecondaryEntries'>> = {
  heading: 'People and Culture',
  maxSecondaryEntries: 4,
};

// ---------------------------------------------------------------------------
// Merged People & Culture content model (Band A + Kudos + Band B)
// ---------------------------------------------------------------------------

// --- Band A: Announcements ---

export type AnnouncementType = 'promotion' | 'newHire' | 'baby' | 'wedding' | 'special';

export interface AnnouncementEntry {
  id: string;
  personName: string;
  announcementType: AnnouncementType;
  headline: string;
  summary: string;
  publishDate: string;
  media?: HomepageMediaSlot;
  cta?: HomepageCtaLink;
  startDisplayDate?: string;
  endDisplayDate?: string;
  isPinned?: boolean;
  priorityOverride?: number;
  homepageEnabled?: boolean;
  audiences?: string[];
}

// --- Kudos Module ---

export type KudosStatus = 'pending' | 'approved' | 'rejected';

export type KudosRecipientType = 'individual' | 'team' | 'department' | 'projectGroup';

export interface PersonReference {
  id: string;
  displayName: string;
  email?: string;
  media?: HomepageMediaSlot;
}

export interface KudosRecipient {
  id: string;
  name: string;
  recipientType: KudosRecipientType;
  media?: HomepageMediaSlot;
}

export interface KudosEntry {
  id: string;
  headline: string;
  excerpt: string;
  submittedBy: PersonReference;
  submittedDate: string;
  status: KudosStatus;
  approvedBy?: PersonReference;
  approvedDate?: string;
  recipients: KudosRecipient[];
  media?: HomepageMediaSlot;
  isPinned?: boolean;
  homepageEnabled?: boolean;
  publishStartDate?: string;
  publishEndDate?: string;
  celebrateCount?: number;
}

// --- Band B: Weekly Celebrations ---

export type WeeklyCelebrationType = 'birthday' | 'anniversary';

export interface WeeklyCelebrationEntry {
  id: string;
  personName: string;
  celebrationType: WeeklyCelebrationType;
  celebrationDate: string;
  anniversaryYears?: number;
  media?: HomepageMediaSlot;
  audiences?: string[];
}

// --- Merged config and output ---

export interface PeopleCultureMergedConfig {
  heading?: string;
  announcements?: AnnouncementEntry[];
  kudos?: KudosEntry[];
  celebrations?: WeeklyCelebrationEntry[];
  maxAnnouncements?: number;
  maxKudosHeadlines?: number;
  maxCelebrations?: number;
}

export interface BandAOutput {
  items: AnnouncementEntry[];
  isEmpty: boolean;
}

export interface KudosModuleOutput {
  featured?: KudosEntry;
  recentHeadlines: KudosEntry[];
  isEmpty: boolean;
}

export interface BandBOutput {
  items: WeeklyCelebrationEntry[];
  isEmpty: boolean;
}

export interface PeopleCultureMergedOutput {
  heading: string;
  bandA: BandAOutput;
  kudos: KudosModuleOutput;
  bandB: BandBOutput;
}

export const DEFAULT_PEOPLE_CULTURE_MERGED_CONFIG = {
  heading: 'Celebrating Our People',
  maxAnnouncements: 4,
  maxKudosHeadlines: 6,
  maxCelebrations: 8,
} as const;
