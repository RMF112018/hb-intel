import { useCallback, useRef } from 'react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { ContentInbox } from './ContentInbox.js';
import { ContextualWorkflowPanel } from './ContextualWorkflowPanel.js';
import { LimitedModeWorkspaceNotice } from './LimitedModeWorkspaceNotice.js';
import { navButtonId, navPanelId } from './ManagerPrimaryNav.js';
import type { ContentInboxBucketId } from './contentInboxViewModel.js';
import { showHomepageLimitedMode } from './manageDegradedCopy.js';
import { plainLanguageWriteBlockReason } from './manageWritePathMessage.js';
import shell from './manageShell.module.css';

export interface ContentOperationsWorkspaceProps {
  readonly contract: IFoleonRuntimeContract;
  readonly managerReadPathProven: boolean;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly selectedId: string | null;
  readonly onSelectRecord: (id: string) => void;
  readonly focusBucketId: ContentInboxBucketId | null;
  readonly onClearFocusBucket: () => void;
  readonly workflowPanelOpen: boolean;
  readonly onOpenWorkflowPanel: () => void;
  readonly onCloseWorkflowPanel: () => void;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}

/**
 * Inbox-led primary workspace that replaces the legacy lane rail / readiness rail /
 * always-visible placement editor composition.
 *
 * Selecting an inbox row opens the contextual workflow panel; closing the panel
 * returns focus to the originating row.
 */
export function ContentOperationsWorkspace(
  props: ContentOperationsWorkspaceProps,
): React.ReactNode {
  const readiness = props.contract.foleonReadiness;
  const canWrite =
    props.contract.hostMode !== 'sharepoint' ||
    (readiness?.writePathReady === true && props.managerReadPathProven);
  const writeBlockReason = plainLanguageWriteBlockReason(
    props.contract,
    props.managerReadPathProven,
  );
  const limitedMode = showHomepageLimitedMode(props.contract, props.managerReadPathProven);

  const returnFocusRef = useRef<HTMLElement | null>(null);

  const selectedRecord = props.content.find((record) => record.id === props.selectedId) ?? null;

  const handleSelectRecord = useCallback(
    (id: string): void => {
      const trigger = document.activeElement;
      if (trigger instanceof HTMLElement) {
        returnFocusRef.current = trigger;
      }
      props.onSelectRecord(id);
      props.onOpenWorkflowPanel();
    },
    [props],
  );

  return (
    <div
      role="tabpanel"
      id={navPanelId('content-operations')}
      aria-labelledby={navButtonId('content-operations')}
      aria-label="Content Operations"
      className={shell.contentOperationsWorkspace}
      data-manager-workspace="content-operations"
    >
      {limitedMode ? (
        <LimitedModeWorkspaceNotice
          writeBlockMessage={writeBlockReason}
          managerReadPathProven={props.managerReadPathProven}
        />
      ) : null}

      <ContentInbox
        content={props.content}
        placements={props.placements}
        selectedId={props.selectedId}
        focusBucketId={props.focusBucketId}
        onSelectRecord={handleSelectRecord}
        onClearFocusBucket={props.onClearFocusBucket}
      />

      <ContextualWorkflowPanel
        contract={props.contract}
        open={props.workflowPanelOpen}
        record={selectedRecord}
        content={props.content}
        placements={props.placements}
        api={props.api}
        onRefresh={props.onRefresh}
        setMessage={props.setMessage}
        canWrite={canWrite}
        writeBlockReason={writeBlockReason}
        onClose={props.onCloseWorkflowPanel}
        returnFocusRef={returnFocusRef}
      />
    </div>
  );
}
