import type { FoleonContentRecord, FoleonReaderKey } from '../types/foleon-content.types.js';
import type { FoleonReaderModuleConfig } from './readerConfigs.js';
import type { FoleonReaderLayoutKey } from './FoleonReaderViewModel.js';

// Local layout-key mapping. Duplicated in `FoleonReaderViewModel.ts` to
// avoid a runtime import cycle between that module and this one (the view
// model now imports adapters from this module). Both copies are governed
// by the typed `FoleonReaderKey` union, so adding a new lane is a
// TypeScript error in both places.
const LAYOUT_KEY_BY_READER_KEY: Readonly<Record<FoleonReaderKey, FoleonReaderLayoutKey>> = {
  'project-spotlight': 'projectSpotlight',
  'company-pulse': 'companyPulse',
  'leadership-message': 'leadershipMessage',
};

function laneFor(config: FoleonReaderModuleConfig): FoleonReaderLayoutKey | null {
  return LAYOUT_KEY_BY_READER_KEY[config.readerKey] ?? null;
}

// ---------------------------------------------------------------------------
// Foleon viewer target model — Phase-04 Wave-01 Prompt-04A
// ---------------------------------------------------------------------------
// `FoleonViewerTarget` is the minimal contract any Foleon article / card
// passes to `openViewer(target)`. The shared full-window viewer mounts
// `FoleonIframeHost` with `target.viewerUrl` under the runtime contract's
// existing origin policy, so this layer adds NO new origin-policy or
// gate-policy surface.
//
// Adapters source URL fields directly from the live `FoleonContentRecord`
// schema. Confirmed mapping (see 04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
// for the explicit mapping table):
//   FoleonViewerTarget.viewerUrl ← record.embedUrl
//   FoleonViewerTarget.url       ← record.publishedUrl
//   canOpen rules                 ← record.embedUrl + allowEmbed + requiresExternalOpen
// No fields are invented; absent record values surface as `disabledReason`.
// ---------------------------------------------------------------------------

export type FoleonViewerSource = 'active-record' | 'archive' | 'preview' | 'manual';

export type FoleonViewerRenderMode = 'iframe' | 'preview';

export type FoleonViewerDisabledReason =
  | 'no-embed-url'
  | 'embed-not-allowed'
  | 'requires-external-open'
  | 'preview-only'
  | 'unknown';

export interface FoleonViewerPreviewContent {
  readonly badge: string;
  readonly title: string;
  readonly summary?: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly notice: string;
  readonly primaryLabel?: string;
  readonly secondaryLabel?: string;
  readonly bullets?: readonly string[];
}

interface FoleonViewerTargetBase {
  readonly id: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly source: FoleonViewerSource;
  readonly title: string;
  readonly summary?: string;
  /** External "view on Foleon" link. Sourced from `FoleonContentRecord.publishedUrl`. */
  readonly url?: string;
  readonly publishedLabel?: string;
  readonly categoryLabel?: string;
}

export interface FoleonIframeViewerTarget extends FoleonViewerTargetBase {
  readonly renderMode: 'iframe';
  /** Iframe-embeddable URL. Sourced from `FoleonContentRecord.embedUrl`. */
  readonly viewerUrl?: string;
  readonly canOpen: boolean;
  readonly disabledReason?: FoleonViewerDisabledReason;
  readonly preview?: undefined;
}

export interface FoleonPreviewViewerTarget extends FoleonViewerTargetBase {
  readonly source: 'preview';
  readonly renderMode: 'preview';
  readonly viewerUrl?: undefined;
  readonly canOpen: true;
  readonly disabledReason?: undefined;
  readonly preview: FoleonViewerPreviewContent;
}

export type FoleonViewerTarget = FoleonIframeViewerTarget | FoleonPreviewViewerTarget;

export interface FoleonArticleCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly eyebrow?: string;
  readonly category?: string;
  readonly dateline?: string;
  readonly previewOnly?: boolean;
  readonly target: FoleonViewerTarget;
}

/**
 * Structured result of `openViewer(target)`. Disabled targets are NEVER
 * a silent no-op — the caller receives the disabled reason so it can
 * surface a tooltip, log telemetry, or fall back to an external link.
 */
export type FoleonViewerOpenResult =
  | { readonly opened: true; readonly target: FoleonViewerTarget }
  | { readonly opened: false; readonly reason: FoleonViewerDisabledReason };

// ---------------------------------------------------------------------------
// Adapters — internal to the package. Public consumers call the
// view-model factories (`createReadyFoleonReaderViewModel`,
// `createPreviewFoleonReaderViewModel`) which carry `primaryArticle`.
// ---------------------------------------------------------------------------

interface ReadyTargetInput {
  readonly config: FoleonReaderModuleConfig;
  readonly record: FoleonContentRecord;
  /** Optional override; defaults to `record.embedUrl`. Lets the orchestrator
   *  thread the resolution-derived embed URL when it differs (today it does
   *  not — but the parameter keeps the contract honest). */
  readonly embedUrl?: string;
}

export function createReadyFoleonViewerTarget(input: ReadyTargetInput): FoleonViewerTarget {
  const { config, record } = input;
  const lane = laneFor(config);
  if (!lane) {
    return {
      id: `${config.readerKey}-active`,
      lane: 'projectSpotlight', // structurally required; never reached for governed lanes
      source: 'active-record',
      renderMode: 'iframe',
      title: record.title,
      canOpen: false,
      disabledReason: 'unknown',
    };
  }
  const embedUrl = input.embedUrl ?? record.embedUrl;
  const disabledReason = computeReadyDisabledReason(record, embedUrl);
  return {
    id: `${config.readerKey}-active-${record.id}`,
    lane,
    source: 'active-record',
    renderMode: 'iframe',
    title: record.title,
    summary: record.summary,
    url: record.publishedUrl,
    viewerUrl: embedUrl,
    publishedLabel: record.lastEditorialUpdate ?? record.publishedOn,
    categoryLabel: record.contentTypeKey,
    canOpen: disabledReason === undefined,
    disabledReason,
  };
}

function computeReadyDisabledReason(
  record: FoleonContentRecord,
  embedUrl: string | undefined,
): FoleonViewerDisabledReason | undefined {
  if (!embedUrl || embedUrl.trim().length === 0) return 'no-embed-url';
  if (!record.allowEmbed) return 'embed-not-allowed';
  if (record.requiresExternalOpen) return 'requires-external-open';
  return undefined;
}

export function createPreviewFoleonViewerTarget(
  config: FoleonReaderModuleConfig,
): FoleonViewerTarget {
  const lane = laneFor(config) ?? 'projectSpotlight';
  return {
    id: `${config.readerKey}-preview`,
    lane,
    source: 'preview',
    title: `${config.title} — Preview`,
    summary: undefined,
    url: undefined,
    viewerUrl: undefined,
    publishedLabel: undefined,
    categoryLabel: undefined,
    renderMode: 'preview',
    canOpen: true,
    disabledReason: undefined,
    preview: createPreviewContent(config, lane),
  };
}

function createPreviewContent(
  config: FoleonReaderModuleConfig,
  lane: FoleonReaderLayoutKey,
): FoleonViewerPreviewContent {
  switch (lane) {
    case 'projectSpotlight':
      return {
        badge: 'Preview',
        title: "This Month's Project Spotlight",
        summary: 'A local preview of the monthly project feature card before a live Foleon edition is configured.',
        lane,
        notice: 'Live Foleon content will open here once the active Project Spotlight record is published and embeddable.',
        primaryLabel: 'Project profile',
        secondaryLabel: 'Monthly feature',
        bullets: ['Hero image area', 'Project facts', 'Editorial summary'],
      };
    case 'companyPulse':
      return {
        badge: 'Preview',
        title: 'Company Pulse Preview',
        summary: 'This preview shows how HB Central introduces the current Company Pulse edition.',
        lane,
        notice: 'When a live edition is selected, this window opens the governed Foleon viewer.',
        primaryLabel: 'Current edition',
        secondaryLabel: 'Foleon publication',
        bullets: ['Current edition', 'Company updates', 'Recognition and events', 'Full Foleon publication'],
      };
    case 'leadershipMessage':
      return {
        badge: 'Preview',
        title: 'Leadership Message Preview',
        summary:
          'Validates the governed executive lane before an active Leadership Message edition is configured.',
        lane,
        notice:
          'When an active edition is selected, this opens the Leadership Message in the governed Foleon viewer.',
        primaryLabel: 'Executive update',
        secondaryLabel: 'Foleon publication',
        bullets: ['Headline and teaser', 'Publication status', 'Full message in Foleon'],
      };
    default:
      return {
        badge: 'Preview',
        title: `${config.title} Preview`,
        summary: 'A local preview of this Foleon reader lane.',
        lane,
        notice: 'Live Foleon content will open here once an active edition is configured.',
      };
  }
}
