import { useEffect, useId, useRef } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import { X } from 'lucide-react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
import {
  buildPublishChecklist,
  type PublishChecklistItem,
} from './manageLaneViewModel.js';
import {
  buildReaderLaneWarnings,
  readerLaneForContent,
  readerLaneLabel,
  toContentMutation,
} from './manageMutationUtils.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export interface ContextualWorkflowPanelProps {
  readonly contract: IFoleonRuntimeContract;
  readonly open: boolean;
  readonly record: FoleonManagedContent | null;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
  readonly canWrite: boolean;
  readonly writeBlockReason: string;
  readonly onClose: () => void;
  /** Element to return focus to when the panel closes (typically the inbox row trigger). */
  readonly returnFocusRef: React.MutableRefObject<HTMLElement | null>;
}

/**
 * Slide-over workflow panel.
 *
 * Keyboard / focus discipline:
 *  - Opens only when triggered by a real button (the orchestrator calls this with a record).
 *  - On open, focuses the panel close button so keyboard users land in-panel.
 *  - Esc closes the panel.
 *  - Backdrop click closes the panel.
 *  - On close, focus returns to `returnFocusRef.current` (the row that opened it).
 *  - Non-modal: does NOT trap focus; users can Tab back to the page if needed.
 *    The trigger row remains in the tab order so focus return is unambiguous.
 *
 * The panel never silently no-ops: action buttons call the same governed workflows used
 * by the rest of the manager, which already report results via setMessage.
 */
export function ContextualWorkflowPanel(props: ContextualWorkflowPanelProps): React.ReactNode {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousOpenRef = useRef(false);

  useEffect(() => {
    if (!props.open) {
      if (previousOpenRef.current) {
        const target = props.returnFocusRef.current;
        if (target && typeof target.focus === 'function') {
          target.focus();
        }
      }
      previousOpenRef.current = false;
      return;
    }

    previousOpenRef.current = true;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        props.onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return (): void => document.removeEventListener('keydown', onKeyDown, true);
  }, [props.open, props.onClose, props.returnFocusRef]);

  if (!props.open || !props.record) return null;

  const lane = readerLaneForContent(props.record);
  const placement = props.placements.find((entry) => entry.foleonDocId === props.record?.foleonDocId);
  const warnings = buildReaderLaneWarnings({
    draft: toContentMutation(props.record),
    record: props.record,
    allContent: props.content,
    placements: props.placements,
  });
  const blockingReasons = Array.from(
    new Set([...(props.record.blockingReasons ?? []), ...warnings]),
  );

  const checklist = buildPublishChecklist({
    record: props.record,
    placement,
    readiness: props.contract.foleonReadiness,
    warnings: blockingReasons,
  });

  return (
    <>
      <div
        className={shell.workflowPanelOverlay}
        aria-hidden
        onClick={props.onClose}
      />
      <aside
        className={shell.workflowPanel}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-foleon-workflow-panel="open"
      >
        <header className={shell.workflowPanelHeader}>
          <div>
            <p className={f.guidanceKicker}>Workflow</p>
            <h3 id={titleId} className={f.sectionTitle}>{props.record.title}</h3>
            <p className={f.metaMuted}>
              {props.record.publishStatus} · {props.record.validationStatus}
              {lane ? ` · ${lane}` : ''}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={shell.workflowPanelCloseButton}
            aria-label="Close workflow panel"
            onClick={props.onClose}
          >
            <X size={18} aria-hidden />
          </button>
        </header>

        <div className={shell.workflowPanelBody}>
          <WorkflowSection title="Validation and blockers">
            <BlockingReasonsList reasons={blockingReasons} />
          </WorkflowSection>

          <ManagePlacementPanel
            content={props.content}
            placements={props.placements}
            api={props.api}
            onRefresh={props.onRefresh}
            setMessage={props.setMessage}
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockReason}
            focusedLane={lane ?? undefined}
            focusedLaneLabel={lane ? readerLaneLabel(lane) : undefined}
            focusedPlacementKey={placement?.placementKey}
            focusedContent={props.record}
          />

          <WorkflowSection title="Publish readiness">
            <PublishReadinessChecklist items={checklist} />
          </WorkflowSection>

          <ManageContentEditorPanel
            record={props.record}
            allContent={props.content}
            placements={props.placements}
            api={props.api}
            onRefresh={props.onRefresh}
            setMessage={props.setMessage}
            originPolicy={props.contract.originPolicy}
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockReason}
          />
        </div>
      </aside>
    </>
  );
}

function WorkflowSection(props: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.ReactNode {
  return (
    <section className={shell.workflowPanelSection} aria-label={props.title}>
      <h4 className={shell.workflowPanelSectionTitle}>{props.title}</h4>
      {props.children}
    </section>
  );
}

function BlockingReasonsList(props: { readonly reasons: ReadonlyArray<string> }): React.ReactNode {
  if (props.reasons.length === 0) {
    return <p className={f.validationOk}>No active blockers.</p>;
  }
  return (
    <ul className={f.validationBad}>
      {props.reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}

function PublishReadinessChecklist(props: {
  readonly items: ReadonlyArray<PublishChecklistItem>;
}): React.ReactNode {
  if (props.items.length === 0) return null;
  return (
    <ul className={shell.workflowChecklist} role="list">
      {props.items.map((item) => (
        <li
          key={item.label}
          className={shell.workflowChecklistItem}
          data-check-status={item.status}
        >
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}
