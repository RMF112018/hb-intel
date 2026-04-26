import type { FoleonContentRecord, FoleonReaderKey } from '../types/foleon-content.types.js';
import type { FoleonReaderResolution } from '../services/FoleonReaderContentService.js';
import type { FoleonReaderModuleConfig } from './readerConfigs.js';

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
    eyebrow: 'Project Spotlight Reader',
    freshnessLabel: 'Monthly status',
    freshnessFallback: 'Monthly edition',
  },
  companyPulse: {
    eyebrow: 'Company Pulse Reader',
    freshnessLabel: 'Latest update',
    freshnessFallback: 'Latest update',
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
    title: 'Project Spotlight reader',
    description:
      'This sample structure previews the monthly active project profile lane before a governed Project Spotlight edition is published.',
    statusLabel: 'Monthly project profile',
    cadenceLabel: 'Monthly',
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
    title: 'Company Pulse reader',
    description:
      'This sample structure previews the frequent company update lane for news, events, recognition, and operations before an active Company Pulse edition is published.',
    statusLabel: 'Latest company update',
    cadenceLabel: 'Frequent',
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
          heading: 'Why this project matters',
          body: 'Sample editorial framing — a one- to two-sentence narrative explaining the project\'s significance will appear here when a live Project Spotlight edition is published.',
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
    previewLabel: 'Preview layout',
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
  };
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
          heading: 'Why this project matters',
          body:
            record.summary && record.summary.trim().length > 0
              ? record.summary
              : 'Editorial framing for this Project Spotlight edition has not been provided.',
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
    archiveNote: 'Lane archive filtering comes in a later workflow.',
    titleElementId: `${config.readerKey}-reader-title`,
    projectFacts,
    featureCallout,
  };
}
