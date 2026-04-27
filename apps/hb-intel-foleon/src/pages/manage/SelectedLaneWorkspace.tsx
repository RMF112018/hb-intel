import { HbcButton } from '@hbc/ui-kit/homepage';
import { motion } from 'motion/react';
import * as Separator from '@radix-ui/react-separator';
import { clsx } from 'clsx';
import { ArrowUpRight, CalendarDays, CheckCircle2, CircleAlert, Clock3, FileText, ShieldCheck } from 'lucide-react';
import { isAllowedFoleonUrl } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { FoleonEmpty } from '../../components/FoleonStates.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import type { FoleonLaneViewModel, PublishChecklistItem } from './manageLaneViewModel.js';
import { displayLaneState, laneStateConsumerHint, placementStatusPlain } from './manageLaneViewModel.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export function SelectedLaneWorkspace(props: {
  readonly contract: IFoleonRuntimeContract;
  readonly laneVm: FoleonLaneViewModel;
  readonly selected: FoleonManagedContent | null;
  readonly checklist: ReadonlyArray<PublishChecklistItem>;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
  readonly canWrite: boolean;
  readonly writeBlockMessage: string;
}): React.ReactNode {
  const active = props.laneVm.activeContent;
  const staged = props.laneVm.stagedContent;
  const displayWindow = formatWindow(props.laneVm.placement);
  const placementStatus = placementStatusPlain(props.laneVm.placement);
  return (
    <motion.section
      className={shell.selectedLaneWorkspace}
      aria-label={`${props.laneVm.label} workspace`}
      key={props.laneVm.lane}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className={shell.workspaceHero}>
        <div>
          <p className={f.guidanceKicker}>Selected lane</p>
          <h3 className={shell.workspaceTitle}>{props.laneVm.label}</h3>
          <p className={shell.workspaceLead}>{laneStateConsumerHint(props.laneVm.state)}</p>
        </div>
        <div className={shell.workspaceStatusCluster}>
          <span className={shell.workspaceStateBadge} data-lane-state={props.laneVm.state}>
            {displayLaneState(props.laneVm.state)}
          </span>
          <span className={shell.workspacePlacementBadge}>{placementStatus}</span>
        </div>
      </div>
      {props.canWrite ? null : (
        <div className={shell.writePathNotice} role="status" id="foleon-manage-workspace-write-reason">
          <ShieldCheck size={17} aria-hidden />
          <span>{props.writeBlockMessage}</span>
        </div>
      )}
      <div className={shell.laneEditionGrid} aria-label="Current live and staged content">
        <LaneEditionCard
          label="Current live edition"
          icon={<FileText size={18} />}
          record={active}
          empty="No live edition is loaded for this lane."
        />
        <LaneEditionCard
          label="Staged or draft content"
          icon={<Clock3 size={18} />}
          record={staged}
          empty={active ? 'No separate staged record is queued.' : 'Sync content to stage a lane record.'}
        />
        <div className={shell.laneOperationalCard}>
          <span className={shell.cardIconLabel}>
            <CalendarDays size={18} aria-hidden />
            Display window
          </span>
          <strong>{displayWindow}</strong>
          <small>Placement key: {props.laneVm.placementKey}</small>
        </div>
      </div>
      <Separator.Root className={shell.workspaceSeparator} decorative orientation="horizontal" />
      {!props.selected ? (
        <div className={shell.workspaceEmptyState}>
          <FoleonEmpty
            title="No content record loaded for this lane"
            description="The lane structure is ready. Sync Foleon Docs or wait for API approval to populate editable content for this homepage lane."
          />
        </div>
      ) : null}
      {props.selected ? (
        <>
          <PublishReadinessChecklist items={props.checklist} />
          <div className={f.flexToolbar} aria-label="Quick actions">
            {safeProductionUrl(props.selected.publishedUrl, props.contract) ? (
              <HbcButton
                variant="secondary"
                onClick={(): void => {
                  window.open(props.selected?.publishedUrl ?? '', '_blank', 'noopener,noreferrer');
                }}
              >
                <ArrowUpRight size={16} className={shell.buttonIcon} aria-hidden />
                Open Foleon
              </HbcButton>
            ) : null}
          </div>
          <ManageContentEditorPanel
            record={props.selected}
            allContent={props.content}
            placements={props.placements}
            api={props.api}
            onRefresh={props.onRefresh}
            setMessage={props.setMessage}
            originPolicy={props.contract.originPolicy}
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockMessage}
          />
        </>
      ) : null}
    </motion.section>
  );
}

function PublishReadinessChecklist(props: { readonly items: ReadonlyArray<PublishChecklistItem> }): React.ReactNode {
  if (props.items.length === 0) return null;
  return (
    <section className={shell.publishChecklistPanel} aria-label="Publish readiness checklist">
      <div className={shell.panelTitleRow}>
        <CheckCircle2 size={18} aria-hidden />
        <h3 className={f.sectionTitle}>Publish readiness checklist</h3>
      </div>
      <div className={shell.checkGrid}>
        {props.items.map((item) => (
          <div key={item.label} className={clsx(shell.checkItem, item.status === 'pass' ? shell.checkPass : shell.checkBlocked)} data-check-status={item.status}>
            <strong>{item.label}</strong>
            <span>
              {item.status === 'pass' ? <CheckCircle2 size={14} aria-hidden /> : <CircleAlert size={14} aria-hidden />}
              {item.status === 'pass' ? 'Pass' : item.status === 'warning' ? 'Warning' : 'Blocked'}
            </span>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function LaneEditionCard(props: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly record?: FoleonManagedContent;
  readonly empty: string;
}): React.ReactNode {
  return (
    <article className={shell.laneOperationalCard}>
      <span className={shell.cardIconLabel}>
        <span aria-hidden>{props.icon}</span>
        {props.label}
      </span>
      <strong>{props.record?.title ?? 'Not loaded'}</strong>
      <small>
        {props.record
          ? `${props.record.publishStatus} · Doc ${props.record.foleonDocId} · ${props.record.validationStatus}`
          : props.empty}
      </small>
    </article>
  );
}

function formatWindow(placement: FoleonPlacement | undefined): string {
  if (!placement) return 'Not set';
  return `${placement.displayFrom ?? 'Now'} to ${placement.displayThrough ?? 'Open'}`;
}

function safeProductionUrl(url: string | undefined, contract: IFoleonRuntimeContract): boolean {
  return Boolean(url && isAllowedFoleonUrl(contract.originPolicy, url).allowed);
}
