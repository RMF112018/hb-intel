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

/**
 * Narrow domain status kept for backward compatibility with the
 * merged People & Culture normalizer. `KudosWorkflowStatus` below is
 * the full-fidelity type that matches the live SharePoint
 * `WorkflowStatus` choice field.
 */
export type KudosStatus = 'pending' | 'approved' | 'rejected';

/**
 * Full-fidelity Kudos workflow status as persisted on the live
 * `People Culture Kudos` SharePoint list (`b01fa4d2-…`).
 * Mirrors the authoritative `WorkflowStatus` choice field. See
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-sharepoint-schema-report.md`.
 *
 * `_ModerationStatus` is NOT authoritative for these lists — this
 * field is the only publish-state source of truth.
 */
export type KudosWorkflowStatus =
  | 'pending'
  | 'revisionRequested'
  | 'approved'
  | 'approvedScheduled'
  | 'rejected'
  | 'withdrawn'
  | 'removedUnpublished';

/** Prominence intent as persisted on the live Kudos list. */
export type KudosProminenceIntent = 'standard' | 'pinned' | 'featured';

/** Visibility mode as persisted on the live Kudos list. */
export type KudosCurrentVisibilityMode = 'public' | 'associatedOnly' | 'internalOnly';

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
  /** Optional long-form body from the live `Details` field on the Kudos list. */
  details?: string;
  submittedBy: PersonReference;
  submittedDate: string;
  /**
   * Narrow domain status retained for merged-webpart compatibility.
   * Derived from the authoritative `workflowStatus` field at read time:
   *   - `approved`           → `approved`
   *   - `approvedScheduled`  → `approved`
   *   - `rejected`           → `rejected`
   *   - `withdrawn`          → `rejected`
   *   - `removedUnpublished` → `rejected`
   *   - `pending`            → `pending`
   *   - `revisionRequested`  → `pending`
   */
  status: KudosStatus;
  /**
   * Authoritative workflow status from the live `WorkflowStatus` field.
   * Consumers that need the full 7-state shape should read this rather
   * than `status`.
   */
  workflowStatus?: KudosWorkflowStatus;
  /** Mirrors the live `WasEverPublished` flag. */
  wasEverPublished?: boolean;
  approvedBy?: PersonReference;
  approvedDate?: string;
  recipients: KudosRecipient[];
  media?: HomepageMediaSlot;
  isPinned?: boolean;
  /** Mirrors the live `PinOrder` number field. */
  pinOrder?: number;
  /** Mirrors the live `IsFeatured` boolean. */
  isFeatured?: boolean;
  /** Mirrors the live `FeaturedExpiresAt` datetime. */
  featuredExpiresAt?: string;
  /** Mirrors the live `ProminenceIntent` choice. */
  prominenceIntent?: KudosProminenceIntent;
  /** Mirrors the live `CurrentVisibilityMode` choice. */
  visibilityMode?: KudosCurrentVisibilityMode;
  homepageEnabled?: boolean;
  /** Mirrors the live `IsScheduled` boolean. */
  isScheduled?: boolean;
  /** Mirrors the live `ScheduledPublishAt` datetime. */
  scheduledPublishAt?: string;
  publishStartDate?: string;
  publishEndDate?: string;
  celebrateCount?: number;
  // Governance metadata (Phase-14 Prompt-04 read-path extension)
  /** Mirrors the live `RejectionReason` field. */
  rejectionReason?: string;
  /** Mirrors the live `ModeratorNotes` field. */
  moderatorNotes?: string;
  /** Mirrors the live `RevisionGuidance` field. */
  revisionGuidance?: string;
  /** Mirrors the live `IsFlaggedForAdminReview` boolean. */
  isFlaggedForAdminReview?: boolean;
  /** Mirrors the live `AdminReviewReason` field. */
  adminReviewReason?: string;
  /** Mirrors the live `IsRemovedFromPublicView` boolean. */
  isRemovedFromPublicView?: boolean;
  /** Mirrors the live `RemovedReason` field. */
  removedReason?: string;
  /** Mirrors the live `ProminenceFailureAt` datetime. */
  prominenceFailureAt?: string;
  /** Mirrors the live `ProminenceFailureReason` field. */
  prominenceFailureReason?: string;
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
