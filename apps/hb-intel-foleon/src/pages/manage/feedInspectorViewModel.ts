import type { FoleonRuntimeReadiness } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import {
  buildPublishChecklist,
  type FoleonLaneViewModel,
  type PublishChecklistItem,
} from './manageLaneViewModel.js';
import {
  readerLaneForContent,
  readerLaneLabel,
  type FoleonReaderLane,
} from './manageMutationUtils.js';
import { formatDisplayWindow } from './feedSlotsViewModel.js';

export interface FeedInspectorSummary {
  readonly title: string;
  readonly laneLabel: string;
  readonly publishStatus: string;
  readonly visibility: 'visible' | 'hidden';
  readonly homepageEligible: boolean;
  readonly foleonDocId: number;
}

export interface FeedInspectorReadiness {
  readonly checklist: ReadonlyArray<PublishChecklistItem>;
  readonly blockingReasons: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

export interface FeedInspectorScheduleEntry {
  readonly source: 'record' | 'placement';
  readonly label: string;
  readonly window: string;
}

export interface FeedInspectorPreview {
  readonly publishedUrl: string | null;
  readonly embedUrl: string | null;
  readonly openMode: string;
  readonly canOpenFoleon: boolean;
  readonly openFoleonDisabledReason: string | undefined;
}

export interface FeedInspectorViewModel {
  readonly summary: FeedInspectorSummary;
  readonly readiness: FeedInspectorReadiness;
  readonly schedule: ReadonlyArray<FeedInspectorScheduleEntry>;
  readonly preview: FeedInspectorPreview;
  readonly lane: FoleonReaderLane | null;
  readonly placement: FoleonPlacement | undefined;
}

export function buildFeedInspectorViewModel(args: {
  readonly record: FoleonManagedContent;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
  readonly readiness: FoleonRuntimeReadiness | undefined;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason: string | undefined;
}): FeedInspectorViewModel {
  const lane = readerLaneForContent(args.record) ?? null;
  const laneVm = lane ? args.lanes.find((entry) => entry.lane === lane) : undefined;
  const placement =
    args.placements.find((entry) => entry.foleonDocId === args.record.foleonDocId && entry.isActive) ??
    args.placements.find((entry) => entry.foleonDocId === args.record.foleonDocId);

  const warnings = laneVm && laneVm.activeContent?.id === args.record.id ? laneVm.warnings : [];

  const summary: FeedInspectorSummary = {
    title: args.record.title,
    laneLabel: lane ? readerLaneLabel(lane) : args.record.contentTypeKey || 'Unassigned',
    publishStatus: args.record.publishStatus || 'Draft',
    visibility: args.record.isVisible ? 'visible' : 'hidden',
    homepageEligible: args.record.isHomepageEligible,
    foleonDocId: args.record.foleonDocId,
  };

  const readiness: FeedInspectorReadiness = {
    checklist: buildPublishChecklist({
      record: args.record,
      placement,
      readiness: args.readiness,
      warnings,
    }),
    blockingReasons: [
      ...args.record.blockingReasons,
      ...(placement?.blockingReasons ?? []),
    ],
    warnings,
  };

  const schedule: ReadonlyArray<FeedInspectorScheduleEntry> = [
    {
      source: 'record',
      label: 'Content display window',
      window: formatDisplayWindow(args.record.displayFrom, args.record.displayThrough),
    },
    ...(placement
      ? [
          {
            source: 'placement' as const,
            label: 'Placement display window',
            window: formatDisplayWindow(placement.displayFrom, placement.displayThrough),
          },
        ]
      : []),
  ];

  const preview: FeedInspectorPreview = {
    publishedUrl: args.record.publishedUrl ?? null,
    embedUrl: args.record.embedUrl ?? null,
    openMode: args.record.openMode ?? 'Inline Reader',
    canOpenFoleon: Boolean(args.safeFoleonOpenUrl),
    openFoleonDisabledReason: args.safeFoleonOpenUrl
      ? undefined
      : args.openFoleonUnavailableReason ??
        'Open Foleon needs an approved HTTPS viewer origin.',
  };

  return { summary, readiness, schedule, preview, lane, placement };
}
