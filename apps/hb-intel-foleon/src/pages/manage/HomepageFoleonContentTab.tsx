import { useMemo } from 'react';
import { motion } from 'motion/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cva } from 'class-variance-authority';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Eye, ListChecks, LockKeyhole, RadioTower, Rows3 } from 'lucide-react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { ContentLibraryPanel } from './ContentLibraryPanel.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
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

const laneNavButton = cva(shell.laneNavButton, {
  variants: {
    selected: { true: shell.laneNavButtonSelected, false: null },
    state: {
      Live: shell.laneNavLive,
      Preview: shell.laneNavPreview,
      Blocked: shell.laneNavBlocked,
      Empty: shell.laneNavEmpty,
      'Config Incomplete': shell.laneNavSetup,
    },
  },
});

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
  const passingChecks = workspaceChecklist.filter((item) => item.status === 'pass').length;
  const laneMetrics = [
    { label: 'Published', value: published, tone: 'good' },
    { label: 'Homepage ready', value: homepageReady, tone: 'good' },
    { label: 'Blocked', value: blocked, tone: blocked > 0 ? 'bad' : 'quiet' },
    { label: 'Active placements', value: activePlacements, tone: 'info' },
    { label: 'Lane warnings', value: laneWarningCount, tone: laneWarningCount > 0 ? 'warn' : 'quiet' },
    { label: 'Sync health', value: props.syncStatus?.health ?? 'unknown', tone: props.syncStatus?.health === 'ready' ? 'good' : 'info' },
  ] as const;

  return (
    <div
      role="tabpanel"
      id="foleon-manage-panel-content"
      aria-labelledby="foleon-manage-tab-content"
      aria-label="Homepage Foleon Content"
      className={shell.tabPanel}
    >
      {limitedMode ? (
        <LimitedModeWorkspaceNotice
          writeBlockMessage={writeBlockMessage}
          managerReadPathProven={props.managerReadPathProven}
        />
      ) : null}
      <motion.section
        className={shell.workspaceShell}
        aria-label="Homepage Foleon manager workspace"
        data-manager-workspace="admin"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        <aside className={shell.laneNavigationRail} aria-label="Homepage lane navigation">
          <div className={shell.railHeader}>
            <span className={shell.railIcon} aria-hidden>
              <Rows3 size={18} />
            </span>
            <div>
              <p className={f.guidanceKicker}>Homepage lanes</p>
              <h3 className={f.sectionTitle}>Manage placement order</h3>
            </div>
          </div>
          <ScrollArea.Root className={shell.laneNavScroll}>
            <ScrollArea.Viewport className={shell.laneNavViewport}>
              <div className={shell.laneNavList} role="list">
                {lanes.map((lane) => (
                  <LaneNavigationButton
                    key={lane.lane}
                    lane={lane}
                    selected={lane.lane === props.selectedLane}
                    onSelect={(): void => props.onSelectLane(lane.lane)}
                    onMove={(direction): void => {
                      const index = lanes.findIndex((entry) => entry.lane === lane.lane);
                      const nextIndex = direction === 'next'
                        ? (index + 1) % lanes.length
                        : (index - 1 + lanes.length) % lanes.length;
                      const nextLane = lanes[nextIndex];
                      if (nextLane) props.onSelectLane(nextLane.lane);
                    }}
                  />
                ))}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className={shell.scrollbar} orientation="vertical">
              <ScrollArea.Thumb className={shell.scrollThumb} />
            </ScrollArea.Scrollbar>
            <ScrollArea.Scrollbar className={shell.scrollbarHorizontal} orientation="horizontal">
              <ScrollArea.Thumb className={shell.scrollThumb} />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </aside>
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
        <aside className={shell.readinessRail} aria-label="Publish readiness and next actions">
          <div className={shell.railHeader}>
            <span className={shell.railIcon} aria-hidden>
              <ListChecks size={18} />
            </span>
            <div>
              <p className={f.guidanceKicker}>Readiness rail</p>
              <h3 className={f.sectionTitle}>Next action</h3>
            </div>
          </div>
          <div className={shell.nextActionPanel} data-lane-state={laneVm.state}>
            <strong>{laneVm.nextAction}</strong>
            <span>{displayLaneState(laneVm.state)} for {laneVm.label}</span>
          </div>
          <Separator.Root className={shell.workspaceSeparator} decorative orientation="horizontal" />
          <div className={shell.readinessScore} aria-label="Selected lane publish readiness">
            <span>{passingChecks}/{workspaceChecklist.length}</span>
            <p>publish checks passing</p>
          </div>
          <div className={shell.operationalMetricGrid} aria-label="Manager operational summary">
            {laneMetrics.map((metric) => (
              <div key={metric.label} className={shell.operationalMetric} data-tone={metric.tone}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
          {shouldShowPreviewGuidance ? (
            <div className={shell.previewGuidanceCompact} role="note">
              <strong>Preview structure active</strong>
              <span>
                Sync and publish-ready content will populate this workspace; the lane model remains visible while the data set is light.
              </span>
            </div>
          ) : null}
          <ManagePlacementPanel
            content={props.content}
            placements={props.placements}
            api={props.api}
            onRefresh={props.onRefresh}
            setMessage={props.setMessage}
            canWrite={canWrite}
            writeBlockReason={writeBlockMessage}
            focusedLane={laneVm.lane}
            focusedLaneLabel={laneVm.label}
            focusedPlacementKey={laneVm.placementKey}
            focusedContent={laneVm.activeContent ?? laneVm.stagedContent}
          />
        </aside>
      </motion.section>
      <section className={shell.libraryBand} aria-label="Secondary content library">
        <ContentLibraryPanel
          query={props.query}
          onQueryChange={props.onQueryChange}
          filteredContent={props.filteredContent}
          selectedId={props.selectedId}
          onSelectRecord={props.onSelectRecord}
        />
      </section>
    </div>
  );
}

function LaneNavigationButton(props: {
  readonly lane: FoleonLaneViewModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly onMove: (direction: 'previous' | 'next') => void;
}): React.ReactNode {
  const statusLabel = displayLaneState(props.lane.state);
  const activeTitle = props.lane.activeContent?.title ?? 'None';
  const windowText = formatWindow(props.lane.placement);
  const placementText = placementStatusPlain(props.lane.placement);
  const readinessLine = summarizePublishReadinessForCard(props.lane.checklist);

  return (
    <button
      type="button"
      role="listitem"
      className={laneNavButton({ selected: props.selected, state: props.lane.state })}
      data-lane-state={props.lane.state}
      aria-pressed={props.selected}
      onClick={props.onSelect}
      onKeyDown={(event): void => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          props.onMove('next');
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          props.onMove('previous');
        }
      }}
    >
      <div className={shell.laneNavTopline}>
        <span className={shell.laneStateIcon} aria-hidden>{iconForLaneState(props.lane.state)}</span>
        <strong>{props.lane.label}</strong>
        <span className={shell.laneStatusPill}>{statusLabel}</span>
      </div>
      <p className={shell.laneStateHint}>{laneStateConsumerHint(props.lane.state)}</p>
      <dl className={shell.laneNavFacts}>
        <div>
          <dt>Live edition</dt>
          <dd>{activeTitle}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>{windowText}</dd>
        </div>
        <div>
          <dt>Placement</dt>
          <dd>{placementText}</dd>
        </div>
      </dl>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className={shell.laneReadinessChip}>{readinessLine}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={shell.tooltipContent} side="right">
            Next action: {props.lane.nextAction}
            <Tooltip.Arrow className={shell.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </button>
  );
}

function LimitedModeWorkspaceNotice(props: {
  readonly writeBlockMessage: string;
  readonly managerReadPathProven: boolean;
}): React.ReactNode {
  return (
    <section role="status" className={shell.limitedModeWorkspaceNotice} aria-label="Limited mode">
      <div className={shell.limitedModeNoticeIcon} aria-hidden>
        <LockKeyhole size={22} />
      </div>
      <div>
        <p className={f.guidanceKicker}>Designed limited mode</p>
        <h3 className={f.sectionTitle}>API approval is required before this workspace can read, write, or sync live content.</h3>
        <p className={shell.limitedModeCopy}>
          The Manager still shows the intended homepage lane structure so marketing admins can understand where Project Spotlight,
          Company Pulse, and Leadership Message will be managed after tenant API access is approved.
        </p>
        <p className={shell.limitedModeSubcopy}>
          Read path proven: {props.managerReadPathProven ? 'yes' : 'not yet'}. Write and placement actions are unavailable:
          {' '}{props.writeBlockMessage}.
        </p>
      </div>
    </section>
  );
}

function iconForLaneState(state: FoleonLaneViewModel['state']): React.ReactNode {
  switch (state) {
    case 'Live':
      return <CheckCircle2 size={17} />;
    case 'Preview':
      return <Eye size={17} />;
    case 'Blocked':
      return <AlertTriangle size={17} />;
    case 'Empty':
      return <Clock3 size={17} />;
    case 'Config Incomplete':
      return <RadioTower size={17} />;
    default:
      return <Activity size={17} />;
  }
}

function formatWindow(placement: FoleonPlacement | undefined): string {
  if (!placement) return 'Not set';
  return `${placement.displayFrom ?? 'Now'} to ${placement.displayThrough ?? 'Open'}`;
}
