import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncRun,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import { buildFoleonLaneViewModels } from './manageLaneViewModel.js';

export interface ManagerStatusChip {
  readonly id: 'lanes' | 'api' | 'registry' | 'lastSync';
  readonly label: string;
  readonly value: string;
}

export function buildManagerStatusChips(args: {
  readonly contract: IFoleonRuntimeContract;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly syncStatus: FoleonSyncStatus | null;
  readonly runs: ReadonlyArray<FoleonSyncRun>;
  readonly managerReadPathProven: boolean;
}): ReadonlyArray<ManagerStatusChip> {
  const readiness = args.contract.foleonReadiness;
  const effectiveReadiness = readiness && args.managerReadPathProven
    ? { ...readiness, backendSafeConfigReady: true, readPathReady: true, writePathReady: readiness.writePathReady }
    : readiness;

  const lanes = buildFoleonLaneViewModels({
    content: args.content,
    placements: args.placements,
    readiness: effectiveReadiness,
    hasLoadedReadPath: args.managerReadPathProven || args.content.length > 0,
  });
  const live = lanes.filter((lane) => lane.state === 'Live').length;
  const blocked = lanes.filter((lane) => lane.state === 'Blocked' || lane.state === 'Config Incomplete').length;
  const lanesLabel = `${live} live`;
  const lanesValue = blocked > 0 ? `${lanesLabel}, ${blocked} need attention` : `${lanesLabel}, all lanes OK`;

  const apiValue = apiConnectionLabel(readiness, args.contract.hostMode);

  const dup = args.contract.foleonConfigDiagnostics?.registryDuplicateActiveKeysDetected === true;
  const registryValue = dup
    ? 'Conflict detected'
    : readiness?.registryReady === true
      ? 'Healthy'
      : args.contract.hostMode !== 'sharepoint'
        ? 'Preview'
        : 'Needs attention';

  const lastRun = args.syncStatus?.lastRun ?? args.runs[0];
  const lastSyncValue = formatLastSync(lastRun?.completedAtUtc ?? lastRun?.startedAtUtc);

  return [
    { id: 'lanes', label: 'Content lanes', value: lanesValue },
    { id: 'api', label: 'API connection', value: apiValue },
    { id: 'registry', label: 'Registry status', value: registryValue },
    { id: 'lastSync', label: 'Last sync', value: lastSyncValue },
  ];
}

function apiConnectionLabel(
  readiness: IFoleonRuntimeContract['foleonReadiness'],
  hostMode: IFoleonRuntimeContract['hostMode'],
): string {
  if (hostMode !== 'sharepoint') return 'Local preview';
  if (!readiness) return 'Unknown';
  if (
    readiness.backendUrlReady &&
    readiness.authResourceReady &&
    readiness.tokenProviderReady &&
    readiness.tokenAcquisitionReady
  ) {
    return 'Connected';
  }
  if (readiness.tokenAcquisitionReady === false && readiness.authResourceReady && readiness.tokenProviderReady) {
    return 'Limited — approval may be required';
  }
  if (!readiness.backendUrlReady || !readiness.authResourceReady) return 'Needs setup';
  return 'Limited';
}

function formatLastSync(iso: string | undefined): string {
  if (!iso) return 'None yet';
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return 'Unknown';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
  } catch {
    return 'Unknown';
  }
}

/** First HTTPS allowlisted viewer origin suitable for opening Foleon in a new tab (no path from user data). */
export function resolveSafeFoleonOpenOrigin(allowedOrigins: ReadonlyArray<string>): string | null {
  const first = allowedOrigins.find((origin) => /^https:\/\//i.test(origin.trim()));
  return first?.trim() ?? null;
}
