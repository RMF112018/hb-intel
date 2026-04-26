import type { FoleonRuntimeReadiness } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonReaderKey,
} from '../../types/foleon-management.types.js';
import {
  buildReaderLaneWarnings,
  isPublicReadyReaderRecord,
  readerLaneForContent,
  readerLaneForPlacementKey,
  readerLaneLabel,
  type FoleonReaderLane,
} from './manageMutationUtils.js';

const LANE_ORDER: ReadonlyArray<FoleonReaderLane> = ['project-spotlight', 'company-pulse', 'leadership-message'];

export interface FoleonLaneViewModel {
  readonly lane: FoleonReaderLane;
  readonly label: string;
  readonly readerKey: FoleonReaderKey;
  readonly placementKey: string;
  readonly state: 'Live' | 'Preview' | 'Blocked' | 'Empty' | 'Config Incomplete';
  readonly activeContent?: FoleonManagedContent;
  readonly stagedContent?: FoleonManagedContent;
  readonly placement?: FoleonPlacement;
  readonly nextAction: string;
  readonly warnings: ReadonlyArray<string>;
  readonly checklist: ReadonlyArray<PublishChecklistItem>;
}

export interface PublishChecklistItem {
  readonly label: string;
  readonly status: 'pass' | 'warning' | 'blocked';
  readonly detail: string;
}

const LANES: ReadonlyArray<{
  readonly lane: FoleonReaderLane;
  readonly readerKey: FoleonReaderKey;
  readonly placementKey: string;
}> = [
  { lane: 'project-spotlight', readerKey: 'project-spotlight', placementKey: 'Project Spotlight Active' },
  { lane: 'company-pulse', readerKey: 'company-pulse', placementKey: 'Company Pulse Active' },
  { lane: 'leadership-message', readerKey: 'leadership-message', placementKey: 'Leadership Message Active' },
];

export function buildFoleonLaneViewModels(args: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly readiness?: FoleonRuntimeReadiness;
  readonly hasLoadedReadPath: boolean;
}): ReadonlyArray<FoleonLaneViewModel> {
  return LANES.map((laneDef) => buildLaneViewModel(laneDef, args));
}

export function sortManagedContentForHomepage(
  content: ReadonlyArray<FoleonManagedContent>,
): ReadonlyArray<FoleonManagedContent> {
  return [...content].sort((left, right) => scoreRecord(right) - scoreRecord(left));
}

function buildLaneViewModel(
  laneDef: typeof LANES[number],
  args: {
    readonly content: ReadonlyArray<FoleonManagedContent>;
    readonly placements: ReadonlyArray<FoleonPlacement>;
    readonly readiness?: FoleonRuntimeReadiness;
    readonly hasLoadedReadPath: boolean;
  },
): FoleonLaneViewModel {
  const laneContent = args.content.filter((record) => readerLaneForContent(record) === laneDef.lane);
  const activeContent = laneContent.find((record) => record.activeEdition === true) ?? laneContent.find(isPublicReadyReaderRecord);
  const stagedContent = laneContent.find((record) => record.id !== activeContent?.id && record.publishStatus !== 'Published');
  const placement = args.placements.find((entry) => readerLaneForPlacementKey(entry.placementKey) === laneDef.lane);
  const readConfigReady = Boolean(
    args.hasLoadedReadPath &&
      (args.readiness?.listBindingsReady ?? true) &&
      (args.readiness?.readPathReady ?? true),
  );
  const warnings = activeContent
    ? buildReaderLaneWarnings({
        draft: {
          etag: activeContent.etag,
          title: activeContent.title,
          foleonDocId: activeContent.foleonDocId,
          contentTypeKey: activeContent.contentTypeKey,
          readerKey: activeContent.readerKey,
          cadence: activeContent.cadence,
          homepageSlot: activeContent.homepageSlot,
          archiveGroup: activeContent.archiveGroup,
          activeEdition: activeContent.activeEdition,
          primaryAudience: activeContent.primaryAudience,
          lastEditorialUpdate: activeContent.lastEditorialUpdate,
          publishStatus: activeContent.publishStatus,
          isVisible: activeContent.isVisible,
          isHomepageEligible: activeContent.isHomepageEligible,
          publishedUrl: activeContent.publishedUrl,
          embedUrl: activeContent.embedUrl,
          thumbnailUrl: activeContent.thumbnailUrl,
          summary: activeContent.summary,
          region: activeContent.region,
          sector: activeContent.sector,
          openMode: activeContent.openMode ?? 'Inline Reader',
          allowEmbed: activeContent.allowEmbed ?? true,
          requiresExternalOpen: activeContent.requiresExternalOpen ?? false,
          adminNotes: activeContent.adminNotes,
        },
        record: activeContent,
        allContent: args.content,
        placements: args.placements,
      })
    : [];
  const placementWarnings = placement?.blockingReasons ?? [];
  const allWarnings = Array.from(new Set([...activeContent?.blockingReasons ?? [], ...warnings, ...placementWarnings]));
  const state = resolveLaneState({
    readConfigReady,
    activeContent,
    stagedContent,
    placement,
    warnings: allWarnings,
  });
  return {
    lane: laneDef.lane,
    label: readerLaneLabel(laneDef.lane),
    readerKey: laneDef.readerKey,
    placementKey: laneDef.placementKey,
    state,
    activeContent,
    stagedContent,
    placement,
    nextAction: resolveNextAction(state, activeContent, placement, allWarnings),
    warnings: allWarnings,
    checklist: buildPublishChecklist({
      record: activeContent,
      placement,
      readiness: args.readiness,
      warnings: allWarnings,
    }),
  };
}

function resolveLaneState(args: {
  readonly readConfigReady: boolean;
  readonly activeContent?: FoleonManagedContent;
  readonly stagedContent?: FoleonManagedContent;
  readonly placement?: FoleonPlacement;
  readonly warnings: ReadonlyArray<string>;
}): FoleonLaneViewModel['state'] {
  if (!args.readConfigReady) return 'Config Incomplete';
  if (!args.activeContent && !args.stagedContent) return 'Empty';
  if (args.warnings.length > 0 || args.activeContent?.validationStatus === 'blocked' || args.placement?.validationStatus === 'blocked') {
    return 'Blocked';
  }
  if (args.activeContent && args.placement?.isActive && isPublicReadyReaderRecord(args.activeContent)) return 'Live';
  return 'Preview';
}

function resolveNextAction(
  state: FoleonLaneViewModel['state'],
  activeContent: FoleonManagedContent | undefined,
  placement: FoleonPlacement | undefined,
  warnings: ReadonlyArray<string>,
): string {
  if (state === 'Config Incomplete') return 'Confirm read path and list bindings.';
  if (state === 'Empty') return 'Sync or create lane content.';
  if (warnings.length > 0) return warnings[0] ?? 'Resolve lane validation warnings.';
  if (!activeContent?.publishedUrl && !activeContent?.embedUrl) return 'Add a production Foleon URL.';
  if (!placement?.isActive) return 'Assign an active homepage placement.';
  if (state === 'Preview') return 'Validate and publish when approved.';
  return 'Monitor display window and validation.';
}

export function buildPublishChecklist(args: {
  readonly record?: FoleonManagedContent;
  readonly placement?: FoleonPlacement;
  readonly readiness?: FoleonRuntimeReadiness;
  readonly warnings: ReadonlyArray<string>;
}): ReadonlyArray<PublishChecklistItem> {
  const record = args.record;
  return [
    item('Foleon doc/publication ID present', Boolean(record?.foleonDocId), record ? 'Document identifier is configured.' : 'No active lane record.'),
    item('Published or embed URL present', Boolean(record?.publishedUrl || record?.embedUrl), 'Production reader URL is required before homepage promotion.'),
    item('Visibility enabled', Boolean(record?.isVisible), 'Content must be visible.'),
    item('Homepage eligible', Boolean(record?.isHomepageEligible), 'Content must be marked homepage eligible.'),
    item('Publish status valid', record?.publishStatus === 'Published', `Current status: ${record?.publishStatus ?? 'Missing'}.`),
    item('Active edition uniqueness', !args.warnings.some((warning) => warning.includes('More than one active')), 'Only one active edition should exist per lane.'),
    item(
      'Placement assigned',
      Boolean(args.placement?.isActive),
      args.placement
        ? (args.placement.isActive ? 'Homepage placement is active.' : 'Homepage placement is inactive.')
        : 'No homepage placement assigned.',
    ),
    item('Read path ready', Boolean(args.readiness?.readPathReady || record), 'Manager has read content and placement data.'),
    item('Write path ready', args.readiness?.writePathReady === true, 'Required for save, validate, publish, suppress, and placement mutations.'),
    item('Route authorization proven', args.readiness?.backendRouteAuthorizationReady === true, 'Backend route authorization must be proven before writes are considered ready.'),
  ];
}

function item(label: string, pass: boolean, detail: string): PublishChecklistItem {
  return { label, status: pass ? 'pass' : 'blocked', detail };
}

/** UI label: internal state remains `Config Incomplete`. */
export function displayLaneState(state: FoleonLaneViewModel['state']): string {
  return state === 'Config Incomplete' ? 'Needs setup' : state;
}

export function laneStatePriority(state: FoleonLaneViewModel['state']): number {
  switch (state) {
    case 'Blocked':
      return 0;
    case 'Config Incomplete':
      return 1;
    case 'Preview':
      return 2;
    case 'Empty':
      return 3;
    case 'Live':
      return 4;
    default:
      return 5;
  }
}

export function pickDefaultLaneSelection(
  lanes: ReadonlyArray<FoleonLaneViewModel>,
): { readonly lane: FoleonReaderLane; readonly contentId: string | null } {
  const ordered = [...lanes].sort((left, right) => {
    const byState = laneStatePriority(left.state) - laneStatePriority(right.state);
    if (byState !== 0) return byState;
    return LANE_ORDER.indexOf(left.lane) - LANE_ORDER.indexOf(right.lane);
  });
  const first = ordered[0];
  if (!first) return { lane: 'project-spotlight', contentId: null };
  return {
    lane: first.lane,
    contentId: first.activeContent?.id ?? first.stagedContent?.id ?? null,
  };
}

export function summarizePublishReadinessForCard(checklist: ReadonlyArray<PublishChecklistItem>): string {
  const pass = checklist.filter((entry) => entry.status === 'pass').length;
  const total = checklist.length;
  return `${pass} of ${total} publish checks passing`;
}

export function placementStatusPlain(placement: FoleonPlacement | undefined): string {
  if (!placement) return 'Not assigned';
  if (placement.isActive) return 'Active on homepage';
  return 'Inactive on homepage';
}

function scoreRecord(record: FoleonManagedContent): number {
  let score = 0;
  if (record.activeEdition) score += 100;
  if (record.isHomepageEligible) score += 50;
  if (readerLaneForContent(record)) score += 40;
  if (record.validationStatus === 'blocked') score += 30;
  if (record.publishStatus !== 'Published') score += 20;
  return score;
}
