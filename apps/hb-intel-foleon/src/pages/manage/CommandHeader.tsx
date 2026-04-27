import { HbcButton } from '@hbc/ui-kit/homepage';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowLeft, BarChart3, ClipboardCheck, ExternalLink, LayoutGrid, RefreshCw } from 'lucide-react';
import type { ManagerStatusChip } from './manageHeaderStatusModel.js';
import shell from './manageShell.module.css';

export interface CommandHeaderProps {
  readonly onBack: () => void;
  readonly onSyncDocs: () => void;
  readonly onSyncProjects: () => void;
  readonly canSync?: boolean;
  readonly syncBlockReason?: string;
  readonly onReviewNewContent: () => void;
  readonly onManagePlacements: () => void;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason?: string;
  readonly onAdminDiagnostics: () => void;
  readonly statusChips: ReadonlyArray<ManagerStatusChip>;
}

export function CommandHeader(props: CommandHeaderProps): React.ReactNode {
  return (
    <header className={shell.header}>
      <div className={shell.headerIntro}>
        <p className={shell.kicker}>Marketing Operations</p>
        <h2 className={shell.title}>Foleon Content Operations</h2>
        <p className={shell.subtitle}>
          Run the homepage Foleon program: sync, review, place, and publish from one console.
        </p>
      </div>
      <div className={shell.headerActions}>
        <fieldset className={shell.commandGroup} disabled={props.canSync === false}>
          <legend className={shell.commandGroupLegend}>Sync from Foleon</legend>
          <div className={shell.commandGroupButtons}>
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
        <div className={shell.commandGroup}>
          <p className={shell.commandGroupLegend}>Operate</p>
          <div className={shell.commandGroupButtons}>
            <HbcButton variant="secondary" onClick={props.onReviewNewContent}>
              <ClipboardCheck size={16} className={shell.buttonIcon} aria-hidden />
              Review new content
            </HbcButton>
            <HbcButton variant="secondary" onClick={props.onManagePlacements}>
              <LayoutGrid size={16} className={shell.buttonIcon} aria-hidden />
              Manage placements
            </HbcButton>
          </div>
        </div>
        <div className={shell.commandGroup}>
          <p className={shell.commandGroupLegend}>Source &amp; admin</p>
          <div className={shell.commandGroupButtons}>
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
            <HbcButton variant="secondary" onClick={props.onAdminDiagnostics}>
              <BarChart3 size={16} className={shell.buttonIcon} aria-hidden />
              Admin diagnostics
            </HbcButton>
            <HbcButton variant="secondary" onClick={props.onBack}>
              <ArrowLeft size={16} className={shell.buttonIcon} aria-hidden />
              Back
            </HbcButton>
          </div>
        </div>
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
