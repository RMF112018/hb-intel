import type { FoleonLaneViewModel } from './manageLaneViewModel.js';
import { displayLaneState } from './manageLaneViewModel.js';
import type { FoleonReaderLane } from './manageMutationUtils.js';

export interface FeedSlotSummary {
  readonly lane: FoleonReaderLane;
  readonly label: string;
  readonly state: FoleonLaneViewModel['state'];
  readonly statusLabel: string;
  readonly liveTitle: string | null;
  readonly nextTitle: string | null;
  readonly displayWindow: string;
  readonly blockerCount: number;
  readonly nextAction: string;
  readonly liveContentId: string | null;
  readonly nextContentId: string | null;
}

/** Build one summary row per known lane, in deterministic order. */
export function buildFeedSlotSummaries(
  lanes: ReadonlyArray<FoleonLaneViewModel>,
): ReadonlyArray<FeedSlotSummary> {
  return lanes.map(buildSlotSummary);
}

function buildSlotSummary(lane: FoleonLaneViewModel): FeedSlotSummary {
  const live = lane.activeContent;
  const next = lane.stagedContent;
  const fromRecord = formatDisplayWindow(live?.displayFrom, live?.displayThrough);
  const fromPlacement =
    fromRecord === 'Not scheduled'
      ? formatDisplayWindow(lane.placement?.displayFrom, lane.placement?.displayThrough)
      : fromRecord;
  const blockerCount =
    (live?.blockingReasons.length ?? 0) +
    (lane.placement?.blockingReasons.length ?? 0) +
    lane.warnings.length;
  return {
    lane: lane.lane,
    label: lane.label,
    state: lane.state,
    statusLabel: displayLaneState(lane.state),
    liveTitle: live?.title ?? null,
    nextTitle: next?.title ?? null,
    displayWindow: fromPlacement,
    blockerCount,
    nextAction: lane.nextAction,
    liveContentId: live?.id ?? null,
    nextContentId: next?.id ?? null,
  };
}

/**
 * Format a display window from record-backed `displayFrom` / `displayThrough` ISO strings.
 * Returns "Not scheduled" when both are missing. Never invents data.
 */
export function formatDisplayWindow(
  displayFrom: string | undefined,
  displayThrough: string | undefined,
): string {
  if (!displayFrom && !displayThrough) return 'Not scheduled';
  const start = formatDate(displayFrom);
  const end = formatDate(displayThrough);
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return 'Not scheduled';
}

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed);
  } catch {
    return iso;
  }
}
