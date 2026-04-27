import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonLaneViewModel } from './manageLaneViewModel.js';

export type ManagerOperationsCountId = 'new' | 'unassigned' | 'blocked' | 'live' | 'staged';

export interface ManagerOperationsCount {
  readonly id: ManagerOperationsCountId;
  readonly label: string;
  readonly value: number;
}

/**
 * Operations-language counts for the rebuilt manager shell. Each count is derived only from
 * fields that exist on FoleonManagedContent / FoleonPlacement / FoleonLaneViewModel today.
 *
 * Omissions (intentionally not invented):
 *  - `new`: no createdAtUtc / syncedAtUtc field exists on FoleonManagedContent. lastEditorialUpdate
 *    is editorial, not sync recency, so a "newly synced" count cannot be honestly derived.
 */
export function buildManagerOperationsCounts(args: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
}): ReadonlyArray<ManagerOperationsCount> {
  const live = args.lanes.filter((lane) => lane.state === 'Live').length;
  const staged = args.lanes.filter((lane) => lane.state === 'Preview').length;
  const blocked = args.lanes.filter(
    (lane) => lane.state === 'Blocked' || lane.state === 'Config Incomplete',
  ).length;
  const unassigned = countUnassignedContent(args.content, args.placements);

  return [
    { id: 'live', label: 'Live', value: live },
    { id: 'staged', label: 'Staged', value: staged },
    { id: 'blocked', label: 'Blocked', value: blocked },
    { id: 'unassigned', label: 'Unassigned', value: unassigned },
  ];
}

function countUnassignedContent(
  content: ReadonlyArray<FoleonManagedContent>,
  placements: ReadonlyArray<FoleonPlacement>,
): number {
  if (content.length === 0) return 0;
  const placedDocIds = new Set(
    placements.map((placement) => placement.foleonDocId).filter((value) => Number.isFinite(value)),
  );
  return content.filter((record) => !placedDocIds.has(record.foleonDocId)).length;
}
