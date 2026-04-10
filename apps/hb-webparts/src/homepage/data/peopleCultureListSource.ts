/**
 * SharePoint list data source for the People & Culture webpart.
 *
 * Fetches items from three live SharePoint lists (Announcements,
 * Celebrations, Kudos) and maps them into the existing
 * `PeopleCultureMergedConfig` contract so the downstream normalization
 * pipeline works unchanged.
 *
 * Binding strategy: **by list GUID**, via the authoritative
 * `peopleCultureSpListRegistry`. The adapter never binds by display
 * title, because the live SharePoint state has a known title / URL
 * mismatch that would silently swap the announcements and
 * celebrations lists if titles were used as the primary identifier.
 * See `docs/architecture/reviews/people-culture-data-schema-conformance-audit.md`.
 *
 * Authoritative publish-state signals:
 *   - Announcements: `HomepageEnabled` (boolean). `_ModerationStatus`
 *     is not authoritative because moderation is disabled on the list.
 *   - Celebrations: `HomepageEnabledGovernanceextensi` (boolean,
 *     mangled internal name). Same reason.
 *   - Kudos: `WorkflowStatus` (choice of 7 states). `_ModerationStatus`
 *     is not authoritative because moderation is disabled on the
 *     Kudos list.
 */
import type {
  AnnouncementEntry,
  AnnouncementType,
  KudosCurrentVisibilityMode,
  KudosEntry,
  KudosProminenceIntent,
  KudosRecipient,
  KudosRecipientType,
  KudosStatus,
  KudosWorkflowStatus,
  PersonReference,
  PeopleCultureMergedConfig,
  WeeklyCelebrationEntry,
  WeeklyCelebrationType,
} from '../webparts/communicationsContracts.js';
import {
  buildPcListFieldsEndpoint,
  buildPcListItemsEndpoint,
  PEOPLE_CULTURE_LIST_REGISTRY,
  type PeopleCultureListDescriptor,
  type PeopleCultureListKey,
} from './peopleCultureSpListRegistry.js';

/* ── List metadata (kept as deprecated exports for backward compat) ─ */

/**
 * @deprecated Use the `peopleCultureSpListRegistry` entries directly.
 * Exported only for call sites that still import these constants.
 * The adapter itself binds by list ID now; these strings are
 * informational only.
 */
export const SP_LIST_ANNOUNCEMENTS = PEOPLE_CULTURE_LIST_REGISTRY.announcements.title;
/** @deprecated */
export const SP_LIST_KUDOS = PEOPLE_CULTURE_LIST_REGISTRY.kudos.title;
/** @deprecated */
export const SP_LIST_CELEBRATIONS = PEOPLE_CULTURE_LIST_REGISTRY.celebrations.title;

/* ── SharePoint field internal names ────────────────────────────── */

/**
 * InternalName values verified against
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-announcements1-list-schema.normalized.json`.
 * Do not rename unless the SharePoint schema is intentionally refactored.
 */
export const ANN_FIELDS = {
  AnnouncementId: 'AnnouncementId',
  AnnouncementPerson: 'AnnouncementPerson',
  PersonDisplayName: 'PersonDisplayName',
  AnnouncementType: 'AnnouncementType',
  Headline: 'Headline',
  Summary: 'Summary',
  /**
   * The live InternalName is the mangled `PublishDateMapstopublishDate_x00`.
   * The user-facing display title is still `PublishDate`. All fetches
   * must use this mangled name. `resolvePublishDateField` remains as
   * a safety net in case the internal name changes.
   */
  PublishDate: 'PublishDateMapstopublishDate_x00',
  StartDisplayDate: 'StartDisplayDate',
  EndDisplayDate: 'EndDisplayDate',
  IsPinned: 'IsPinned',
  PriorityOverride: 'PriorityOverride',
  HomepageEnabled: 'HomepageEnabled',
  AudienceTags: 'AudienceTags',
  CtaLabel: 'CtaLabel',
  CtaUrl: 'CtaUrl',
  OpenInNewTab: 'OpenInNewTab',
  PrimaryImage: 'PrimaryImage',
  ImageAltText: 'ImageAltText',
  InternalNotes: 'InternalNotes',
} as const;

/**
 * InternalName values verified against
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-list-schema.normalized.json`
 * and the Schema Reference Appendix (Phase-14 kudos/ Prompt-01). All
 * live field names are mirrored here so write-path code in Prompts
 * 03–05 can reference them without re-verifying the list schema.
 */
export const KUDOS_FIELDS = {
  // Core identity and content
  KudosId: 'KudosId',
  Headline: 'Headline',
  Excerpt: 'Excerpt',
  Details: 'Details',
  PrimaryImage: 'PrimaryImage',
  ImageAltText: 'ImageAltText',

  // Submission / approval identities
  SubmittedBy: 'SubmittedBy',
  SubmittedDate: 'SubmittedDate',
  ApprovedBy: 'ApprovedBy',
  ApprovedDate: 'ApprovedDate',

  // Recipient targeting
  IndividualRecipients: 'IndividualRecipients',
  TeamRecipients: 'TeamRecipients',
  DepartmentRecipients: 'DepartmentRecipients',
  ProjectGroupRecipients: 'ProjectGroupRecipients',

  // Workflow / moderation / lifecycle
  WorkflowStatus: 'WorkflowStatus',
  WasEverPublished: 'WasEverPublished',
  RejectionReason: 'RejectionReason',
  ModeratorNotes: 'ModeratorNotes',
  RevisionRequestedBy: 'RevisionRequestedBy',
  RevisionRequestedAt: 'RevisionRequestedAt',
  RevisionGuidance: 'RevisionGuidance',
  WithdrawnBy: 'WithdrawnBy',
  WithdrawnAt: 'WithdrawnAt',
  IsFlaggedForAdminReview: 'IsFlaggedForAdminReview',
  AdminReviewFlaggedBy: 'AdminReviewFlaggedBy',
  AdminReviewFlaggedAt: 'AdminReviewFlaggedAt',
  AdminReviewReason: 'AdminReviewReason',
  AdminReviewedBy: 'AdminReviewedBy',
  AdminReviewedAt: 'AdminReviewedAt',
  RemovedBy: 'RemovedBy',
  RemovedAt: 'RemovedAt',
  RemovedReason: 'RemovedReason',
  IsRemovedFromPublicView: 'IsRemovedFromPublicView',
  RestoredBy: 'RestoredBy',
  RestoredAt: 'RestoredAt',

  // Public visibility / prominence
  HomepageEnabled: 'HomepageEnabled',
  PublishStartDate: 'PublishStartDate',
  PublishEndDate: 'PublishEndDate',
  IsPinned: 'IsPinned',
  PinOrder: 'PinOrder',
  IsFeatured: 'IsFeatured',
  FeaturedExpiresAt: 'FeaturedExpiresAt',
  ProminenceIntent: 'ProminenceIntent',
  ProminenceFailureAt: 'ProminenceFailureAt',
  ProminenceFailureReason: 'ProminenceFailureReason',

  // Scheduling
  IsScheduled: 'IsScheduled',
  ScheduledPublishAt: 'ScheduledPublishAt',
  ScheduledBy: 'ScheduledBy',
  ScheduleChangedBy: 'ScheduleChangedBy',
  ScheduleChangedAt: 'ScheduleChangedAt',
  ScheduleCancelledBy: 'ScheduleCancelledBy',
  ScheduleCancelledAt: 'ScheduleCancelledAt',

  // Work ownership
  ClaimOwner: 'ClaimOwner',
  ClaimedAt: 'ClaimedAt',
  AssignedOwner: 'AssignedOwner',
  ReassignedBy: 'ReassignedBy',
  ReassignedAt: 'ReassignedAt',
  ReviewedBy: 'ReviewedBy',
  ReviewedAt: 'ReviewedAt',

  // Audience / engagement
  CurrentVisibilityMode: 'CurrentVisibilityMode',
  CelebrateCount: 'CelebrateCount',
} as const;

/**
 * InternalName values for the `Kudos Audit Events` list. This is the
 * durable event journal for workflow transitions, claim/reassignment,
 * scheduling/prominence actions, and moderation notes.
 *
 * Bind by list GUID via `PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents`.
 */
export const KUDOS_AUDIT_FIELDS = {
  Title: 'Title',
  KudosId: 'KudosId',
  EventType: 'EventType',
  Actor: 'Actor',
  EventAt: 'EventAt',
  OldValue: 'OldValue',
  NewValue: 'NewValue',
  PublicNote: 'PublicNote',
  InternalNote: 'InternalNote',
} as const;

/**
 * InternalName values verified against
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-announcements-list-schema.normalized.json`.
 * Note: the list at URL `People Culture Announcements` is titled
 * `People Culture Celebrations` and holds the celebration schema.
 * Bind by list ID (`b87bf664-…`), not by title or URL.
 */
export const CEL_FIELDS = {
  AnnouncementId: 'AnnouncementId',
  /** UserMulti field — multi-person celebrations are possible. */
  PersonName: 'PersonName',
  PersonDisplayName: 'PersonDisplayName',
  ExternalEmployeeId: 'ExternalEmployeeId',
  CelebrationType: 'CelebrationType',
  CelebrationDate: 'CelebrationDate',
  AnniversaryYears: 'AnniversaryYears',
  /**
   * SharePoint mangled the column name when it was provisioned.
   * Live internal name is `HomepageEnabledGovernanceextensi`. Do
   * not rename to `HomepageEnabled` — that field does not exist
   * on this list.
   */
  HomepageEnabled: 'HomepageEnabledGovernanceextensi',
  AudienceTags: 'AudienceTags',
  PrimaryImage: 'PrimaryImage',
  ImageAltText: 'ImageAltText',
  SourceSystem: 'SourceSystem',
  LastSynchronizedOn: 'LastSynchronizedOn',
} as const;

/* ── $select / $expand strings ─────────────────────────────────── */

/** Build the announcements $select string, substituting the resolved PublishDate internal name. */
function buildAnnSelect(publishDateField: string): string {
  return [
    ANN_FIELDS.AnnouncementId,
    `${ANN_FIELDS.AnnouncementPerson}/Id`,
    `${ANN_FIELDS.AnnouncementPerson}/Title`,
    `${ANN_FIELDS.AnnouncementPerson}/EMail`,
    ANN_FIELDS.PersonDisplayName,
    ANN_FIELDS.AnnouncementType,
    ANN_FIELDS.Headline,
    ANN_FIELDS.Summary,
    publishDateField,
    ANN_FIELDS.StartDisplayDate,
    ANN_FIELDS.EndDisplayDate,
    ANN_FIELDS.IsPinned,
    ANN_FIELDS.PriorityOverride,
    ANN_FIELDS.HomepageEnabled,
    ANN_FIELDS.AudienceTags,
    ANN_FIELDS.CtaLabel,
    ANN_FIELDS.CtaUrl,
    ANN_FIELDS.OpenInNewTab,
    ANN_FIELDS.PrimaryImage,
    ANN_FIELDS.ImageAltText,
    ANN_FIELDS.InternalNotes,
  ].join(',');
}

const ANN_EXPAND = ANN_FIELDS.AnnouncementPerson;

const KUDOS_SELECT = [
  // Core identity + content
  KUDOS_FIELDS.KudosId,
  KUDOS_FIELDS.Headline,
  KUDOS_FIELDS.Excerpt,
  KUDOS_FIELDS.Details,
  // Submission / approval identities (expanded)
  `${KUDOS_FIELDS.SubmittedBy}/Id`,
  `${KUDOS_FIELDS.SubmittedBy}/Title`,
  `${KUDOS_FIELDS.SubmittedBy}/EMail`,
  KUDOS_FIELDS.SubmittedDate,
  `${KUDOS_FIELDS.ApprovedBy}/Id`,
  `${KUDOS_FIELDS.ApprovedBy}/Title`,
  `${KUDOS_FIELDS.ApprovedBy}/EMail`,
  KUDOS_FIELDS.ApprovedDate,
  // Recipients (expanded)
  `${KUDOS_FIELDS.IndividualRecipients}/Id`,
  `${KUDOS_FIELDS.IndividualRecipients}/Title`,
  `${KUDOS_FIELDS.IndividualRecipients}/EMail`,
  KUDOS_FIELDS.TeamRecipients,
  KUDOS_FIELDS.DepartmentRecipients,
  KUDOS_FIELDS.ProjectGroupRecipients,
  // Workflow / lifecycle
  KUDOS_FIELDS.WorkflowStatus,
  KUDOS_FIELDS.WasEverPublished,
  KUDOS_FIELDS.RejectionReason,
  KUDOS_FIELDS.ModeratorNotes,
  KUDOS_FIELDS.RevisionGuidance,
  // Admin review
  KUDOS_FIELDS.IsFlaggedForAdminReview,
  KUDOS_FIELDS.AdminReviewReason,
  // Removal / restore
  KUDOS_FIELDS.IsRemovedFromPublicView,
  KUDOS_FIELDS.RemovedReason,
  // Prominence / visibility
  KUDOS_FIELDS.IsPinned,
  KUDOS_FIELDS.PinOrder,
  KUDOS_FIELDS.IsFeatured,
  KUDOS_FIELDS.FeaturedExpiresAt,
  KUDOS_FIELDS.ProminenceIntent,
  KUDOS_FIELDS.ProminenceFailureAt,
  KUDOS_FIELDS.ProminenceFailureReason,
  KUDOS_FIELDS.CurrentVisibilityMode,
  KUDOS_FIELDS.HomepageEnabled,
  // Scheduling
  KUDOS_FIELDS.IsScheduled,
  KUDOS_FIELDS.ScheduledPublishAt,
  KUDOS_FIELDS.PublishStartDate,
  KUDOS_FIELDS.PublishEndDate,
  // Engagement
  KUDOS_FIELDS.CelebrateCount,
  // Media
  KUDOS_FIELDS.PrimaryImage,
  KUDOS_FIELDS.ImageAltText,
  // Work ownership (expanded)
  `${KUDOS_FIELDS.ClaimOwner}/Id`,
  `${KUDOS_FIELDS.ClaimOwner}/Title`,
  `${KUDOS_FIELDS.AssignedOwner}/Id`,
  `${KUDOS_FIELDS.AssignedOwner}/Title`,
].join(',');

const KUDOS_EXPAND = [
  KUDOS_FIELDS.SubmittedBy,
  KUDOS_FIELDS.ApprovedBy,
  KUDOS_FIELDS.IndividualRecipients,
  KUDOS_FIELDS.ClaimOwner,
  KUDOS_FIELDS.AssignedOwner,
].join(',');

const CEL_SELECT = [
  CEL_FIELDS.AnnouncementId,
  `${CEL_FIELDS.PersonName}/Id`,
  `${CEL_FIELDS.PersonName}/Title`,
  `${CEL_FIELDS.PersonName}/EMail`,
  CEL_FIELDS.PersonDisplayName,
  CEL_FIELDS.CelebrationType,
  CEL_FIELDS.CelebrationDate,
  CEL_FIELDS.AnniversaryYears,
  CEL_FIELDS.HomepageEnabled,
  CEL_FIELDS.AudienceTags,
  CEL_FIELDS.PrimaryImage,
  CEL_FIELDS.ImageAltText,
].join(',');

const CEL_EXPAND = CEL_FIELDS.PersonName;

/* ── Raw SharePoint item shapes ────────────────────────────────── */

interface SpPersonValue {
  Id: number;
  Title: string;
  EMail?: string;
}

interface RawAnnouncementItem {
  AnnouncementId?: string;
  AnnouncementPerson?: SpPersonValue | null;
  PersonDisplayName?: string;
  AnnouncementType?: string;
  Headline?: string;
  Summary?: string;
  /**
   * Live InternalName for the publish date. The adapter remaps to
   * this shape after fetching — callers don't see the mangled
   * `PublishDateMapstopublishDate_x00` name directly.
   */
  PublishDate?: string;
  /** The mangled internal name as it comes off the wire. */
  PublishDateMapstopublishDate_x00?: string;
  StartDisplayDate?: string;
  EndDisplayDate?: string;
  IsPinned?: boolean;
  PriorityOverride?: number;
  HomepageEnabled?: boolean;
  AudienceTags?: string;
  CtaLabel?: string;
  CtaUrl?: string | { Url?: string; Description?: string };
  OpenInNewTab?: boolean;
  PrimaryImage?: string | { Url?: string; Description?: string };
  ImageAltText?: string;
  InternalNotes?: string;
}

interface RawKudosItem {
  KudosId?: string;
  Headline?: string;
  Excerpt?: string;
  Details?: string;
  SubmittedBy?: SpPersonValue | null;
  SubmittedDate?: string;
  ApprovedBy?: SpPersonValue | null;
  ApprovedDate?: string;
  IndividualRecipients?: { results?: SpPersonValue[] } | SpPersonValue[];
  TeamRecipients?: string;
  DepartmentRecipients?: string;
  ProjectGroupRecipients?: string;
  WorkflowStatus?: string;
  WasEverPublished?: boolean;
  // Governance metadata (Prompt-04 read-path extension)
  RejectionReason?: string;
  ModeratorNotes?: string;
  RevisionGuidance?: string;
  IsFlaggedForAdminReview?: boolean;
  AdminReviewReason?: string;
  IsRemovedFromPublicView?: boolean;
  RemovedReason?: string;
  // Prominence / visibility
  IsPinned?: boolean;
  PinOrder?: number;
  IsFeatured?: boolean;
  FeaturedExpiresAt?: string;
  ProminenceIntent?: string;
  ProminenceFailureAt?: string;
  ProminenceFailureReason?: string;
  CurrentVisibilityMode?: string;
  HomepageEnabled?: boolean;
  IsScheduled?: boolean;
  ScheduledPublishAt?: string;
  PublishStartDate?: string;
  PublishEndDate?: string;
  CelebrateCount?: number;
  PrimaryImage?: string | { Url?: string; Description?: string };
  ImageAltText?: string;
  // Work ownership (Phase-14 read-path extension)
  ClaimOwner?: SpPersonValue | null;
  AssignedOwner?: SpPersonValue | null;
}

interface RawCelebrationItem {
  AnnouncementId?: string;
  PersonName?: { results?: SpPersonValue[] } | SpPersonValue[];
  PersonDisplayName?: string;
  CelebrationType?: string;
  CelebrationDate?: string;
  AnniversaryYears?: number;
  /** SP mangled the column name — live internal name is 'HomepageEnabledGovernanceextensi'. */
  HomepageEnabledGovernanceextensi?: boolean;
  AudienceTags?: string;
  PrimaryImage?: string | { Url?: string; Description?: string };
  ImageAltText?: string;
}

/* ── Shared helpers ────────────────────────────────────────────── */

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

const ENTITY_RE = /&(?:amp|lt|gt|quot|apos|nbsp|#39);/g;

function stripHtml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:p|div|li|h\d)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(ENTITY_RE, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractUrl(field: string | { Url?: string; Description?: string } | undefined): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'string') return field || undefined;
  return field.Url || undefined;
}

function extractImageSrc(field: string | { Url?: string; Description?: string } | undefined, siteUrl: string): string | undefined {
  if (!field) return undefined;

  if (typeof field === 'string') {
    try {
      const parsed: unknown = JSON.parse(field);
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (typeof obj.serverRelativeUrl === 'string' && obj.serverRelativeUrl) {
          const base = (typeof obj.serverUrl === 'string' && obj.serverUrl) || siteUrl;
          return `${base}${obj.serverRelativeUrl}`;
        }
      }
    } catch {
      // Not JSON — plain URL
    }
    return field || undefined;
  }

  if ('Url' in field && field.Url) {
    return field.Url;
  }

  return undefined;
}

function resolvePersonName(person: SpPersonValue | null | undefined, fallback: string | undefined): string {
  return person?.Title?.trim() || fallback?.trim() || '';
}

function resolvePersonRef(person: SpPersonValue | null | undefined): PersonReference | undefined {
  if (!person?.Id || !person?.Title) return undefined;
  return {
    id: String(person.Id),
    displayName: person.Title.trim(),
    email: person.EMail?.trim() || undefined,
  };
}

function extractPersonArray(field: { results?: SpPersonValue[] } | SpPersonValue[] | undefined): SpPersonValue[] {
  if (!field) return [];
  return Array.isArray(field) ? field : field.results ?? [];
}

/**
 * Parse managed metadata note field values.
 * SharePoint stores taxonomy as pipe-delimited `WssId;#Label|...` in
 * the hidden note companion field. For the REST API with nometadata,
 * the value may arrive as a plain semicolon-delimited string or as the
 * full note field payload.
 */
function parseTaxonomyLabels(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  // Handle WssId;#Label patterns
  const labels: string[] = [];
  const parts = value.split('|').filter(Boolean);
  for (const part of parts) {
    const segments = part.split(';#');
    const label = segments.length > 1 ? segments[segments.length - 1] : segments[0];
    if (label?.trim()) {
      labels.push(label.trim());
    }
  }
  return labels;
}

function buildMedia(imageSrc: string | undefined, alt: string | undefined): { src: string; alt: string } | undefined {
  if (!imageSrc) return undefined;
  return { src: imageSrc, alt: alt?.trim() || '' };
}

const VALID_ANNOUNCEMENT_TYPES = new Set<string>(['promotion', 'newHire', 'baby', 'wedding', 'special']);
const VALID_CELEBRATION_TYPES = new Set<string>(['birthday', 'anniversary']);

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* ── Announcement mapping ──────────────────────────────────────── */

function mapAnnouncement(raw: RawAnnouncementItem, siteUrl: string): AnnouncementEntry | undefined {
  const id = raw.AnnouncementId?.trim();
  const personName = resolvePersonName(raw.AnnouncementPerson, raw.PersonDisplayName);
  const headline = raw.Headline?.trim();
  const summary = stripHtml(raw.Summary);
  const announcementType = raw.AnnouncementType?.trim();

  if (!id || !personName || !headline || !summary) return undefined;
  if (!announcementType || !VALID_ANNOUNCEMENT_TYPES.has(announcementType)) return undefined;

  const imageSrc = extractImageSrc(raw.PrimaryImage, siteUrl);
  const ctaUrl = extractUrl(raw.CtaUrl);
  const audiences = parseTaxonomyLabels(raw.AudienceTags);

  return {
    id,
    personName,
    announcementType: announcementType as AnnouncementType,
    headline,
    summary,
    publishDate: raw.PublishDate ?? '',
    startDisplayDate: raw.StartDisplayDate,
    endDisplayDate: raw.EndDisplayDate,
    isPinned: raw.IsPinned,
    priorityOverride: typeof raw.PriorityOverride === 'number' ? raw.PriorityOverride : undefined,
    homepageEnabled: raw.HomepageEnabled,
    audiences: audiences.length > 0 ? audiences : undefined,
    cta: raw.CtaLabel?.trim() && ctaUrl
      ? { label: raw.CtaLabel.trim(), href: ctaUrl, openInNewTab: raw.OpenInNewTab }
      : undefined,
    media: buildMedia(imageSrc, raw.ImageAltText),
  };
}

/* ── Kudos mapping ─────────────────────────────────────────────── */

function buildTaxonomyRecipients(value: string | undefined, type: KudosRecipientType): KudosRecipient[] {
  return parseTaxonomyLabels(value).map((label) => ({
    id: `${type}:${slugify(label)}`,
    name: label,
    recipientType: type,
  }));
}

const KUDOS_WORKFLOW_STATUS_CHOICES: ReadonlySet<KudosWorkflowStatus> = new Set([
  'pending',
  'revisionRequested',
  'approved',
  'approvedScheduled',
  'rejected',
  'withdrawn',
  'removedUnpublished',
]);

function parseKudosWorkflowStatus(value: string | undefined): KudosWorkflowStatus | undefined {
  if (!value) return undefined;
  const trimmed = value.trim() as KudosWorkflowStatus;
  return KUDOS_WORKFLOW_STATUS_CHOICES.has(trimmed) ? trimmed : undefined;
}

/**
 * Collapse the authoritative 7-state `WorkflowStatus` into the
 * narrow merged-webpart `KudosStatus` tri-state. `_ModerationStatus`
 * is intentionally ignored (the live lists do not use SharePoint
 * moderation).
 *
 * When the workflow status is missing from the raw payload we fall
 * back to the legacy `synthesizeStatus` behavior so older rows that
 * predate the field do not disappear from the public surface.
 */
function deriveKudosStatus(
  workflowStatus: KudosWorkflowStatus | undefined,
  raw: RawKudosItem,
): KudosStatus {
  switch (workflowStatus) {
    case 'approved':
    case 'approvedScheduled':
      return 'approved';
    case 'rejected':
    case 'withdrawn':
    case 'removedUnpublished':
      return 'rejected';
    case 'pending':
    case 'revisionRequested':
      return 'pending';
    default:
      if (raw.ApprovedDate || raw.ApprovedBy?.Id) return 'approved';
      return 'pending';
  }
}

function parseKudosProminenceIntent(value: string | undefined): KudosProminenceIntent | undefined {
  if (value === 'standard' || value === 'pinned' || value === 'featured') return value;
  return undefined;
}

function parseKudosVisibilityMode(value: string | undefined): KudosCurrentVisibilityMode | undefined {
  if (value === 'public' || value === 'associatedOnly' || value === 'internalOnly') return value;
  return undefined;
}

function mapKudos(raw: RawKudosItem, siteUrl: string): KudosEntry | undefined {
  const id = raw.KudosId?.trim();
  const headline = raw.Headline?.trim();
  const excerpt = stripHtml(raw.Excerpt);

  if (!id || !headline || !excerpt) return undefined;

  const submittedBy = resolvePersonRef(raw.SubmittedBy);
  if (!submittedBy) return undefined;

  const approvedBy = resolvePersonRef(raw.ApprovedBy);
  const imageSrc = extractImageSrc(raw.PrimaryImage, siteUrl);

  // Merge all recipient types
  const individualPeople = extractPersonArray(raw.IndividualRecipients);
  const individualRecipients: KudosRecipient[] = individualPeople
    .filter((p) => p.Id && p.Title)
    .map((p) => ({
      id: `individual:${p.Id}`,
      name: p.Title.trim(),
      recipientType: 'individual' as KudosRecipientType,
    }));

  const recipients: KudosRecipient[] = [
    ...individualRecipients,
    ...buildTaxonomyRecipients(raw.TeamRecipients, 'team'),
    ...buildTaxonomyRecipients(raw.DepartmentRecipients, 'department'),
    ...buildTaxonomyRecipients(raw.ProjectGroupRecipients, 'projectGroup'),
  ];

  const workflowStatus = parseKudosWorkflowStatus(raw.WorkflowStatus);
  const prominenceIntent = parseKudosProminenceIntent(raw.ProminenceIntent);
  const visibilityMode = parseKudosVisibilityMode(raw.CurrentVisibilityMode);
  const details = stripHtml(raw.Details);

  return {
    id,
    headline,
    excerpt,
    details: details ? details : undefined,
    submittedBy,
    submittedDate: raw.SubmittedDate ?? '',
    status: deriveKudosStatus(workflowStatus, raw),
    workflowStatus,
    wasEverPublished: raw.WasEverPublished === true ? true : raw.WasEverPublished === false ? false : undefined,
    approvedBy,
    approvedDate: raw.ApprovedDate,
    recipients,
    isPinned: raw.IsPinned,
    pinOrder: typeof raw.PinOrder === 'number' ? raw.PinOrder : undefined,
    isFeatured: raw.IsFeatured,
    featuredExpiresAt: raw.FeaturedExpiresAt,
    prominenceIntent,
    visibilityMode,
    homepageEnabled: raw.HomepageEnabled,
    isScheduled: raw.IsScheduled,
    scheduledPublishAt: raw.ScheduledPublishAt,
    publishStartDate: raw.PublishStartDate,
    publishEndDate: raw.PublishEndDate,
    celebrateCount: typeof raw.CelebrateCount === 'number' ? raw.CelebrateCount : undefined,
    media: buildMedia(imageSrc, raw.ImageAltText),
    // Governance metadata (Phase-14 Prompt-04 read-path extension)
    rejectionReason: raw.RejectionReason?.trim() || undefined,
    moderatorNotes: raw.ModeratorNotes?.trim() || undefined,
    revisionGuidance: raw.RevisionGuidance?.trim() || undefined,
    isFlaggedForAdminReview: raw.IsFlaggedForAdminReview === true ? true : undefined,
    adminReviewReason: raw.AdminReviewReason?.trim() || undefined,
    isRemovedFromPublicView: raw.IsRemovedFromPublicView === true ? true : undefined,
    removedReason: raw.RemovedReason?.trim() || undefined,
    prominenceFailureAt: raw.ProminenceFailureAt || undefined,
    prominenceFailureReason: raw.ProminenceFailureReason?.trim() || undefined,
    // Identity fields for associated-item access and ownership
    submittedById: raw.SubmittedBy?.Id,
    recipientUserIds: individualPeople.filter((p) => p.Id).map((p) => p.Id),
    claimOwnerId: raw.ClaimOwner?.Id,
    assignedOwnerId: raw.AssignedOwner?.Id,
  };
}

/* ── Celebrations mapping ──────────────────────────────────────── */

function mapCelebrations(raw: RawCelebrationItem, siteUrl: string): WeeklyCelebrationEntry[] {
  const baseId = raw.AnnouncementId?.trim();
  const celebrationType = raw.CelebrationType?.trim().toLowerCase();

  if (!baseId || !celebrationType) return [];
  if (!VALID_CELEBRATION_TYPES.has(celebrationType)) return [];

  // HomepageEnabled filter — treat missing/undefined as enabled
  if (raw.HomepageEnabledGovernanceextensi === false) return [];

  const imageSrc = extractImageSrc(raw.PrimaryImage, siteUrl);
  const media = buildMedia(imageSrc, raw.ImageAltText);
  const audiences = parseTaxonomyLabels(raw.AudienceTags);

  // Explode multi-person rows
  const people = extractPersonArray(raw.PersonName);

  if (people.length === 0) {
    // Fallback to display name text
    const name = raw.PersonDisplayName?.trim();
    if (!name) return [];
    return [{
      id: baseId,
      personName: name,
      celebrationType: celebrationType as WeeklyCelebrationType,
      celebrationDate: raw.CelebrationDate ?? '',
      anniversaryYears: typeof raw.AnniversaryYears === 'number' ? raw.AnniversaryYears : undefined,
      media,
      audiences: audiences.length > 0 ? audiences : undefined,
    }];
  }

  return people
    .filter((p) => p.Title?.trim())
    .map((p, idx) => ({
      id: people.length > 1 ? `${baseId}:${idx}` : baseId,
      personName: p.Title.trim(),
      celebrationType: celebrationType as WeeklyCelebrationType,
      celebrationDate: raw.CelebrationDate ?? '',
      anniversaryYears: typeof raw.AnniversaryYears === 'number' ? raw.AnniversaryYears : undefined,
      media,
      audiences: audiences.length > 0 ? audiences : undefined,
    }));
}

/* ── List fetching — bind by list ID, not title ─────────────────── */

/**
 * Fetch items from a People & Culture list by its GUID. Uses the
 * `/_api/web/lists(guid'{id}')/items` endpoint so that the known
 * title / URL mismatch between the announcements and celebrations
 * lists can never cause a silent cross-bind.
 */
async function fetchPcListItems<T>(
  siteUrl: string,
  list: PeopleCultureListDescriptor,
  select: string,
  expand: string,
  filter?: string,
  top = 50,
): Promise<T[]> {
  const url = buildPcListItemsEndpoint(siteUrl, list, { select, expand, filter, top });

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) {
    throw new Error(
      `SharePoint list "${list.title}" (id ${list.id}) request failed: ` +
        `${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as { value?: T[] };
  return body.value ?? [];
}

/* ── Resolve PublishDate internal name ──────────────────────────── */

/**
 * Defensive fallback resolver for the announcements `PublishDate`
 * column. The adapter already uses the mangled
 * `PublishDateMapstopublishDate_x00` internal name by default, but
 * this resolver queries the list's field metadata by GUID so a
 * future rename in SharePoint is caught without code changes.
 */
let _resolvedPublishDateField: string | undefined;

async function resolvePublishDateField(siteUrl: string): Promise<string> {
  if (_resolvedPublishDateField) return _resolvedPublishDateField;

  try {
    const url = buildPcListFieldsEndpoint(
      siteUrl,
      PEOPLE_CULTURE_LIST_REGISTRY.announcements,
      "Title eq 'PublishDate'",
    );
    const response = await fetch(url, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (response.ok) {
      const body = (await response.json()) as { value?: { InternalName?: string }[] };
      const resolved = body.value?.[0]?.InternalName;
      if (resolved) {
        _resolvedPublishDateField = resolved;
        return resolved;
      }
    }
  } catch {
    // Fall through to default.
  }

  _resolvedPublishDateField = ANN_FIELDS.PublishDate;
  return _resolvedPublishDateField;
}

/* ── Runtime list-binding guardrails ─────────────────────────────── */

/**
 * Validate that each known People & Culture list is reachable by
 * GUID and that its live field set still contains the critical
 * custom fields the adapter relies on. Returns a list of error
 * messages — an empty list means the adapter is safe to run.
 *
 * Callers should surface the result visibly to operators when it
 * is non-empty. Do not silently swallow the findings.
 */
export async function validatePeopleCultureListBindings(
  siteUrl: string,
  listKeys: ReadonlyArray<PeopleCultureListKey> = [
    'announcements',
    'celebrations',
    'kudos',
  ],
): Promise<string[]> {
  const errors: string[] = [];

  for (const key of listKeys) {
    const descriptor = PEOPLE_CULTURE_LIST_REGISTRY[key];
    try {
      const url = buildPcListFieldsEndpoint(siteUrl, descriptor);
      const response = await fetch(url, {
        headers: { Accept: 'application/json;odata=nometadata' },
      });
      if (!response.ok) {
        errors.push(
          `Cannot reach list "${descriptor.title}" (${key}, id ${descriptor.id}): ` +
            `${response.status} ${response.statusText}`,
        );
        continue;
      }
      const body = (await response.json()) as {
        value?: { InternalName?: string }[];
      };
      const live = new Set((body.value ?? []).map((f) => f.InternalName ?? ''));
      const missing = descriptor.criticalFieldInternalNames.filter(
        (name) => !live.has(name),
      );
      if (missing.length > 0) {
        errors.push(
          `List "${descriptor.title}" (${key}, id ${descriptor.id}) is missing ` +
            `critical custom fields: ${missing.join(', ')}.`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(
        `Failed to validate list "${descriptor.title}" (${key}, id ${descriptor.id}): ${message}`,
      );
    }
  }

  return errors;
}

/* ── Public API ──────────────────────────────────────────────────── */

export interface PeopleCultureListDataResult {
  config: Partial<PeopleCultureMergedConfig>;
  /**
   * Non-empty when one or more list fetches failed or the binding
   * guardrail found a missing critical field. Consumers must not
   * treat an empty config + non-empty errors as "no data".
   */
  errors: string[];
}

/**
 * Fetch all three People & Culture lists from SharePoint and map
 * them into the existing `PeopleCultureMergedConfig` contract.
 *
 * Fetches run concurrently. Each list failure is captured as an
 * entry in `result.errors` rather than silently swallowed — the
 * caller can surface the errors to operators and avoid rendering
 * an empty state as success.
 *
 * Binding: every REST call uses the list GUID from
 * `peopleCultureSpListRegistry`. The known announcements /
 * celebrations URL vs title mismatch cannot cross-bind.
 */
export async function fetchPeopleCultureListData(
  siteUrl: string,
  _now = new Date(),
): Promise<PeopleCultureListDataResult> {
  const errors: string[] = [];

  // Resolve the PublishDate field internal name. Defaults to the
  // mangled live name (PublishDateMapstopublishDate_x00); the
  // resolver is a redundant safety net.
  const publishDateField = await resolvePublishDateField(siteUrl);
  const annSelect = buildAnnSelect(publishDateField);

  const [rawAnnouncements, rawKudos, rawCelebrations] = await Promise.all([
    fetchPcListItems<RawAnnouncementItem>(
      siteUrl,
      PEOPLE_CULTURE_LIST_REGISTRY.announcements,
      annSelect,
      ANN_EXPAND,
      `${ANN_FIELDS.HomepageEnabled} eq 1`,
    ).catch((err: unknown): RawAnnouncementItem[] => {
      errors.push(err instanceof Error ? err.message : String(err));
      return [];
    }),
    fetchPcListItems<RawKudosItem>(
      siteUrl,
      PEOPLE_CULTURE_LIST_REGISTRY.kudos,
      KUDOS_SELECT,
      KUDOS_EXPAND,
    ).catch((err: unknown): RawKudosItem[] => {
      errors.push(err instanceof Error ? err.message : String(err));
      return [];
    }),
    fetchPcListItems<RawCelebrationItem>(
      siteUrl,
      PEOPLE_CULTURE_LIST_REGISTRY.celebrations,
      CEL_SELECT,
      CEL_EXPAND,
    ).catch((err: unknown): RawCelebrationItem[] => {
      errors.push(err instanceof Error ? err.message : String(err));
      return [];
    }),
  ]);

  // Remap the announcements PublishDate internal name onto the
  // adapter's stable `PublishDate` key so the mapper can read it
  // uniformly regardless of which internal name SharePoint returned.
  const announcements = rawAnnouncements.map((raw) => {
    const record = raw as Record<string, unknown>;
    const fromMangled = record[ANN_FIELDS.PublishDate];
    if (typeof fromMangled === 'string') {
      return { ...raw, PublishDate: fromMangled };
    }
    if (publishDateField !== ANN_FIELDS.PublishDate) {
      const resolvedValue = record[publishDateField];
      if (typeof resolvedValue === 'string') {
        return { ...raw, PublishDate: resolvedValue };
      }
    }
    return raw;
  });

  const mappedAnnouncements = announcements
    .map((raw) => mapAnnouncement(raw, siteUrl))
    .filter((item): item is AnnouncementEntry => item != null);

  const mappedKudos = rawKudos
    .map((raw) => mapKudos(raw, siteUrl))
    .filter((item): item is KudosEntry => item != null);

  const mappedCelebrations = rawCelebrations
    .flatMap((raw) => mapCelebrations(raw, siteUrl));

  return {
    config: {
      announcements: mappedAnnouncements,
      kudos: mappedKudos,
      celebrations: mappedCelebrations,
    },
    errors,
  };
}
