import { HbcButton } from '@hbc/ui-kit/homepage';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import { ManageMetricCards } from './ManageMetricCards.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
import { ManagePreviewGuidancePanel } from './ManagePreviewGuidancePanel.js';
import { ManageRegistryPanel } from './ManageRegistryPanel.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { FoleonEmpty } from '../../components/FoleonStates.js';
import {
  buildFoleonLaneViewModels,
  type FoleonLaneViewModel,
} from './manageLaneViewModel.js';
import { buildReaderLaneWarnings, toContentMutation } from './manageMutationUtils.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export function HomepageFoleonContentTab(props: {
  readonly contract: IFoleonRuntimeContract;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly syncStatus: FoleonSyncStatus | null;
  readonly api: FoleonManagementApi;
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly filteredContent: ReadonlyArray<FoleonManagedContent>;
  readonly selected: FoleonManagedContent | null;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}): React.ReactNode {
  const readiness = props.contract.foleonReadiness;
  const effectiveReadiness = readiness
    ? { ...readiness, backendSafeConfigReady: true, readPathReady: true, writePathReady: readiness.writePathReady }
    : readiness;
  const canWrite = props.contract.hostMode !== 'sharepoint' || readiness?.writePathReady === true;
  const writeBlockReason = readinessBlockReason(props.contract);
  const lanes = buildFoleonLaneViewModels({
    content: props.content,
    placements: props.placements,
    readiness: effectiveReadiness,
    hasLoadedReadPath: true,
  });
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

  return (
    <div role="tabpanel" aria-label="Homepage Foleon Content" className={shell.tabPanel}>
      <ManageMetricCards
        published={published}
        blocked={blocked}
        activePlacements={activePlacements}
        laneWarnings={laneWarningCount}
        syncHealth={props.syncStatus?.health ?? 'unknown'}
      />
      <LaneStatusOverview lanes={lanes} canWrite={canWrite} writeBlockReason={writeBlockReason} />
      {shouldShowPreviewGuidance ? (
        <ManagePreviewGuidancePanel
          publicReadyContentCount={published}
          homepageReadyContentCount={homepageReady}
        />
      ) : null}
      <div className={shell.layout}>
        <ManageRegistryPanel
          query={props.query}
          onQueryChange={props.onQueryChange}
          filteredContent={props.filteredContent}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
        />
        <main className={shell.main}>
          {props.selected ? (
            <>
              <PublishReadinessChecklist lane={lanes.find((lane) => lane.activeContent?.id === props.selected?.id)} />
              <ManageContentEditorPanel
                record={props.selected}
                allContent={props.content}
                placements={props.placements}
                api={props.api}
                onRefresh={props.onRefresh}
                setMessage={props.setMessage}
                canWrite={canWrite}
                writeBlockReason={writeBlockReason}
              />
            </>
          ) : (
            <FoleonEmpty title="No registry records yet." description="Create a draft or sync Foleon Docs." />
          )}
          <ManagePlacementPanel
            content={props.content}
            placements={props.placements}
            api={props.api}
            onRefresh={props.onRefresh}
            setMessage={props.setMessage}
            canWrite={canWrite}
            writeBlockReason={writeBlockReason}
          />
        </main>
      </div>
    </div>
  );
}

function LaneStatusOverview(props: {
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
  readonly canWrite: boolean;
  readonly writeBlockReason: string;
}): React.ReactNode {
  return (
    <section className={f.editorSection} aria-label="Lane status overview">
      <div className={shell.sectionHeaderRow}>
        <div>
          <p className={f.guidanceKicker}>Homepage Foleon Content</p>
          <h3 className={f.sectionTitle}>Lane Status Overview</h3>
        </div>
        <span className={f.metaMuted}>{props.canWrite ? 'Writes ready' : `Writes blocked: ${props.writeBlockReason}`}</span>
      </div>
      <div className={shell.laneGrid}>
        {props.lanes.map((lane) => (
          <article key={lane.lane} className={shell.laneCard} data-lane-state={lane.state}>
            <div className={shell.sectionHeaderRow}>
              <div>
                <strong>{lane.label}</strong>
                <div className={f.metaMuted}>{lane.readerKey} • {lane.placementKey}</div>
              </div>
              <span className={f.statusPill}>{lane.state}</span>
            </div>
            <dl className={shell.definitionGrid}>
              <dt>Active content</dt>
              <dd>{lane.activeContent?.title ?? 'None'}</dd>
              <dt>Publication ID</dt>
              <dd>{lane.activeContent ? shortId(lane.activeContent.foleonDocId) : 'Missing'}</dd>
              <dt>Placement</dt>
              <dd>{lane.placement ? `${lane.placement.isActive ? 'Active' : 'Inactive'} • ${lane.placement.validationStatus}` : 'Missing'}</dd>
              <dt>Display window</dt>
              <dd>{formatWindow(lane.placement)}</dd>
              <dt>Validation</dt>
              <dd>{lane.activeContent?.validationStatus ?? 'unknown'}</dd>
              <dt>Publish status</dt>
              <dd>{lane.activeContent?.publishStatus ?? 'None'}</dd>
              <dt>Next action</dt>
              <dd>{lane.nextAction}</dd>
            </dl>
            <div className={f.flexToolbar} aria-label={`${lane.label} actions`}>
              <HbcButton variant="secondary" disabled={!lane.activeContent}>View</HbcButton>
              <HbcButton variant="secondary" disabled={!props.canWrite}>{props.canWrite ? 'Edit' : 'Edit blocked'}</HbcButton>
              <HbcButton variant="secondary" disabled={!props.canWrite}>Validate</HbcButton>
              <HbcButton variant="secondary" disabled={!props.canWrite}>Publish</HbcButton>
              <HbcButton variant="secondary" disabled={!props.canWrite}>Manage Placement</HbcButton>
            </div>
            {lane.warnings.length > 0 ? (
              <ul className={f.validationBad}>
                {lane.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function PublishReadinessChecklist(props: {
  readonly lane?: FoleonLaneViewModel;
}): React.ReactNode {
  if (!props.lane) return null;
  return (
    <section className={f.editorSection} aria-label="Publish readiness checklist">
      <h3 className={f.sectionTitle}>Publish Readiness Checklist</h3>
      <div className={shell.checkGrid}>
        {props.lane.checklist.map((item) => (
          <div key={item.label} className={shell.checkItem} data-check-status={item.status}>
            <strong>{item.label}</strong>
            <span>{item.status === 'pass' ? 'Pass' : 'Blocked'}</span>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function readinessBlockReason(contract: IFoleonRuntimeContract): string {
  const blocker = contract.foleonConfigDiagnostics?.blockers[0];
  if (blocker) return blocker.code;
  const readiness = contract.foleonReadiness;
  if (readiness?.backendSafeConfigReady !== true) return 'backend-safe-config-unavailable';
  if (readiness.backendRouteAuthorizationReady !== true) return 'backend-route-authorization-unproven';
  return 'write-path-not-proven';
}

function shortId(value: number): string {
  const text = String(value);
  return text.length <= 4 ? text : `...${text.slice(-4)}`;
}

function formatWindow(placement: FoleonPlacement | undefined): string {
  if (!placement) return 'Missing';
  return `${placement.displayFrom ?? 'Now'} to ${placement.displayThrough ?? 'Open'}`;
}
