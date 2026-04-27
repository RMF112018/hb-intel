import { HbcButton } from '@hbc/ui-kit/homepage';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowLeft, BarChart3, ExternalLink, RefreshCw } from 'lucide-react';
import type { ManagerStatusChip } from './manageHeaderStatusModel.js';
import shell from './manageShell.module.css';

export function ManageShellHeader(props: {
  readonly onBack: () => void;
  readonly onSyncDocs: () => void;
  readonly onSyncProjects: () => void;
  readonly canSync?: boolean;
  readonly syncBlockReason?: string;
  readonly statusChips: ReadonlyArray<ManagerStatusChip>;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason?: string;
  readonly onViewDiagnostics: () => void;
}): React.ReactNode {
  return (
    <header className={shell.header}>
      <div className={shell.headerIntro}>
        <p className={shell.kicker}>Marketing Operations</p>
        <h2 className={shell.title}>Foleon Manager</h2>
        <p className={shell.subtitle}>
          Manage homepage Foleon editions, lane placement, and publish readiness from one SharePoint-hosted workspace.
        </p>
      </div>
      <div className={shell.headerActions}>
        <fieldset className={shell.syncFieldset} disabled={props.canSync === false}>
          <legend className={shell.syncLegend}>Sync content</legend>
          <div className={shell.syncFieldsetButtons}>
            <HbcButton
              variant="primary"
              disabled={props.canSync === false}
              aria-label={props.canSync === false ? undefined : 'Sync Foleon documents'}
              aria-describedby={props.canSync === false ? 'foleon-manage-sync-readiness' : undefined}
              onClick={props.onSyncDocs}
            >
              <RefreshCw size={16} className={shell.buttonIcon} aria-hidden />
              {props.canSync === false ? 'Sync blocked' : 'Sync Docs'}
            </HbcButton>
            <HbcButton
              variant="secondary"
              disabled={props.canSync === false}
              aria-label={props.canSync === false ? undefined : 'Sync Foleon projects'}
              aria-describedby={props.canSync === false ? 'foleon-manage-sync-readiness' : undefined}
              onClick={props.onSyncProjects}
            >
              Sync Projects
            </HbcButton>
          </div>
        </fieldset>
        {props.safeFoleonOpenUrl ? (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span>
                <HbcButton
                  variant="secondary"
                  onClick={(): void => {
                    window.open(props.safeFoleonOpenUrl ?? '', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink size={16} className={shell.buttonIcon} aria-hidden />
                  Open Foleon
                </HbcButton>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={shell.tooltipContent} side="bottom">
                Opens the approved Foleon viewer origin in a new tab.
                <Tooltip.Arrow className={shell.tooltipArrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ) : (
          <span className={shell.actionUnavailable}>
            <HbcButton variant="secondary" disabled>
              Open Foleon
            </HbcButton>
            <span className={shell.actionUnavailableReason}>{props.openFoleonUnavailableReason}</span>
          </span>
        )}
        <HbcButton variant="secondary" onClick={props.onViewDiagnostics}>
          <BarChart3 size={16} className={shell.buttonIcon} aria-hidden />
          View Diagnostics
        </HbcButton>
        <HbcButton variant="secondary" onClick={props.onBack}>
          <ArrowLeft size={16} className={shell.buttonIcon} aria-hidden />
          Back
        </HbcButton>
      </div>
      <div className={shell.headerChips} role="list" aria-label="Manager status">
        {props.statusChips.map((chip) => (
          <div key={chip.id} className={shell.statusChip} role="listitem">
            <span className={shell.statusChipLabel}>{chip.label}</span>
            <span className={shell.statusChipValue}>{chip.value}</span>
          </div>
        ))}
      </div>
      {props.canSync === false ? (
        <p id="foleon-manage-sync-readiness" className={shell.syncBlockReason}>
          Sync readiness: {props.syncBlockReason ?? 'sync path is not ready'}.
        </p>
      ) : null}
    </header>
  );
}
