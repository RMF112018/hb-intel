/**
 * SharePoint list data source for the People & Culture webpart.
 *
 * Fetches items from three live SharePoint lists (Announcements, Kudos,
 * Celebrations) and maps them into the existing PeopleCultureMergedConfig
 * contract so the downstream normalization pipeline works unchanged.
 *
 * Follows the same architectural pattern as projectSpotlightListSource.ts.
 */
import type {
  AnnouncementEntry,
  AnnouncementType,
  KudosEntry,
  KudosRecipient,
  KudosRecipientType,
  KudosStatus,
  PersonReference,
  PeopleCultureMergedConfig,
  WeeklyCelebrationEntry,
  WeeklyCelebrationType,
} from '../webparts/communicationsContracts.js';

/* ── List metadata ──────────────────────────────────────────────── */

export const SP_LIST_ANNOUNCEMENTS = 'People Culture Announcements1';
export const SP_LIST_KUDOS = 'People Culture Kudos';

/**
 * Celebrations list title is uncertain from CSV exports.
 * Try these candidates in order at runtime.
 */
const CELEBRATIONS_TITLE_CANDIDATES = [
  'People Culture Celebrations',
  'People Culture Celebrations1',
] as const;

/* ── SharePoint field internal names ────────────────────────────── */

export const ANN_FIELDS = {
  AnnouncementId: 'AnnouncementId',
  AnnouncementPerson: 'AnnouncementPerson',
  PersonDisplayName: 'PersonDisplayName',
  AnnouncementType: 'AnnouncementType',
  Headline: 'Headline',
  Summary: 'Summary',
  PublishDate: 'PublishDate',
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
} as const;

export const KUDOS_FIELDS = {
  KudosId: 'KudosId',
  Headline: 'Headline',
  Excerpt: 'Excerpt',
  SubmittedBy: 'SubmittedBy',
  SubmittedDate: 'SubmittedDate',
  ApprovedBy: 'ApprovedBy',
  ApprovedDate: 'ApprovedDate',
  IndividualRecipients: 'IndividualRecipients',
  TeamRecipients: 'TeamRecipients',
  DepartmentRecipients: 'DepartmentRecipients',
  ProjectGroupRecipients: 'ProjectGroupRecipients',
  IsPinned: 'IsPinned',
  HomepageEnabled: 'HomepageEnabled',
  PublishStartDate: 'PublishStartDate',
  PublishEndDate: 'PublishEndDate',
  CelebrateCount: 'CelebrateCount',
  PrimaryImage: 'PrimaryImage',
  ImageAltText: 'ImageAltText',
} as const;

export const CEL_FIELDS = {
  AnnouncementId: 'AnnouncementId',
  PersonName: 'PersonName',
  PersonDisplayName: 'PersonDisplayName',
  CelebrationType: 'CelebrationType',
  CelebrationDate: 'CelebrationDate',
  AnniversaryYears: 'AnniversaryYears',
  HomepageEnabled: 'HomepageEnabled',
  AudienceTags: 'AudienceTags',
  PrimaryImage: 'PrimaryImage',
  ImageAltText: 'ImageAltText',
} as const;

/* ── $select / $expand strings ─────────────────────────────────── */

const ANN_SELECT = [
  ANN_FIELDS.AnnouncementId,
  `${ANN_FIELDS.AnnouncementPerson}/Id`,
  `${ANN_FIELDS.AnnouncementPerson}/Title`,
  `${ANN_FIELDS.AnnouncementPerson}/EMail`,
  ANN_FIELDS.PersonDisplayName,
  ANN_FIELDS.AnnouncementType,
  ANN_FIELDS.Headline,
  ANN_FIELDS.Summary,
  ANN_FIELDS.PublishDate,
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
].join(',');

const ANN_EXPAND = ANN_FIELDS.AnnouncementPerson;

const KUDOS_SELECT = [
  KUDOS_FIELDS.KudosId,
  KUDOS_FIELDS.Headline,
  KUDOS_FIELDS.Excerpt,
  `${KUDOS_FIELDS.SubmittedBy}/Id`,
  `${KUDOS_FIELDS.SubmittedBy}/Title`,
  `${KUDOS_FIELDS.SubmittedBy}/EMail`,
  KUDOS_FIELDS.SubmittedDate,
  `${KUDOS_FIELDS.ApprovedBy}/Id`,
  `${KUDOS_FIELDS.ApprovedBy}/Title`,
  `${KUDOS_FIELDS.ApprovedBy}/EMail`,
  KUDOS_FIELDS.ApprovedDate,
  `${KUDOS_FIELDS.IndividualRecipients}/Id`,
  `${KUDOS_FIELDS.IndividualRecipients}/Title`,
  `${KUDOS_FIELDS.IndividualRecipients}/EMail`,
  KUDOS_FIELDS.TeamRecipients,
  KUDOS_FIELDS.DepartmentRecipients,
  KUDOS_FIELDS.ProjectGroupRecipients,
  KUDOS_FIELDS.IsPinned,
  KUDOS_FIELDS.HomepageEnabled,
  KUDOS_FIELDS.PublishStartDate,
  KUDOS_FIELDS.PublishEndDate,
  KUDOS_FIELDS.CelebrateCount,
  KUDOS_FIELDS.PrimaryImage,
  KUDOS_FIELDS.ImageAltText,
].join(',');

const KUDOS_EXPAND = [
  KUDOS_FIELDS.SubmittedBy,
  KUDOS_FIELDS.ApprovedBy,
  KUDOS_FIELDS.IndividualRecipients,
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
  PublishDate?: string;
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
}

interface RawKudosItem {
  KudosId?: string;
  Headline?: string;
  Excerpt?: string;
  SubmittedBy?: SpPersonValue | null;
  SubmittedDate?: string;
  ApprovedBy?: SpPersonValue | null;
  ApprovedDate?: string;
  IndividualRecipients?: { results?: SpPersonValue[] } | SpPersonValue[];
  TeamRecipients?: string;
  DepartmentRecipients?: string;
  ProjectGroupRecipients?: string;
  IsPinned?: boolean;
  HomepageEnabled?: boolean;
  PublishStartDate?: string;
  PublishEndDate?: string;
  CelebrateCount?: number;
  PrimaryImage?: string | { Url?: string; Description?: string };
  ImageAltText?: string;
}

interface RawCelebrationItem {
  AnnouncementId?: string;
  PersonName?: { results?: SpPersonValue[] } | SpPersonValue[];
  PersonDisplayName?: string;
  CelebrationType?: string;
  CelebrationDate?: string;
  AnniversaryYears?: number;
  HomepageEnabled?: boolean;
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

function synthesizeStatus(raw: RawKudosItem): KudosStatus {
  if (raw.ApprovedDate || raw.ApprovedBy?.Id) return 'approved';
  return 'pending';
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

  return {
    id,
    headline,
    excerpt,
    submittedBy,
    submittedDate: raw.SubmittedDate ?? '',
    status: synthesizeStatus(raw),
    approvedBy,
    approvedDate: raw.ApprovedDate,
    recipients,
    isPinned: raw.IsPinned,
    homepageEnabled: raw.HomepageEnabled,
    publishStartDate: raw.PublishStartDate,
    publishEndDate: raw.PublishEndDate,
    celebrateCount: typeof raw.CelebrateCount === 'number' ? raw.CelebrateCount : undefined,
    media: buildMedia(imageSrc, raw.ImageAltText),
  };
}

/* ── Celebrations mapping ──────────────────────────────────────── */

function mapCelebrations(raw: RawCelebrationItem, siteUrl: string): WeeklyCelebrationEntry[] {
  const baseId = raw.AnnouncementId?.trim();
  const celebrationType = raw.CelebrationType?.trim().toLowerCase();

  if (!baseId || !celebrationType) return [];
  if (!VALID_CELEBRATION_TYPES.has(celebrationType)) return [];

  // HomepageEnabled filter — treat missing/undefined as enabled
  if (raw.HomepageEnabled === false) return [];

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

/* ── List fetching ─────────────────────────────────────────────── */

async function fetchListItems<T>(
  siteUrl: string,
  listTitle: string,
  select: string,
  expand: string,
  filter?: string,
  top = 50,
): Promise<T[]> {
  const params = [
    `$select=${select}`,
    `$expand=${expand}`,
    `$top=${top}`,
  ];
  if (filter) params.push(`$filter=${filter}`);

  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(listTitle)}')/items` +
    `?${params.join('&')}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });

  if (!response.ok) {
    throw new Error(`SharePoint list "${listTitle}" request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { value?: T[] };
  return body.value ?? [];
}

/**
 * Resolve the actual celebrations list title by trying known candidates.
 * Returns the first title that responds successfully, or undefined.
 */
async function resolveCelebrationsListTitle(siteUrl: string): Promise<string | undefined> {
  for (const candidate of CELEBRATIONS_TITLE_CANDIDATES) {
    try {
      const url =
        `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(candidate)}')?$select=Title,Id`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json;odata=nometadata' },
      });
      if (response.ok) return candidate;
    } catch {
      // Try next candidate
    }
  }
  return undefined;
}

/* ── Resolve PublishDate internal name ──────────────────────────── */

/**
 * The PublishDate field may have a mangled internal name in SharePoint.
 * Resolve it once via field metadata if the default name fails.
 */
let _resolvedPublishDateField: string | undefined;

async function resolvePublishDateField(siteUrl: string): Promise<string> {
  if (_resolvedPublishDateField) return _resolvedPublishDateField;

  try {
    const url =
      `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(SP_LIST_ANNOUNCEMENTS)}')/fields` +
      `?$filter=Title eq 'PublishDate'&$select=InternalName`;
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
    // Fall through to default
  }

  _resolvedPublishDateField = ANN_FIELDS.PublishDate;
  return _resolvedPublishDateField;
}

/* ── Public API ──────────────────────────────────────────────────── */

export interface PeopleCultureListDataResult {
  config: Partial<PeopleCultureMergedConfig>;
}

/**
 * Fetch all three People & Culture lists from SharePoint and map
 * them into the existing PeopleCultureMergedConfig contract.
 *
 * Fetches run concurrently. Individual list failures are caught
 * and result in empty arrays for that band — the component falls
 * back gracefully.
 */
export async function fetchPeopleCultureListData(
  siteUrl: string,
  _now = new Date(),
): Promise<PeopleCultureListDataResult> {
  // Resolve the PublishDate field name in parallel with list fetches
  const [publishDateField, rawAnnouncements, rawKudos, celebrationsResult] = await Promise.all([
    resolvePublishDateField(siteUrl),
    fetchListItems<RawAnnouncementItem>(
      siteUrl,
      SP_LIST_ANNOUNCEMENTS,
      ANN_SELECT,
      ANN_EXPAND,
      `${ANN_FIELDS.HomepageEnabled} eq 1`,
    ).catch((): RawAnnouncementItem[] => []),
    fetchListItems<RawKudosItem>(
      siteUrl,
      SP_LIST_KUDOS,
      KUDOS_SELECT,
      KUDOS_EXPAND,
    ).catch((): RawKudosItem[] => []),
    (async (): Promise<RawCelebrationItem[]> => {
      const title = await resolveCelebrationsListTitle(siteUrl);
      if (!title) return [];
      return fetchListItems<RawCelebrationItem>(
        siteUrl,
        title,
        CEL_SELECT,
        CEL_EXPAND,
      ).catch((): RawCelebrationItem[] => []);
    })(),
  ]);

  // Remap PublishDate if the internal name differs from the default
  const announcements = rawAnnouncements.map((raw) => {
    if (publishDateField !== ANN_FIELDS.PublishDate) {
      const record = raw as Record<string, unknown>;
      const resolvedValue = record[publishDateField];
      if (resolvedValue !== undefined && typeof resolvedValue === 'string') {
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

  const mappedCelebrations = celebrationsResult
    .flatMap((raw) => mapCelebrations(raw, siteUrl));

  return {
    config: {
      announcements: mappedAnnouncements,
      kudos: mappedKudos,
      celebrations: mappedCelebrations,
    },
  };
}
