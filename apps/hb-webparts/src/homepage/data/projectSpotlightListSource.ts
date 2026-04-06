/**
 * SharePoint list data source for the Project Spotlight webpart.
 *
 * Fetches items from the "Homepage Project Spotlights" list via the
 * SharePoint REST API and maps them to the existing
 * ProjectPortfolioSpotlightItem contract so the downstream
 * normalization pipeline works unchanged.
 */
import type {
  ProjectPortfolioSpotlightItem,
  ProjectMilestone,
  ProjectTeamMember,
  OperationalSignalSource,
  OperationalStatusVariant,
} from '../webparts/operationalAwarenessContracts.js';

/* ── List metadata ──────────────────────────────────────────────── */

export const SP_LIST_TITLE = 'Homepage Project Spotlights';

/* ── SharePoint field internal names ────────────────────────────── */

export const SP_FIELDS = {
  Title: 'Title',
  ProjectId: 'ProjectId',
  ProjectUrl: 'ProjectUrl',
  HomepageEnabled: 'HomepageEnabled',
  IsFeatured: 'IsFeatured',
  DisplayOrder: 'DisplayOrder',
  Headline: 'Headline',
  Summary: 'Summary',
  LocationText: 'LocationText',
  Sector: 'Sector',
  PrimaryImage: 'PrimaryImage',
  PrimaryImageAltText: 'PrimaryImageAltText',
  StatusLabel: 'StatusLabel',
  StatusVariant: 'StatusVariant',
  StrategicEmphasis: 'StrategicEmphasis',
  FreshnessDate: 'FreshnessDate',
  FreshnessSource: 'FreshnessSource',
  MilestonesCompleted: 'MilestonesCompleted',
  MilestonesTotal: 'MilestonesTotal',
  MilestoneSummary: 'MilestoneSummary',
  CtaLabel: 'CtaLabel',
  CtaUrl: 'CtaUrl',
  ProjectTeamMembers: 'ProjectTeamMembers',
  Audience: 'Audience',
  StaleAfterDays: 'StaleAfterDays',
  PublishStart: 'PublishStart',
  PublishEnd: 'PublishEnd',
} as const;

/**
 * $select fields for the REST query. Person fields require separate
 * $expand so we request the Id array here and expand separately.
 */
const SELECT_FIELDS = [
  SP_FIELDS.Title,
  SP_FIELDS.ProjectId,
  SP_FIELDS.ProjectUrl,
  SP_FIELDS.HomepageEnabled,
  SP_FIELDS.IsFeatured,
  SP_FIELDS.DisplayOrder,
  SP_FIELDS.Headline,
  SP_FIELDS.Summary,
  SP_FIELDS.LocationText,
  SP_FIELDS.Sector,
  SP_FIELDS.PrimaryImage,
  SP_FIELDS.PrimaryImageAltText,
  SP_FIELDS.StatusLabel,
  SP_FIELDS.StatusVariant,
  SP_FIELDS.StrategicEmphasis,
  SP_FIELDS.FreshnessDate,
  SP_FIELDS.FreshnessSource,
  SP_FIELDS.MilestonesCompleted,
  SP_FIELDS.MilestonesTotal,
  SP_FIELDS.MilestoneSummary,
  SP_FIELDS.CtaLabel,
  SP_FIELDS.CtaUrl,
  `${SP_FIELDS.ProjectTeamMembers}/Id`,
  `${SP_FIELDS.ProjectTeamMembers}/Title`,
  `${SP_FIELDS.ProjectTeamMembers}/EMail`,
  SP_FIELDS.Audience,
  SP_FIELDS.StaleAfterDays,
  SP_FIELDS.PublishStart,
  SP_FIELDS.PublishEnd,
].join(',');

const EXPAND_FIELDS = SP_FIELDS.ProjectTeamMembers;

/* ── Raw SharePoint item shape ──────────────────────────────────── */

interface SpPersonValue {
  Id: number;
  Title: string;
  EMail?: string;
}

/** Shape returned by the SharePoint REST API after $select/$expand. */
export interface RawSpotlightListItem {
  Title?: string;
  ProjectId?: string;
  ProjectUrl?: string | { Url?: string; Description?: string };
  HomepageEnabled?: boolean;
  IsFeatured?: boolean;
  DisplayOrder?: number;
  Headline?: string;
  Summary?: string;
  LocationText?: string;
  Sector?: string;
  PrimaryImage?: string | { serverRelativeUrl?: string; serverUrl?: string };
  PrimaryImageAltText?: string;
  StatusLabel?: string;
  StatusVariant?: string;
  StrategicEmphasis?: boolean;
  FreshnessDate?: string;
  FreshnessSource?: string;
  MilestonesCompleted?: number;
  MilestonesTotal?: number;
  MilestoneSummary?: string;
  CtaLabel?: string;
  CtaUrl?: string | { Url?: string; Description?: string };
  ProjectTeamMembers?: { results?: SpPersonValue[] } | SpPersonValue[];
  Audience?: string;
  StaleAfterDays?: number;
  PublishStart?: string;
  PublishEnd?: string;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function extractUrl(field: string | { Url?: string; Description?: string } | undefined): string | undefined {
  if (!field) return undefined;
  if (typeof field === 'string') return field || undefined;
  return field.Url || undefined;
}

/**
 * Extract a usable image URL from a SharePoint PrimaryImage field.
 *
 * SharePoint Image columns return a **JSON-encoded string** via REST API
 * (odata=nometadata) — not a plain URL or a pre-parsed object. The JSON
 * contains `serverUrl` and `serverRelativeUrl` which must be combined
 * to produce a full image URL.
 *
 * Handles: JSON string, plain URL string, and pre-parsed object shapes.
 */
function extractImageSrc(field: RawSpotlightListItem['PrimaryImage'], siteUrl: string): string | undefined {
  if (!field) return undefined;

  if (typeof field === 'string') {
    // SharePoint Image columns arrive as JSON-encoded strings.
    // Try to parse before assuming it's a direct URL.
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
      // Not JSON — treat as a plain URL string
    }
    return field || undefined;
  }

  // Pre-parsed object (defensive — may come from manifest seed data)
  if (field.serverRelativeUrl) {
    const base = field.serverUrl || siteUrl;
    return `${base}${field.serverRelativeUrl}`;
  }
  return undefined;
}

function isValidStatusVariant(v: string | undefined): v is OperationalStatusVariant {
  return v === 'info' || v === 'success' || v === 'warning' || v === 'critical' || v === 'neutral';
}

function isValidFreshnessSource(v: string | undefined): v is OperationalSignalSource {
  return v === 'curated' || v === 'live';
}

/**
 * Build a synthetic milestone array from the aggregate counts.
 * The component renders "X of Y milestones" so it only needs
 * the length and completed flags.
 */
function buildMilestones(completed: number | undefined, total: number | undefined, summary: string | undefined): ProjectMilestone[] {
  const c = typeof completed === 'number' && completed >= 0 ? completed : 0;
  const t = typeof total === 'number' && total >= 0 ? total : 0;
  if (t === 0) return [];

  const label = summary?.trim() || 'Milestone';
  const milestones: ProjectMilestone[] = [];
  for (let i = 0; i < Math.min(c, t); i++) {
    milestones.push({ id: `ms-c${i}`, title: label, completed: true });
  }
  for (let i = 0; i < t - Math.min(c, t); i++) {
    milestones.push({ id: `ms-i${i}`, title: label, completed: false });
  }
  return milestones;
}

function mapTeamMembers(raw: RawSpotlightListItem['ProjectTeamMembers'], siteUrl: string): ProjectTeamMember[] {
  const people: SpPersonValue[] = Array.isArray(raw) ? raw : raw?.results ?? [];
  return people
    .filter((p) => p.Id && p.Title)
    .map((p) => ({
      id: String(p.Id),
      displayName: p.Title,
      photoUrl: p.EMail
        ? `${siteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${encodeURIComponent(p.EMail)}`
        : undefined,
    }));
}

/**
 * Returns true when the item is within its publish window right now.
 * Items without publish dates are always considered active.
 */
function isWithinPublishWindow(item: RawSpotlightListItem, now: Date): boolean {
  const nowMs = now.getTime();
  if (item.PublishStart) {
    const start = Date.parse(item.PublishStart);
    if (Number.isFinite(start) && start > nowMs) return false;
  }
  if (item.PublishEnd) {
    const end = Date.parse(item.PublishEnd);
    if (Number.isFinite(end) && end < nowMs) return false;
  }
  return true;
}

/* ── Public API ──────────────────────────────────────────────────── */

/** Map a single raw SharePoint list item to the existing spotlight contract. */
export function mapListItemToSpotlight(raw: RawSpotlightListItem, siteUrl: string): ProjectPortfolioSpotlightItem {
  const projectUrl = extractUrl(raw.ProjectUrl);
  const ctaUrl = extractUrl(raw.CtaUrl) || projectUrl;
  const imageSrc = extractImageSrc(raw.PrimaryImage, siteUrl);

  return {
    id: raw.ProjectId?.trim() || raw.Title?.trim() || '',
    title: raw.Title?.trim() || '',
    summary: raw.Summary?.trim() || '',
    highlightHeadline: raw.Headline?.trim() || undefined,
    location: raw.LocationText?.trim() || undefined,
    sector: raw.Sector?.trim() || undefined,
    image: imageSrc ? { src: imageSrc, alt: raw.PrimaryImageAltText?.trim() || '', aspectRatio: '16:9' } : undefined,
    featured: raw.IsFeatured ?? false,
    strategicEmphasis: raw.StrategicEmphasis ?? false,
    order: typeof raw.DisplayOrder === 'number' ? raw.DisplayOrder : undefined,
    status: raw.StatusLabel?.trim()
      ? { label: raw.StatusLabel.trim(), variant: isValidStatusVariant(raw.StatusVariant) ? raw.StatusVariant : 'info' }
      : undefined,
    freshness: {
      source: isValidFreshnessSource(raw.FreshnessSource) ? raw.FreshnessSource : 'curated',
      updatedAt: raw.FreshnessDate || undefined,
    },
    milestones: buildMilestones(raw.MilestonesCompleted, raw.MilestonesTotal, raw.MilestoneSummary),
    cta: raw.CtaLabel?.trim() && ctaUrl ? { label: raw.CtaLabel.trim(), href: ctaUrl } : undefined,
    teamMembers: mapTeamMembers(raw.ProjectTeamMembers, siteUrl),
    audiences: raw.Audience?.trim() ? [raw.Audience.trim()] : undefined,
  };
}

/**
 * Fetch enabled, in-window items from the Homepage Project Spotlights
 * list and map them to the existing spotlight contract.
 *
 * Applies server-side filter on HomepageEnabled. Publish-window and
 * audience filtering happen client-side through the existing
 * normalization pipeline and the isWithinPublishWindow guard.
 */
export async function fetchSpotlightListItems(
  siteUrl: string,
  now = new Date(),
): Promise<{
  items: ProjectPortfolioSpotlightItem[];
  staleAfterHours?: number;
}> {
  const filter = `${SP_FIELDS.HomepageEnabled} eq 1`;
  const url =
    `${siteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(SP_LIST_TITLE)}')/items` +
    `?$select=${SELECT_FIELDS}` +
    `&$expand=${EXPAND_FIELDS}` +
    `&$filter=${filter}` +
    `&$top=20`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json;odata=nometadata',
    },
  });

  if (!response.ok) {
    throw new Error(`SharePoint list request failed: ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as { value?: RawSpotlightListItem[] };
  const rawItems = body.value ?? [];

  // Client-side publish window filter
  const activeItems = rawItems.filter((item) => isWithinPublishWindow(item, now));

  // Determine staleAfterHours from first item that has StaleAfterDays
  // (list-level setting — all items should agree, but take the first non-null).
  const staleAfterDays = activeItems.find((i) => typeof i.StaleAfterDays === 'number')?.StaleAfterDays;
  const staleAfterHours = typeof staleAfterDays === 'number' && staleAfterDays > 0
    ? staleAfterDays * 24
    : undefined;

  return {
    items: activeItems.map((item) => mapListItemToSpotlight(item, siteUrl)),
    staleAfterHours,
  };
}
