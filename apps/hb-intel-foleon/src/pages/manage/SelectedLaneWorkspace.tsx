import { HbcButton } from '@hbc/ui-kit/homepage';
import { isAllowedFoleonUrl } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { FoleonEmpty } from '../../components/FoleonStates.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
import type { FoleonLaneViewModel, PublishChecklistItem } from './manageLaneViewModel.js';
import { displayLaneState, laneStateConsumerHint } from './manageLaneViewModel.js';
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
  return (
    <section className={shell.selectedLaneWorkspace} aria-label={`${props.laneVm.label} workspace`}>
      <div className={shell.sectionHeaderRow}>
        <div>
          <p className={f.guidanceKicker}>Selected lane</p>
          <h3 className={f.sectionTitle}>{props.laneVm.label}</h3>
          <p className={f.metaMuted}>
            <span>Status: </span>
            <strong>{displayLaneState(props.laneVm.state)}</strong>
            <span> — {laneStateConsumerHint(props.laneVm.state)}</span>
            {props.canWrite ? null : (
              <>
                <span> — </span>
                <span>{props.writeBlockMessage}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {!props.selected ? (
        <FoleonEmpty
          title="No content record for this lane"
          description="Sync or create content for this homepage lane, or choose another lane. You can still manage placements for all lanes below."
        />
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
      <ManagePlacementPanel
        content={props.content}
        placements={props.placements}
        api={props.api}
        onRefresh={props.onRefresh}
        setMessage={props.setMessage}
        canWrite={props.canWrite}
        writeBlockReason={props.writeBlockMessage}
      />
    </section>
  );
}

function PublishReadinessChecklist(props: { readonly items: ReadonlyArray<PublishChecklistItem> }): React.ReactNode {
  if (props.items.length === 0) return null;
  return (
    <section className={f.editorSection} aria-label="Publish readiness checklist">
      <h3 className={f.sectionTitle}>Publish readiness checklist</h3>
      <div className={shell.checkGrid}>
        {props.items.map((item) => (
          <div key={item.label} className={shell.checkItem} data-check-status={item.status}>
            <strong>{item.label}</strong>
            <span>{item.status === 'pass' ? 'Pass' : item.status === 'warning' ? 'Warning' : 'Blocked'}</span>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function safeProductionUrl(url: string | undefined, contract: IFoleonRuntimeContract): boolean {
  return Boolean(url && isAllowedFoleonUrl(contract.originPolicy, url).allowed);
}
