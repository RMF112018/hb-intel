import { useEffect, useRef } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import { ExternalLink, X } from 'lucide-react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
import {
  buildFeedInspectorViewModel,
  type FeedInspectorViewModel,
} from './feedInspectorViewModel.js';
import { readerLaneLabel } from './manageMutationUtils.js';
import type { FoleonLaneViewModel } from './manageLaneViewModel.js';
import shell from './manageShell.module.css';

export interface FeedInspectorPanelProps {
  readonly contract: IFoleonRuntimeContract;
  readonly api: FoleonManagementApi;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
  readonly selectedRecord: FoleonManagedContent | null;
  readonly canWrite: boolean;
  readonly writeBlockReason: string | undefined;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason: string | undefined;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
  readonly drawerMode: boolean;
  readonly drawerOpen: boolean;
  readonly onDrawerClose: () => void;
}

export function FeedInspectorPanel(props: FeedInspectorPanelProps): React.ReactNode {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!props.drawerMode) return;
    if (!props.drawerOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') props.onDrawerClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return (): void => document.removeEventListener('keydown', onKeyDown);
  }, [props.drawerMode, props.drawerOpen, props.onDrawerClose]);

  if (!props.selectedRecord) {
    return (
      <aside
        className={shell.feedInspector}
        aria-label="Feed Inspector"
        data-feed-inspector-drawer={props.drawerMode ? (props.drawerOpen ? 'open' : 'closed') : 'persistent'}
      >
        <header className={shell.feedInspectorHeader}>
          <h3 className={shell.feedInspectorHeading}>Inspector</h3>
        </header>
        <p className={shell.feedInspectorEmpty}>
          Select an item from the queue to see readiness, placement, schedule, preview, and publish controls.
        </p>
      </aside>
    );
  }

  if (props.drawerMode && !props.drawerOpen) {
    return null;
  }

  const viewModel = buildFeedInspectorViewModel({
    record: props.selectedRecord,
    placements: props.placements,
    lanes: props.lanes,
    readiness: props.contract.foleonReadiness,
    safeFoleonOpenUrl: props.safeFoleonOpenUrl,
    openFoleonUnavailableReason: props.openFoleonUnavailableReason,
  });

  const onOpenFoleon = (): void => {
    if (!props.safeFoleonOpenUrl) return;
    window.open(props.safeFoleonOpenUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside
      className={shell.feedInspector}
      aria-label="Feed Inspector"
      data-feed-inspector-drawer={props.drawerMode ? 'open' : 'persistent'}
    >
      <header className={shell.feedInspectorHeader}>
        <div>
          <p className={shell.feedInspectorKicker}>{viewModel.summary.laneLabel}</p>
          <h3 className={shell.feedInspectorHeading}>{viewModel.summary.title}</h3>
        </div>
        {props.drawerMode ? (
          <button
            ref={closeButtonRef}
            type="button"
            className={shell.feedInspectorClose}
            onClick={props.onDrawerClose}
            aria-label="Close inspector"
          >
            <X size={18} aria-hidden />
          </button>
        ) : null}
      </header>

      <SummarySection summary={viewModel.summary} />
      <ReadinessSection readiness={viewModel.readiness} />
      <ScheduleSection entries={viewModel.schedule} />
      <PreviewSection
        preview={viewModel.preview}
        onOpenFoleon={onOpenFoleon}
      />

      <section
        className={shell.feedInspectorSection}
        aria-label="Placement"
        data-feed-inspector-section="placement"
      >
        <h4 className={shell.feedInspectorSectionHeading}>Placement</h4>
        <ManagePlacementPanel
          content={props.content}
          placements={props.placements}
          api={props.api}
          onRefresh={props.onRefresh}
          setMessage={props.setMessage}
          canWrite={props.canWrite}
          writeBlockReason={props.writeBlockReason}
          focusedLane={viewModel.lane ?? undefined}
          focusedLaneLabel={viewModel.lane ? readerLaneLabel(viewModel.lane) : undefined}
          focusedPlacementKey={viewModel.placement?.placementKey}
          focusedContent={props.selectedRecord}
        />
      </section>

      <section
        className={shell.feedInspectorSection}
        aria-label="Publish and activate"
        data-feed-inspector-section="publish"
      >
        <h4 className={shell.feedInspectorSectionHeading}>Publish &amp; Activate</h4>
        <ManageContentEditorPanel
          record={props.selectedRecord}
          allContent={props.content}
          placements={props.placements}
          api={props.api}
          onRefresh={props.onRefresh}
          setMessage={props.setMessage}
          originPolicy={props.contract.originPolicy}
          canWrite={props.canWrite}
          writeBlockReason={props.writeBlockReason}
        />
      </section>
    </aside>
  );
}

function SummarySection(props: { readonly summary: FeedInspectorViewModel['summary'] }): React.ReactNode {
  const { summary } = props;
  return (
    <section
      className={shell.feedInspectorSection}
      aria-label="Summary"
      data-feed-inspector-section="summary"
    >
      <h4 className={shell.feedInspectorSectionHeading}>Summary</h4>
      <dl className={shell.feedInspectorSummaryList}>
        <div>
          <dt>Feed lane</dt>
          <dd>{summary.laneLabel}</dd>
        </div>
        <div>
          <dt>Publish status</dt>
          <dd>{summary.publishStatus}</dd>
        </div>
        <div>
          <dt>Visibility</dt>
          <dd>{summary.visibility === 'visible' ? 'Visible' : 'Hidden'}</dd>
        </div>
        <div>
          <dt>Homepage eligible</dt>
          <dd>{summary.homepageEligible ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Foleon doc ID</dt>
          <dd>{summary.foleonDocId}</dd>
        </div>
      </dl>
    </section>
  );
}

function ReadinessSection(props: {
  readonly readiness: FeedInspectorViewModel['readiness'];
}): React.ReactNode {
  const { readiness } = props;
  return (
    <section
      className={shell.feedInspectorSection}
      aria-label="Readiness and blockers"
      data-feed-inspector-section="readiness"
    >
      <h4 className={shell.feedInspectorSectionHeading}>Readiness</h4>
      <ul className={shell.feedInspectorChecklist}>
        {readiness.checklist.map((item) => (
          <li
            key={item.label}
            className={shell.feedInspectorChecklistItem}
            data-feed-inspector-check-status={item.status}
          >
            <span className={shell.feedInspectorChecklistLabel}>{item.label}</span>
            <span className={shell.feedInspectorChecklistDetail}>{item.detail}</span>
          </li>
        ))}
      </ul>
      {readiness.blockingReasons.length > 0 ? (
        <div className={shell.feedInspectorBlockers}>
          <p className={shell.feedInspectorBlockersHeading}>Blocking reasons</p>
          <ul>
            {readiness.blockingReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {readiness.warnings.length > 0 ? (
        <div className={shell.feedInspectorWarnings}>
          <p className={shell.feedInspectorWarningsHeading}>Lane warnings</p>
          <ul>
            {readiness.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ScheduleSection(props: {
  readonly entries: FeedInspectorViewModel['schedule'];
}): React.ReactNode {
  return (
    <section
      className={shell.feedInspectorSection}
      aria-label="Schedule"
      data-feed-inspector-section="schedule"
    >
      <h4 className={shell.feedInspectorSectionHeading}>Schedule</h4>
      <dl className={shell.feedInspectorScheduleList}>
        {props.entries.map((entry) => (
          <div key={entry.source}>
            <dt>{entry.label}</dt>
            <dd>{entry.window}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PreviewSection(props: {
  readonly preview: FeedInspectorViewModel['preview'];
  readonly onOpenFoleon: () => void;
}): React.ReactNode {
  const { preview } = props;
  return (
    <section
      className={shell.feedInspectorSection}
      aria-label="Preview"
      data-feed-inspector-section="preview"
    >
      <h4 className={shell.feedInspectorSectionHeading}>Preview</h4>
      <dl className={shell.feedInspectorPreviewList}>
        <div>
          <dt>Open mode</dt>
          <dd>{preview.openMode}</dd>
        </div>
        <div>
          <dt>Published URL</dt>
          <dd>{preview.publishedUrl ?? 'Not listed'}</dd>
        </div>
        <div>
          <dt>Embed URL</dt>
          <dd>{preview.embedUrl ?? 'Not listed'}</dd>
        </div>
      </dl>
      <span data-feed-inspector-preview-action="open-foleon">
        <HbcButton
          variant="secondary"
          onClick={preview.canOpenFoleon ? props.onOpenFoleon : undefined}
          disabled={!preview.canOpenFoleon}
          aria-describedby={
            preview.canOpenFoleon ? undefined : 'feed-inspector-open-foleon-reason'
          }
        >
          <ExternalLink size={16} className={shell.buttonIcon} aria-hidden />
          Open Foleon
        </HbcButton>
      </span>
      {preview.openFoleonDisabledReason ? (
        <p
          id="feed-inspector-open-foleon-reason"
          className={shell.feedInspectorPreviewReason}
        >
          {preview.openFoleonDisabledReason}
        </p>
      ) : null}
    </section>
  );
}
