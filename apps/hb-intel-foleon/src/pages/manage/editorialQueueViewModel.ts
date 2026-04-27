import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonLaneViewModel } from './manageLaneViewModel.js';
import { isPublicReadyReaderRecord, readerLaneForContent, readerLaneLabel } from './manageMutationUtils.js';
import { formatDisplayWindow } from './feedSlotsViewModel.js';

export type EditorialQueueClassification =
  | 'live'
  | 'scheduled'
  | 'ready'
  | 'unassigned'
  | 'needs-attention'
  | 'archived';

export type EditorialQueueFilterId = 'all' | EditorialQueueClassification;

export interface EditorialQueueRow {
  readonly id: string;
  readonly title: string;
  readonly feedLabel: string;
  readonly statusLabel: string;
  readonly displayWindow: string;
  readonly readinessLabel: string;
  readonly primaryActionLabel: string;
  readonly classifications: ReadonlyArray<EditorialQueueClassification>;
}

export interface EditorialQueueFilterOption {
  readonly id: EditorialQueueFilterId;
  readonly label: string;
  readonly count: number;
}

const ALL_FILTERS: ReadonlyArray<{ readonly id: EditorialQueueFilterId; readonly label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'needs-attention', label: 'Needs attention' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'ready', label: 'Ready' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'live', label: 'Live' },
  { id: 'archived', label: 'Archived' },
];

export function buildEditorialQueueRows(args: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
}): ReadonlyArray<EditorialQueueRow> {
  const now = Date.now();
  return args.content.map((record) => buildRow(record, args.placements, args.lanes, now));
}

function buildRow(
  record: FoleonManagedContent,
  placements: ReadonlyArray<FoleonPlacement>,
  lanes: ReadonlyArray<FoleonLaneViewModel>,
  now: number,
): EditorialQueueRow {
  const lane = readerLaneForContent(record);
  const laneVm = lane ? lanes.find((entry) => entry.lane === lane) : undefined;
  const matchingPlacements = placements.filter((entry) => entry.foleonDocId === record.foleonDocId);
  const activePlacement = matchingPlacements.find((entry) => entry.isActive);

  const classifications = classifyRow({
    record,
    activePlacement,
    matchingPlacements,
    laneVm,
    now,
  });

  const placementWindow =
    activePlacement?.displayFrom || activePlacement?.displayThrough
      ? formatDisplayWindow(activePlacement.displayFrom, activePlacement.displayThrough)
      : null;
  const recordWindow =
    record.displayFrom || record.displayThrough
      ? formatDisplayWindow(record.displayFrom, record.displayThrough)
      : null;

  return {
    id: record.id,
    title: record.title,
    feedLabel: lane ? readerLaneLabel(lane) : record.contentTypeKey || 'Unassigned',
    statusLabel: statusLabelFor(classifications),
    displayWindow: placementWindow ?? recordWindow ?? 'Not scheduled',
    readinessLabel: readinessLabelFor(record, classifications),
    primaryActionLabel: primaryActionLabelFor(classifications),
    classifications,
  };
}

function classifyRow(args: {
  readonly record: FoleonManagedContent;
  readonly activePlacement: FoleonPlacement | undefined;
  readonly matchingPlacements: ReadonlyArray<FoleonPlacement>;
  readonly laneVm: FoleonLaneViewModel | undefined;
  readonly now: number;
}): ReadonlyArray<EditorialQueueClassification> {
  const out: EditorialQueueClassification[] = [];
  const blockedByValidation = args.record.validationStatus === 'blocked' || args.record.blockingReasons.length > 0;
  const laneWarningsForRecord =
    args.laneVm && args.laneVm.activeContent?.id === args.record.id ? args.laneVm.warnings.length > 0 : false;
  if (blockedByValidation || laneWarningsForRecord) out.push('needs-attention');

  const isLive = Boolean(args.activePlacement);
  if (isLive) out.push('live');

  const recordEnd = parseDate(args.record.displayThrough);
  const placementEnd = parseDate(args.activePlacement?.displayThrough);
  const expired =
    (recordEnd != null && recordEnd < args.now) || (placementEnd != null && placementEnd < args.now);
  if (expired && !isLive) out.push('archived');

  const recordStart = parseDate(args.record.displayFrom);
  const placementStart = parseDate(args.matchingPlacements[0]?.displayFrom);
  const futureScheduled =
    (recordStart != null && recordStart > args.now) || (placementStart != null && placementStart > args.now);
  if (futureScheduled && !isLive) out.push('scheduled');

  if (args.matchingPlacements.length === 0) out.push('unassigned');

  if (
    !isLive &&
    !expired &&
    !futureScheduled &&
    !blockedByValidation &&
    isPublicReadyReaderRecord(args.record)
  ) {
    out.push('ready');
  }

  return out;
}

function statusLabelFor(classifications: ReadonlyArray<EditorialQueueClassification>): string {
  if (classifications.includes('needs-attention')) return 'Needs attention';
  if (classifications.includes('live')) return 'Live';
  if (classifications.includes('scheduled')) return 'Scheduled';
  if (classifications.includes('archived')) return 'Archived';
  if (classifications.includes('ready')) return 'Ready';
  if (classifications.includes('unassigned')) return 'Unassigned';
  return 'Draft';
}

function readinessLabelFor(
  record: FoleonManagedContent,
  classifications: ReadonlyArray<EditorialQueueClassification>,
): string {
  if (classifications.includes('needs-attention')) {
    return record.blockingReasons[0] ?? 'Validation issue';
  }
  if (record.publishStatus === 'Published') return 'Published';
  return record.publishStatus || 'Draft';
}

function primaryActionLabelFor(
  classifications: ReadonlyArray<EditorialQueueClassification>,
): string {
  if (classifications.includes('needs-attention')) return 'Resolve';
  if (classifications.includes('unassigned')) return 'Assign';
  if (classifications.includes('ready')) return 'Schedule';
  if (classifications.includes('scheduled')) return 'Review';
  if (classifications.includes('live')) return 'Manage';
  if (classifications.includes('archived')) return 'View';
  return 'Open';
}

export function filterEditorialQueueRows(
  rows: ReadonlyArray<EditorialQueueRow>,
  filterId: EditorialQueueFilterId,
): ReadonlyArray<EditorialQueueRow> {
  if (filterId === 'all') return rows;
  return rows.filter((row) => row.classifications.includes(filterId));
}

export function availableEditorialQueueFilters(
  rows: ReadonlyArray<EditorialQueueRow>,
): ReadonlyArray<EditorialQueueFilterOption> {
  return ALL_FILTERS
    .map((filter) => ({
      id: filter.id,
      label: filter.label,
      count:
        filter.id === 'all'
          ? rows.length
          : rows.filter((row) => row.classifications.includes(filter.id as EditorialQueueClassification)).length,
    }))
    // Suppress Archived chip when no record qualifies — never invent a filter that returns nothing.
    .filter((option) => option.id !== 'archived' || option.count > 0);
}

function parseDate(iso: string | undefined): number | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : parsed;
}
