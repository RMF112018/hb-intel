import { useEffect, useMemo, useState } from 'react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import { FeedSetupCallout } from './FeedSetupCallout.js';
import { FeedSlotsSummary } from './FeedSlotsSummary.js';
import { EditorialQueue, type EditorialQueueEmptyState } from './EditorialQueue.js';
import { FeedInspectorPanel } from './FeedInspectorPanel.js';
import {
  buildFeedSetupCalloutModel,
  resolveFeedDeskState,
} from './feedDeskViewModel.js';
import { buildFeedSlotSummaries } from './feedSlotsViewModel.js';
import {
  availableEditorialQueueFilters,
  buildEditorialQueueRows,
  filterEditorialQueueRows,
  type EditorialQueueFilterId,
} from './editorialQueueViewModel.js';
import { buildFoleonLaneViewModels } from './manageLaneViewModel.js';
import { readerLaneForContent } from './manageMutationUtils.js';
import shell from './manageShell.module.css';

export interface FeedDeskWorkspaceProps {
  readonly contract: IFoleonRuntimeContract;
  readonly api: FoleonManagementApi;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly managerReadPathProven: boolean;
  readonly canSync: boolean;
  readonly canWrite: boolean;
  readonly writeBlockReason: string | undefined;
  readonly tokenAcquisitionDegraded: boolean;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason: string | undefined;
  readonly onSyncDocs: () => void;
  readonly onOpenAdminDiagnostics: () => void;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}

const DRAWER_BREAKPOINT_PX = 1100;

export function FeedDeskWorkspace(props: FeedDeskWorkspaceProps): React.ReactNode {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EditorialQueueFilterId>('all');
  const [drawerMode, setDrawerMode] = useState<boolean>(() => detectDrawerMode());
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = (): void => setDrawerMode(detectDrawerMode());
    window.addEventListener('resize', onResize);
    return (): void => window.removeEventListener('resize', onResize);
  }, []);

  const lanes = useMemo(
    () =>
      buildFoleonLaneViewModels({
        content: props.content,
        placements: props.placements,
        readiness: effectiveReadiness(props.contract, props.managerReadPathProven),
        hasLoadedReadPath: props.managerReadPathProven,
      }),
    [props.content, props.placements, props.contract, props.managerReadPathProven],
  );

  const slots = useMemo(() => buildFeedSlotSummaries(lanes), [lanes]);

  const queueRows = useMemo(
    () => buildEditorialQueueRows({ content: props.content, placements: props.placements, lanes }),
    [props.content, props.placements, lanes],
  );

  const filterOptions = useMemo(() => availableEditorialQueueFilters(queueRows), [queueRows]);

  const visibleRows = useMemo(
    () => filterEditorialQueueRows(queueRows, activeFilter),
    [queueRows, activeFilter],
  );

  const feedDeskState = resolveFeedDeskState({
    tokenAcquisitionDegraded: props.tokenAcquisitionDegraded,
    canSync: props.canSync,
    contentLoaded: props.content.length,
  });
  const calloutModel = buildFeedSetupCalloutModel(feedDeskState);

  const selectedRecord =
    selectedRecordId != null
      ? props.content.find((entry) => entry.id === selectedRecordId) ?? null
      : null;

  const onSelectSlot = (slot: ReturnType<typeof buildFeedSlotSummaries>[number]): void => {
    if (slot.liveContentId) {
      setSelectedRecordId(slot.liveContentId);
      setActiveFilter('live');
    } else if (slot.nextContentId) {
      setSelectedRecordId(slot.nextContentId);
      setActiveFilter('all');
    } else if (calloutModel?.action.id === 'sync-foleon') {
      props.onSyncDocs();
    } else {
      props.onOpenAdminDiagnostics();
    }
    if (drawerMode) setDrawerOpen(true);
  };

  const onSelectRow = (rowId: string): void => {
    setSelectedRecordId(rowId);
    if (drawerMode) setDrawerOpen(true);
  };

  const onCalloutAction = (): void => {
    if (calloutModel?.action.id === 'sync-foleon') {
      props.onSyncDocs();
    } else {
      props.onOpenAdminDiagnostics();
    }
  };

  const queueEmptyContentState: EditorialQueueEmptyState | undefined =
    props.content.length === 0
      ? feedDeskState === 'token-degraded' || feedDeskState === 'sync-blocked'
        ? {
            heading: 'No Foleon content is available yet.',
            body: 'Resolve sync readiness to import Foleon content. Open admin diagnostics to see what needs attention.',
            action: {
              id: 'open-admin-diagnostics',
              label: 'Open admin diagnostics',
              onClick: props.onOpenAdminDiagnostics,
            },
          }
        : {
            heading: 'No Foleon content is available yet.',
            body: 'Resolve sync readiness to import Foleon content. Run Sync from Foleon to bring in published Foleon documents.',
            action: {
              id: 'sync-foleon',
              label: 'Sync from Foleon',
              onClick: props.onSyncDocs,
            },
          }
      : undefined;

  return (
    <div
      className={shell.feedDeskWorkspace}
      data-feed-desk-state={feedDeskState}
    >
      {calloutModel ? (
        <FeedSetupCallout model={calloutModel} onAction={onCalloutAction} />
      ) : null}

      <FeedSlotsSummary slots={slots} onSelectSlot={onSelectSlot} />

      <div className={shell.feedDeskQueueAndInspector} data-feed-desk-drawer-mode={drawerMode ? 'true' : 'false'}>
        <EditorialQueue
          rows={visibleRows}
          filters={filterOptions}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          selectedRowId={selectedRecordId}
          onSelectRow={onSelectRow}
          emptyContentState={queueEmptyContentState}
        />
        <FeedInspectorPanel
          contract={props.contract}
          api={props.api}
          content={props.content}
          placements={props.placements}
          lanes={lanes}
          selectedRecord={selectedRecord}
          canWrite={props.canWrite}
          writeBlockReason={props.writeBlockReason}
          safeFoleonOpenUrl={props.safeFoleonOpenUrl}
          openFoleonUnavailableReason={props.openFoleonUnavailableReason}
          onRefresh={props.onRefresh}
          setMessage={props.setMessage}
          drawerMode={drawerMode}
          drawerOpen={drawerOpen}
          onDrawerClose={(): void => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
}

function detectDrawerMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < DRAWER_BREAKPOINT_PX;
}

function effectiveReadiness(
  contract: IFoleonRuntimeContract,
  managerReadPathProven: boolean,
): IFoleonRuntimeContract['foleonReadiness'] {
  const readiness = contract.foleonReadiness;
  if (!readiness) return readiness;
  if (!managerReadPathProven) return readiness;
  return {
    ...readiness,
    backendSafeConfigReady: true,
    readPathReady: true,
    writePathReady: readiness.writePathReady,
  };
}
