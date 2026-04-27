import { useMemo } from 'react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import { ManageMetricCards } from './ManageMetricCards.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { ManagePreviewGuidancePanel } from './ManagePreviewGuidancePanel.js';
import { ContentLibraryPanel } from './ContentLibraryPanel.js';
import { SelectedLaneWorkspace } from './SelectedLaneWorkspace.js';
import {
  buildFoleonLaneViewModels,
  buildPublishChecklist,
  displayLaneState,
  laneStateConsumerHint,
  placementStatusPlain,
  summarizePublishReadinessForCard,
  type FoleonLaneViewModel,
} from './manageLaneViewModel.js';
import { showHomepageLimitedMode } from './manageDegradedCopy.js';
import { buildReaderLaneWarnings, toContentMutation, type FoleonReaderLane } from './manageMutationUtils.js';
import { plainLanguageWriteBlockReason } from './manageWritePathMessage.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export function HomepageFoleonContentTab(props: {
  readonly contract: IFoleonRuntimeContract;
  readonly managerReadPathProven: boolean;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly syncStatus: FoleonSyncStatus | null;
  readonly api: FoleonManagementApi;
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly filteredContent: ReadonlyArray<FoleonManagedContent>;
  readonly selected: FoleonManagedContent | null;
  readonly selectedId: string | null;
  readonly selectedLane: FoleonReaderLane;
  readonly onSelectLane: (lane: FoleonReaderLane) => void;
  readonly onSelectRecord: (id: string) => void;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}): React.ReactNode {
  const readiness = props.contract.foleonReadiness;
  const effectiveReadiness = readiness
    ? { ...readiness, backendSafeConfigReady: true, readPathReady: true, writePathReady: readiness.writePathReady }
    : readiness;
  const canWrite =
    props.contract.hostMode !== 'sharepoint' ||
    (readiness?.writePathReady === true && props.managerReadPathProven);
  const writeBlockMessage = plainLanguageWriteBlockReason(props.contract, props.managerReadPathProven);
  const limitedMode = showHomepageLimitedMode(props.contract, props.managerReadPathProven);
  const lanes = buildFoleonLaneViewModels({
    content: props.content,
    placements: props.placements,
    readiness: effectiveReadiness,
    hasLoadedReadPath: props.managerReadPathProven,
  });
  const laneVm = lanes.find((lane) => lane.lane === props.selectedLane) ?? lanes[0];
  const published = props.content.filter((record) => record.publishStatus === 'Published' && record.isVisible).length;
  const homepageReady = props.content.filter(
    (record) => record.publishStatus === 'Published' && record.isVisible && record.isHomepageEligible,
  ).length;
  const blocked = props.content.filter((record) => record.validationStatus === 'blocked').length;
  const activePlacements = props.placements.filter((placement) => placement.isActive).length;
  const laneWarningCount = props.content.reduce((count, record) => count + buildReaderLaneWarnings({
    draft: toContentMutation(record),
    record,
    allContent: props.content,
    placements: props.placements,
  }).length, 0);
  const shouldShowPreviewGuidance = props.content.length === 0 || published === 0 || homepageReady === 0;

  const workspaceWarnings = useMemo(() => {
    if (!props.selected) return laneVm.warnings;
    const w = buildReaderLaneWarnings({
      draft: toContentMutation(props.selected),
      record: props.selected,
      allContent: props.content,
      placements: props.placements,
    });
    return Array.from(new Set([...laneVm.warnings, ...w, ...props.selected.blockingReasons]));
  }, [props.selected, laneVm, props.content, props.placements]);

  const workspaceChecklist = useMemo(
    () =>
      buildPublishChecklist({
        record: props.selected ?? laneVm.activeContent ?? laneVm.stagedContent,
        placement: laneVm.placement,
        readiness: effectiveReadiness,
        warnings: workspaceWarnings,
      }),
    [props.selected, laneVm, effectiveReadiness, workspaceWarnings],
  );

  return (
    <div
      role="tabpanel"
      id="foleon-manage-panel-content"
      aria-labelledby="foleon-manage-tab-content"
      aria-label="Homepage Foleon Content"
      className={shell.tabPanel}
    >
      {limitedMode ? (
        <div role="status" className={shell.limitedModeBanner} aria-label="Limited mode">
          <p className={shell.limitedModeCopy}>
            Limited mode: you can review lanes and configuration, but the service did not load editable content for this
            session.
          </p>
        </div>
      ) : null}
      <ManageMetricCards
        published={published}
        blocked={blocked}
        activePlacements={activePlacements}
        laneWarnings={laneWarningCount}
        syncHealth={props.syncStatus?.health ?? 'unknown'}
      />
      {shouldShowPreviewGuidance ? (
        <ManagePreviewGuidancePanel
          publicReadyContentCount={published}
          homepageReadyContentCount={homepageReady}
        />
      ) : null}
      <div className={shell.contentLaneStack}>
        <section className={f.editorSection} aria-label="Homepage lane summary">
          <p className={f.guidanceKicker}>Homepage Foleon Content</p>
          <h3 className={f.sectionTitle}>Lanes</h3>
          <div className={shell.laneSummaryRow} role="list">
            {lanes.map((lane) => (
              <LaneSummaryCard
                key={lane.lane}
                lane={lane}
                hint={laneStateConsumerHint(lane.state)}
                selected={lane.lane === props.selectedLane}
                onSelect={(): void => props.onSelectLane(lane.lane)}
              />
            ))}
          </div>
        </section>
        <SelectedLaneWorkspace
          contract={props.contract}
          laneVm={laneVm}
          selected={props.selected}
          checklist={workspaceChecklist}
          content={props.content}
          placements={props.placements}
          api={props.api}
          onRefresh={props.onRefresh}
          setMessage={props.setMessage}
          canWrite={canWrite}
          writeBlockMessage={writeBlockMessage}
        />
      </div>
      <ContentLibraryPanel
        query={props.query}
        onQueryChange={props.onQueryChange}
        filteredContent={props.filteredContent}
        selectedId={props.selectedId}
        onSelectRecord={props.onSelectRecord}
      />
    </div>
  );
}

function LaneSummaryCard(props: {
  readonly lane: FoleonLaneViewModel;
  readonly hint: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactNode {
  const statusLabel = displayLaneState(props.lane.state);
  const activeTitle = props.lane.activeContent?.title ?? 'None';
  const stagedTitle = props.lane.stagedContent?.title;
  const windowText = formatWindow(props.lane.placement);
  const placementText = placementStatusPlain(props.lane.placement);
  const readinessLine = summarizePublishReadinessForCard(props.lane.checklist);

  return (
    <button
      type="button"
      role="listitem"
      className={`${shell.laneSummaryButton} ${props.selected ? shell.laneSummaryButtonSelected : ''}`}
      data-lane-state={props.lane.state}
      aria-pressed={props.selected}
      onClick={props.onSelect}
    >
      <div className={shell.laneSummaryButtonHeader}>
        <strong>{props.lane.label}</strong>
        <span className={f.statusPill}>{statusLabel}</span>
      </div>
      {props.hint ? <p className={shell.laneStateHint}>{props.hint}</p> : null}
      <dl className={shell.laneSummaryDl}>
        <div>
          <dt>Active content</dt>
          <dd>{activeTitle}</dd>
        </div>
        {stagedTitle ? (
          <div>
            <dt>Staged content</dt>
            <dd>{stagedTitle}</dd>
          </div>
        ) : null}
        <div>
          <dt>Display window</dt>
          <dd>{windowText}</dd>
        </div>
        <div>
          <dt>Placement</dt>
          <dd>{placementText}</dd>
        </div>
        <div>
          <dt>Publish readiness</dt>
          <dd>{readinessLine}</dd>
        </div>
        <div>
          <dt>Next step</dt>
          <dd>{props.lane.nextAction}</dd>
        </div>
      </dl>
    </button>
  );
}

function formatWindow(placement: FoleonPlacement | undefined): string {
  if (!placement) return 'Not set';
  return `${placement.displayFrom ?? 'Now'} to ${placement.displayThrough ?? 'Open'}`;
}
