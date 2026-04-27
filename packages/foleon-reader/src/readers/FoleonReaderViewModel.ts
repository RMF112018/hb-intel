import type { FoleonContentRecord, FoleonReaderKey } from '../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../services/FoleonReaderContentService.js';
import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import type { FoleonArticleCardViewModel } from './FoleonViewerTypes.js';
import {
  createPreviewFoleonViewerTarget,
  createReadyFoleonViewerTarget,
} from './FoleonViewerTypes.js';

// ---------------------------------------------------------------------------
// Foleon reader — shared view model + lane layout key mapper
// ---------------------------------------------------------------------------
// Phase-04 Wave-01 Prompt-02 architecture seam.
//
// The view model normalizes preview and ready state into a single shape so
// every lane layout consumes the same fields regardless of source. The
// layout-key mapper resolves the typed `FoleonReaderLayoutKey` from the
// existing `FoleonReaderModuleConfig.readerKey` so callers do not have to
// thread a separate lane key. Adapter helpers centralize the per-lane
// freshness / audience / archive defaults previously inlined inside
// `FoleonReaderModule`.
//
// This module does not perform any visual redesign. The fields below are
// the seam later prompts (03 / 04 / 05) will use to differentiate the
// three lane compositions.
// ---------------------------------------------------------------------------

export type FoleonReaderLayoutKey = 'projectSpotlight' | 'companyPulse' | 'leadershipMessage';

export type FoleonReaderViewState = 'preview' | 'ready';

export interface FoleonReaderChip {
  readonly id: string;
  readonly label: string;
  readonly tone?: 'neutral' | 'accent';
}

export interface FoleonReaderFact {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface FoleonReaderSupportItem {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export type FoleonReaderActionVariant = 'primary' | 'secondary';

export interface FoleonReaderAction {
  readonly id: string;
  readonly label: string;
  readonly variant: FoleonReaderActionVariant;
  readonly onClick: () => void;
}

export interface FoleonReaderIframeModel {
  /** Accessible iframe title — preserved verbatim by the layout. */
  readonly title: string;
  /** Layout-side hint that the iframe should be visible (false on collapsed mobile). */
  readonly visible: boolean;
}

export interface FoleonReaderMobileGate {
  readonly headline: string;
  readonly body: string;
}

/**
 * Project Spotlight project facts. Populated only when
 * `lane === 'projectSpotlight'`. `arePlaceholders` distinguishes preview
 * sample copy from record-backed values; layouts must label preview
 * placeholders explicitly.
 *
 * Ready-state values are derived **only** from `FoleonContentRecord`
 * fields; absent record fields render as `'Not listed'` or are omitted
 * by the layout. The adapter never invents data for ready state.
 */
export interface FoleonReaderProjectFacts {
  readonly client?: string;
  readonly location?: string;
  readonly market?: string;
  readonly team?: string;
  readonly milestone?: string;
  readonly arePlaceholders: boolean;
}

/**
 * Project Spotlight "Why this project matters" callout. Populated only
 * when `lane === 'projectSpotlight'`.
 */
export interface FoleonReaderFeatureCallout {
  readonly heading: string;
  readonly body: string;
}

/**
 * Project Spotlight visual media model. Populated only when
 * `lane === 'projectSpotlight'`. Sourced exclusively from
 * `FoleonContentRecord.heroImageUrl` / `thumbnailUrl`. The schema does
 * not currently carry editorial alt text — `accessibleLabel` is a
 * conservative fallback (e.g. `"Project Spotlight image for {title}"`)
 * for screen readers, NOT editorial alt text. Decorative placeholder
 * blocks rendered by the layout are marked `aria-hidden`.
 */
export interface FoleonReaderProjectMedia {
  readonly primaryImageUrl?: string;
  readonly thumbnailUrl?: string;
  readonly hasRecordMedia: boolean;
  readonly isPlaceholder: boolean;
  /** Generated fallback accessibility label. Not editorial alt text. */
  readonly accessibleLabel?: string;
}

/**
 * Company Pulse briefing lead — the latest active editorial update.
 * Populated only when `lane === 'companyPulse'`. Ready-state values
 * are derived from `FoleonContentRecord`; preview values are clearly
 * labeled sample copy.
 */
export interface FoleonReaderBriefingLead {
  readonly title: string;
  readonly body: string;
  readonly category?: string;
  readonly dateline?: string;
  readonly isPlaceholder: boolean;
}

/**
 * Company Pulse compact secondary digest item. Used **only** by preview
 * (sample updates spanning the four conceptual categories). Ready state
 * leaves the digest empty because the registry currently carries one
 * active record per lane; secondary editions live in the archive.
 */
export interface FoleonReaderBriefingItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly category: string;
  readonly dateline?: string;
}

/**
 * Company Pulse category chip. Static taxonomy that describes the
 * lane's editorial scope (news / events / recognition / operations).
 * Not derived from the active record.
 */
export interface FoleonReaderCategoryChip {
  readonly id: string;
  readonly label: string;
}

/**
 * Company Pulse pulse timeline strip entry. Optional. Preview-only.
 */
export interface FoleonReaderPulseTimelineEntry {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface FoleonReaderPulseMedia {
  readonly primaryImageUrl?: string;
  readonly thumbnailUrl?: string;
  readonly hasRecordMedia: boolean;
  readonly isPlaceholder: boolean;
  readonly accessibleLabel?: string;
}

/**
 * Leadership Message executive composition. Populated only when
 * `lane === 'leadershipMessage'`. Ready-state values are sourced
 * **only** from `FoleonContentRecord` fields the schema actually
 * carries. Fields the schema does not carry (byline, role, portrait)
 * remain `undefined` — the layout renders an honest fallback or omits
 * the row. Preview values are clearly labeled sample copy.
 */
export interface FoleonReaderLeadershipMessage {
  readonly byline?: string;
  readonly role?: string;
  readonly pullQuote?: string;
  readonly messageBody?: string;
  readonly contextNotes?: readonly { readonly id: string; readonly label: string; readonly value: string }[];
  readonly isPlaceholder: boolean;
}

export interface FoleonReaderViewModel {
  readonly lane: FoleonReaderLayoutKey;
  readonly state: FoleonReaderViewState;
  readonly readerKey: FoleonReaderKey;
  readonly contentTypeKey: string;
  readonly placementKey: string;
  readonly title: string;
  readonly summary?: string;
  readonly eyebrow: string;
  readonly previewLabel?: string;
  readonly freshnessLabel: string;
  readonly freshnessValue: string;
  readonly audience: string;
  readonly archiveGroup: string;
  readonly chips: readonly FoleonReaderChip[];
  readonly facts: readonly FoleonReaderFact[];
  readonly supportItems: readonly FoleonReaderSupportItem[];
  readonly governanceNotes: readonly string[];
  readonly statusNotes: readonly string[];
  readonly actions: readonly FoleonReaderAction[];
  readonly iframe?: FoleonReaderIframeModel;
  readonly mobileGate?: FoleonReaderMobileGate;
  readonly warnings: readonly string[];
  readonly archiveNote?: string;
  /** Stable id for `aria-labelledby` on the layout title element. */
  readonly titleElementId: string;
  /** Project Spotlight only. Pulse + Leadership leave this `undefined`. */
  readonly projectFacts?: FoleonReaderProjectFacts;
  /** Project Spotlight only. Pulse + Leadership leave this `undefined`. */
  readonly featureCallout?: FoleonReaderFeatureCallout;
  /** Project Spotlight only. Carries the visual media stage state. */
  readonly projectMedia?: FoleonReaderProjectMedia;
  /** Project Spotlight only. Optional caption-line project label
   *  (`relatedProjectName ?? relatedProjectNumber`) when distinct from
   *  the title. */
  readonly projectLabel?: string;
  /** Project Spotlight only. Visible launch affordance label. */
  readonly ctaLabel?: string;
  /** Project Spotlight only. Cadence chip label
   *  (`record.cadence ?? 'Monthly feature'`). */
  readonly cadenceLabel?: string;
  /** Company Pulse only. Spotlight + Leadership leave this `undefined`. */
  readonly briefingLead?: FoleonReaderBriefingLead;
  /** Company Pulse only. Empty array in ready state (no fabricated digest items). */
  readonly briefingDigest?: readonly FoleonReaderBriefingItem[];
  /** Company Pulse only. Static taxonomy in both states. */
  readonly categoryChips?: readonly FoleonReaderCategoryChip[];
  /** Company Pulse preview only. Ready state leaves this `undefined`. */
  readonly pulseTimeline?: readonly FoleonReaderPulseTimelineEntry[];
  /** Company Pulse only. Preview placeholder or ready record-backed media. */
  readonly pulseMedia?: FoleonReaderPulseMedia;
  /** Leadership Message only. Spotlight + Pulse leave this `undefined`. */
  readonly leadershipMessage?: FoleonReaderLeadershipMessage;
  /**
   * Article-card view model representing the lane's primary article launch
   * surface. Always populated for governed lanes (Spotlight / Pulse /
   * Leadership) in both preview and ready states. Layouts that wire the
   * shared full-window viewer (Prompt 04B and later) consume this card and
   * call `useFoleonFullWindowViewer().openViewer(card.target)` from a
   * launch control. Disabled targets carry an explicit `target.disabledReason`.
   */
  readonly primaryArticle?: FoleonArticleCardViewModel;
}

// ---------------------------------------------------------------------------
// Layout key mapper — typed and exhaustive
// ---------------------------------------------------------------------------

const LAYOUT_KEY_BY_READER_KEY: Readonly<Record<FoleonReaderKey, FoleonReaderLayoutKey>> = {
  'project-spotlight': 'projectSpotlight',
  'company-pulse': 'companyPulse',
  'leadership-message': 'leadershipMessage',
};

/**
 * Resolve the typed `FoleonReaderLayoutKey` for a reader config.
 *
 * Returns `null` only when the reader key is not one of the three governed
 * lanes (defensive — `FoleonReaderModuleConfig.readerKey` is already
 * narrowed by the type system).
 */
export function resolveFoleonReaderLayoutKey(
  config: FoleonReaderModuleConfig,
): FoleonReaderLayoutKey | null {
  return LAYOUT_KEY_BY_READER_KEY[config.readerKey] ?? null;
}

// ---------------------------------------------------------------------------
// Per-lane labels — the same labels FoleonReaderModule applied previously,
// centralized so adapters can use them.
// ---------------------------------------------------------------------------

interface LaneLabels {
  readonly eyebrow: string;
  readonly freshnessLabel: string;
  readonly freshnessFallback: string;
}

const LANE_LABELS: Readonly<Record<FoleonReaderLayoutKey, LaneLabels>> = {
  projectSpotlight: {
    eyebrow: 'Project Spotlight',
    freshnessLabel: 'Featured',
    freshnessFallback: 'This month',
  },
  companyPulse: {
    eyebrow: 'Company Pulse',
    freshnessLabel: 'Updated',
    freshnessFallback: 'Current edition',
  },
  leadershipMessage: {
    eyebrow: 'Leadership Message Reader',
    freshnessLabel: 'Executive update',
    freshnessFallback: 'Leadership edition',
  },
};

/**
 * Pick the freshness source field per lane. Project Spotlight prefers
 * `issueDate` over `publishedOn`; Company Pulse and Leadership Message
 * prefer `lastEditorialUpdate` over `publishedOn`. Mirrors the rule
 * previously inlined in `FoleonReaderModule`.
 */
function pickFreshnessRaw(lane: FoleonReaderLayoutKey, record: FoleonContentRecord): string | undefined {
  if (lane === 'projectSpotlight') {
    return record.issueDate ?? record.publishedOn;
  }
  return record.lastEditorialUpdate ?? record.publishedOn;
}

function formatFreshnessDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Per-lane preview content — mirrors the previous tone-based copy in
// FoleonReaderPreview, restated against the FoleonReaderLayoutKey naming.
// ---------------------------------------------------------------------------

interface LanePreviewCopy {
  readonly title: string;
  readonly description: string;
  readonly statusLabel: string;
  readonly cadenceLabel: string;
  readonly featureTitle: string;
  readonly featureCopy: string;
  readonly governanceNote: string;
  readonly supportCards: ReadonlyArray<readonly [string, string]>;
}

const LANE_PREVIEW_COPY: Readonly<Record<FoleonReaderLayoutKey, LanePreviewCopy>> = {
  projectSpotlight: {
    title: "This Month's Project Spotlight",
    description:
      "A visual project feature will appear here once this month's Foleon spotlight is published.",
    statusLabel: 'Featured this month',
    cadenceLabel: 'Monthly feature',
    featureTitle: 'Featured project profile placeholder',
    featureCopy:
      'A polished project story area will introduce the active edition, project context, and editorial framing once live Foleon content is connected.',
    governanceNote: 'Archive group required for governance',
    supportCards: [
      ['Project context', 'Sample project metadata, team framing, and market context will appear here.'],
      ['Edition status', 'Monthly active-edition governance keeps one spotlight current at a time.'],
      ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
    ],
  },
  companyPulse: {
    title: 'Company Pulse',
    description:
      'Preview how HB Central introduces the current Company Pulse edition before a live Foleon publication is selected.',
    statusLabel: 'Current edition',
    cadenceLabel: 'Current edition',
    featureTitle: 'Company update edition placeholder',
    featureCopy:
      'A compact publication area will summarize the active edition, latest update cadence, and operational context once live Foleon content is connected.',
    governanceNote: 'Last editorial update required for freshness',
    supportCards: [
      ['Company updates', 'News, events, recognition, and operational updates will collect here.'],
      ['Latest edition', 'The newest active Company Pulse edition will carry the latest update label.'],
      ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
    ],
  },
  leadershipMessage: {
    title: 'Leadership Message reader',
    description:
      'This sample structure previews the executive communications lane before a governed Leadership Message edition is published.',
    statusLabel: 'Executive message',
    cadenceLabel: 'Leadership',
    featureTitle: 'Executive message edition placeholder',
    featureCopy:
      'A refined leadership communication area will introduce the active executive message, key context, and publication framing once live Foleon content is connected.',
    governanceNote: 'Leadership content type required for alignment',
    supportCards: [
      ['Executive context', 'Leadership framing, message intent, and companywide relevance will appear here.'],
      ['Message status', 'Active-edition governance keeps the current leadership message clear and intentional.'],
      ['Archive posture', 'Archive filtering will appear when live lane archive behavior is connected.'],
    ],
  },
};

// ---------------------------------------------------------------------------
// Adapters — the only sanctioned source of view models for the module.
// ---------------------------------------------------------------------------

export interface ReadyAdapterContext {
  readonly resolution: Extract<FoleonReaderResolution, { readonly kind: 'ready' }>;
  /** Whether the layout should mount the iframe (desktop, or mobile after activation). */
  readonly shouldMountIframe: boolean;
  /** Whether the layout should render the mobile collapsed-reader gate card. */
  readonly mobileGateActive: boolean;
  /** Click handler for "Open reader" (mobile activation). */
  readonly onActivateMobileReader: () => void;
  /** Click handler for "Open full archive". */
  readonly onOpenArchive: () => void;
}

export function createPreviewFoleonReaderViewModel(
  config: FoleonReaderModuleConfig,
): FoleonReaderViewModel {
  const lane = LAYOUT_KEY_BY_READER_KEY[config.readerKey];
  const labels = LANE_LABELS[lane];
  const preview = LANE_PREVIEW_COPY[lane];
  const projectFacts: FoleonReaderProjectFacts | undefined =
    lane === 'projectSpotlight'
      ? {
          client: 'Sample client',
          location: 'Sample location',
          market: 'Sample market',
          team: 'Sample team',
          milestone: 'Sample milestone',
          arePlaceholders: true,
        }
      : undefined;
  const featureCallout: FoleonReaderFeatureCallout | undefined =
    lane === 'projectSpotlight'
      ? {
          heading: "Why we're featuring it",
          body: 'Sample editorial framing — a one- to two-sentence narrative explaining the project\'s significance will appear here when a live Project Spotlight edition is published.',
        }
      : undefined;
  const projectMedia: FoleonReaderProjectMedia | undefined =
    lane === 'projectSpotlight'
      ? {
          primaryImageUrl: undefined,
          thumbnailUrl: undefined,
          hasRecordMedia: false,
          isPlaceholder: true,
          accessibleLabel: undefined,
        }
      : undefined;
  const briefingLead: FoleonReaderBriefingLead | undefined =
    lane === 'companyPulse'
      ? {
          title: 'Sample latest update',
          body: 'A live Company Pulse update will summarize the latest companywide editorial here when the next edition is published.',
          category: 'News',
          dateline: 'Sample dateline',
          isPlaceholder: true,
        }
      : undefined;
  const briefingDigest: readonly FoleonReaderBriefingItem[] | undefined =
    lane === 'companyPulse'
      ? PULSE_PREVIEW_DIGEST
      : undefined;
  const categoryChips: readonly FoleonReaderCategoryChip[] | undefined =
    lane === 'companyPulse' ? PULSE_CATEGORY_CHIPS : undefined;
  const pulseTimeline: readonly FoleonReaderPulseTimelineEntry[] | undefined =
    lane === 'companyPulse' ? PULSE_PREVIEW_TIMELINE : undefined;
  const pulseMedia: FoleonReaderPulseMedia | undefined =
    lane === 'companyPulse'
      ? {
          primaryImageUrl: undefined,
          thumbnailUrl: undefined,
          hasRecordMedia: false,
          isPlaceholder: true,
          accessibleLabel: undefined,
        }
      : undefined;
  const leadershipMessage: FoleonReaderLeadershipMessage | undefined =
    lane === 'leadershipMessage'
      ? {
          byline: 'Sample executive byline',
          role: 'Sample role',
          pullQuote:
            'Sample pull quote — a short, weighted statement framing the executive message will appear here when a live edition is published.',
          messageBody:
            'Sample message body — the focused leadership communication will appear here once a live Leadership Message edition is connected.',
          contextNotes: [
            { id: 'audience', label: 'Audience', value: 'Sample audience' },
            { id: 'cadence', label: 'Cadence', value: 'Leadership' },
          ],
          isPlaceholder: true,
        }
      : undefined;

  return {
    lane,
    state: 'preview',
    readerKey: config.readerKey,
    contentTypeKey: config.contentTypeKey,
    placementKey: config.placementKey,
    title: preview.title,
    summary: preview.description,
    eyebrow: labels.eyebrow,
    previewLabel: lane === 'leadershipMessage' ? 'Preview layout' : 'Preview',
    freshnessLabel: labels.freshnessLabel,
    freshnessValue: labels.freshnessFallback,
    audience: 'Companywide',
    archiveGroup: 'Archive coming soon',
    chips: [
      { id: 'cadence', label: preview.cadenceLabel, tone: 'accent' },
      { id: 'status', label: preview.statusLabel, tone: 'accent' },
      { id: 'content-coming-soon', label: 'Content coming soon', tone: 'neutral' },
      { id: 'edition-pending', label: 'Active edition pending', tone: 'neutral' },
    ],
    facts: [
      { id: 'feature-title', label: preview.featureTitle, value: '' },
      { id: 'cadence', label: 'Cadence', value: preview.cadenceLabel },
      { id: 'status', label: 'Status', value: preview.statusLabel },
    ],
    supportItems: preview.supportCards.map(([title, body], index) => ({
      id: `support-${index}`,
      title,
      body,
    })),
    governanceNotes: [
      'Reader appears when an active edition is published',
      preview.governanceNote,
      'Preview contains no live reader controls',
    ],
    statusNotes: [
      'Archive filtering will appear when live content is connected.',
      'No Foleon iframe or production content telemetry is emitted for this preview.',
    ],
    actions: [],
    warnings: [],
    archiveNote: undefined,
    titleElementId: `${config.readerKey}-preview-title`,
    projectFacts,
    featureCallout,
    briefingLead,
    briefingDigest,
    categoryChips,
    pulseTimeline,
    pulseMedia,
    leadershipMessage,
    projectMedia,
    projectLabel: undefined,
    ctaLabel: lane === 'projectSpotlight' ? 'View project spotlight' : undefined,
    cadenceLabel: lane === 'projectSpotlight' ? 'Monthly feature' : undefined,
    primaryArticle: createPreviewArticleCard(config, lane, preview),
  };
}

function createPreviewArticleCard(
  config: FoleonReaderModuleConfig,
  lane: FoleonReaderLayoutKey,
  preview: LanePreviewCopy,
): FoleonArticleCardViewModel {
  return {
    id: `${config.readerKey}-preview-card`,
    title: preview.title,
    summary: preview.description,
    eyebrow: LANE_LABELS[lane].eyebrow,
    category: preview.cadenceLabel,
    dateline: preview.statusLabel,
    previewOnly: true,
    target: createPreviewFoleonViewerTarget(config),
  };
}

// Static Company Pulse taxonomy — describes the lane's editorial scope.
// Used in both preview and ready state because chips are not record-derived.
const PULSE_CATEGORY_CHIPS: readonly FoleonReaderCategoryChip[] = [
  { id: 'news', label: 'News' },
  { id: 'events', label: 'Events' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'operations', label: 'Operations' },
];

// Honest preview placeholders — clearly labeled when rendered next to the
// preview banner. Each item names a conceptual category so the preview
// shows the briefing's editorial coverage at a glance.
const PULSE_PREVIEW_DIGEST: readonly FoleonReaderBriefingItem[] = [
  {
    id: 'preview-news',
    title: 'Sample news update',
    summary: 'A short companywide news brief will appear here when an edition is published.',
    category: 'News',
    dateline: 'Sample dateline',
  },
  {
    id: 'preview-events',
    title: 'Sample upcoming event',
    summary: 'Highlights and registration affordances for an upcoming event will appear here.',
    category: 'Events',
    dateline: 'Sample dateline',
  },
  {
    id: 'preview-recognition',
    title: 'Sample recognition note',
    summary: 'Recognition for a person, team, or milestone will appear here.',
    category: 'Recognition',
    dateline: 'Sample dateline',
  },
  {
    id: 'preview-operations',
    title: 'Sample operations update',
    summary: 'A practical operations or process update will appear here.',
    category: 'Operations',
    dateline: 'Sample dateline',
  },
];

const PULSE_PREVIEW_TIMELINE: readonly FoleonReaderPulseTimelineEntry[] = [
  { id: 'this-week', label: 'This week', value: 'Sample dateline' },
  { id: 'last-week', label: 'Last week', value: 'Sample dateline' },
  { id: 'two-weeks', label: 'Two weeks ago', value: 'Sample dateline' },
];

function buildReadyPulseMedia(record: FoleonContentRecord): FoleonReaderPulseMedia {
  const hero = record.heroImageUrl?.trim();
  const thumb = record.thumbnailUrl?.trim();
  const primary = (hero && hero.length > 0 ? hero : undefined) ?? (thumb && thumb.length > 0 ? thumb : undefined);
  const thumbnail =
    thumb && thumb.length > 0 && thumb !== primary ? thumb : undefined;
  const hasRecordMedia = primary !== undefined;
  const accessibleLabel = hasRecordMedia
    ? `Company Pulse cover image for ${record.title}`
    : undefined;
  return {
    primaryImageUrl: primary,
    thumbnailUrl: thumbnail,
    hasRecordMedia,
    isPlaceholder: false,
    accessibleLabel,
  };
}

// ---------------------------------------------------------------------------
// Leadership Message ready-state derivations — sourced only from
// FoleonContentRecord. No invented data.
// ---------------------------------------------------------------------------

function buildReadyProjectMedia(record: FoleonContentRecord): FoleonReaderProjectMedia {
  const hero = record.heroImageUrl?.trim();
  const thumb = record.thumbnailUrl?.trim();
  const primary = (hero && hero.length > 0 ? hero : undefined) ?? (thumb && thumb.length > 0 ? thumb : undefined);
  // Only surface `thumbnailUrl` separately when it is meaningfully distinct
  // from the primary image (i.e. hero is the primary and thumb differs).
  const thumbnail =
    thumb && thumb.length > 0 && thumb !== primary ? thumb : undefined;
  const hasRecordMedia = primary !== undefined;
  // Generated fallback accessibility label — NOT editorial alt text.
  // Schema does not currently carry editorial alt; PS-03 follow-up.
  const accessibleLabel = hasRecordMedia
    ? `Project Spotlight image for ${record.title}`
    : undefined;
  return {
    primaryImageUrl: primary,
    thumbnailUrl: thumbnail,
    hasRecordMedia,
    isPlaceholder: false,
    accessibleLabel,
  };
}

function buildProjectLabel(record: FoleonContentRecord): string | undefined {
  const candidate = record.relatedProjectName ?? record.relatedProjectNumber;
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  if (trimmed.length === 0) return undefined;
  // Suppress when the label duplicates the title (case-insensitive).
  if (trimmed.toLowerCase() === record.title.trim().toLowerCase()) return undefined;
  return trimmed;
}

function deriveLeadershipPullQuote(summary: string): string | undefined {
  const trimmed = summary.trim();
  if (trimmed.length === 0) return undefined;
  // Use the first sentence (bounded by `.`/`!`/`?`) up to ~180 chars as a
  // pull quote. Keeps things short and editorial without invention.
  const match = trimmed.match(/^[^.!?]*[.!?]/);
  const candidate = (match ? match[0] : trimmed).trim();
  if (candidate.length === 0) return undefined;
  return candidate.length > 180 ? `${candidate.slice(0, 180).trimEnd()}…` : candidate;
}

function deriveLeadershipContextNotes(
  record: FoleonContentRecord,
): readonly { readonly id: string; readonly label: string; readonly value: string }[] {
  const notes: { readonly id: string; readonly label: string; readonly value: string }[] = [];
  notes.push({
    id: 'audience',
    label: 'Audience',
    value: record.primaryAudience ?? 'Companywide',
  });
  notes.push({
    id: 'archive-group',
    label: 'Archive group',
    value: record.archiveGroup ?? 'Archive coming soon',
  });
  return notes;
}

export function createReadyFoleonReaderViewModel(
  config: FoleonReaderModuleConfig,
  context: ReadyAdapterContext,
): FoleonReaderViewModel {
  const lane = LAYOUT_KEY_BY_READER_KEY[config.readerKey];
  const labels = LANE_LABELS[lane];
  const { resolution, shouldMountIframe, mobileGateActive, onActivateMobileReader, onOpenArchive } = context;
  const record = resolution.record;
  const projectFacts: FoleonReaderProjectFacts | undefined =
    lane === 'projectSpotlight'
      ? {
          // Ready-state values are sourced ONLY from FoleonContentRecord.
          // Fields the schema does not carry (client, team) are emitted as
          // `undefined` and rendered by the layout as "Not listed" or
          // omitted. The adapter never invents data for ready state.
          client: record.relatedProjectName ?? record.relatedProjectNumber,
          location: record.region,
          market: record.sector,
          team: undefined,
          milestone: formatFreshnessDate(record.issueDate ?? record.publishedOn) ?? undefined,
          arePlaceholders: false,
        }
      : undefined;
  const featureCallout: FoleonReaderFeatureCallout | undefined =
    lane === 'projectSpotlight'
      ? {
          heading: "Why we're featuring it",
          body:
            record.summary && record.summary.trim().length > 0
              ? record.summary
              : 'A project summary has not been provided for this spotlight.',
        }
      : undefined;
  const projectMedia: FoleonReaderProjectMedia | undefined =
    lane === 'projectSpotlight'
      ? buildReadyProjectMedia(record)
      : undefined;
  const projectLabel: string | undefined =
    lane === 'projectSpotlight'
      ? buildProjectLabel(record)
      : undefined;
  const cadenceLabel: string | undefined =
    lane === 'projectSpotlight'
      ? record.cadence ?? 'Monthly feature'
      : undefined;
  const briefingLead: FoleonReaderBriefingLead | undefined =
    lane === 'companyPulse'
      ? {
          // Lead is sourced ONLY from the active record. No invented data.
          title: record.title,
          body:
            record.summary && record.summary.trim().length > 0
              ? record.summary
              : 'Editorial summary for this Company Pulse edition has not been provided.',
          category: record.contentTypeKey,
          dateline:
            formatFreshnessDate(record.lastEditorialUpdate ?? record.publishedOn) ?? undefined,
          isPlaceholder: false,
        }
      : undefined;
  // Ready-state digest is intentionally empty — the registry currently
  // carries one active record per lane and the adapter does not fabricate
  // secondary updates. Previous editions live in the archive (the layout
  // surfaces an "Open archive" affordance to reach them).
  const briefingDigest: readonly FoleonReaderBriefingItem[] | undefined =
    lane === 'companyPulse' ? [] : undefined;
  const categoryChips: readonly FoleonReaderCategoryChip[] | undefined =
    lane === 'companyPulse' ? PULSE_CATEGORY_CHIPS : undefined;
  // Timeline strip is preview-only — no live multi-edition source.
  const pulseTimeline: readonly FoleonReaderPulseTimelineEntry[] | undefined = undefined;
  const pulseMedia: FoleonReaderPulseMedia | undefined =
    lane === 'companyPulse'
      ? buildReadyPulseMedia(record)
      : undefined;
  const leadershipMessage: FoleonReaderLeadershipMessage | undefined =
    lane === 'leadershipMessage'
      ? {
          // FoleonContentRecord schema does not currently carry byline,
          // role, or portrait fields. The layout shows honest fallbacks
          // or omits rows when these are absent — the adapter never
          // invents executive identity.
          byline: undefined,
          role: undefined,
          pullQuote:
            record.summary && record.summary.trim().length > 0
              ? deriveLeadershipPullQuote(record.summary)
              : undefined,
          messageBody:
            record.summary && record.summary.trim().length > 0
              ? record.summary
              : 'Editorial summary for this Leadership Message has not been provided.',
          contextNotes: deriveLeadershipContextNotes(record),
          isPlaceholder: false,
        }
      : undefined;

  const freshnessFormatted = formatFreshnessDate(pickFreshnessRaw(lane, record));
  const freshnessValue = freshnessFormatted ?? labels.freshnessFallback;
  const audience = record.primaryAudience ?? 'Companywide';
  const archiveGroup = record.archiveGroup ?? 'Archive coming soon';

  const actions: FoleonReaderAction[] = [];
  if (mobileGateActive) {
    actions.push({
      id: 'open-mobile-reader',
      label: 'Open reader',
      variant: 'primary',
      onClick: onActivateMobileReader,
    });
  }
  actions.push({
    id: 'open-archive',
    label: 'Open full archive',
    variant: 'secondary',
    onClick: onOpenArchive,
  });

  return {
    lane,
    state: 'ready',
    readerKey: config.readerKey,
    contentTypeKey: config.contentTypeKey,
    placementKey: config.placementKey,
    title: record.title,
    summary: record.summary,
    eyebrow: labels.eyebrow,
    previewLabel: undefined,
    freshnessLabel: labels.freshnessLabel,
    freshnessValue,
    audience,
    archiveGroup,
    chips: [],
    facts: [
      { id: 'freshness', label: labels.freshnessLabel, value: freshnessValue },
      { id: 'audience', label: 'Audience', value: audience },
      { id: 'archive-group', label: 'Archive group', value: archiveGroup },
    ],
    supportItems: [],
    governanceNotes: [],
    statusNotes: [],
    actions,
    iframe: {
      title: `${config.title}: ${record.title}`,
      visible: shouldMountIframe,
    },
    mobileGate: mobileGateActive
      ? {
          headline: 'Reader ready',
          body: 'Open the publication when you are ready to load the Foleon iframe.',
        }
      : undefined,
    warnings:
      resolution.warnings.length > 0
        ? ['Reader resolved with admin warnings for the Manager workflow.']
        : [],
    archiveNote: 'The archive opens previous Company Pulse editions.',
    titleElementId: `${config.readerKey}-reader-title`,
    projectFacts,
    featureCallout,
    briefingLead,
    briefingDigest,
    categoryChips,
    pulseTimeline,
    pulseMedia,
    leadershipMessage,
    projectMedia,
    projectLabel,
    ctaLabel: lane === 'projectSpotlight' ? 'View project spotlight' : undefined,
    cadenceLabel,
    primaryArticle: {
      id: `${config.readerKey}-active-${record.id}`,
      title: record.title,
      summary: record.summary,
      eyebrow: labels.eyebrow,
      category: record.contentTypeKey,
      dateline: freshnessValue,
      previewOnly: false,
      target: createReadyFoleonViewerTarget({
        config,
        record,
        embedUrl: resolution.embedUrl,
      }),
    },
  };
}
