import { HbcButton } from '@hbc/ui-kit/homepage';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
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
          Manage homepage Foleon content, placements, and publishing readiness.
        </p>
      </div>
      <div className={shell.headerActions}>
        <HbcButton variant="secondary" onClick={props.onBack}>
          <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
          Back to highlights
        </HbcButton>
        <fieldset className={shell.syncFieldset} disabled={props.canSync === false}>
          <legend className={shell.syncLegend}>Sync content</legend>
          <div className={shell.syncFieldsetButtons}>
            <HbcButton variant="primary" disabled={props.canSync === false} onClick={props.onSyncDocs}>
              <RefreshCw size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
              {props.canSync === false ? 'Sync blocked' : 'Sync Docs'}
            </HbcButton>
            <HbcButton variant="secondary" disabled={props.canSync === false} onClick={props.onSyncProjects}>
              Sync Projects
            </HbcButton>
          </div>
        </fieldset>
        {props.safeFoleonOpenUrl ? (
          <span title="Opens the approved Foleon viewer origin in a new tab">
            <HbcButton
              variant="secondary"
              onClick={(): void => {
                window.open(props.safeFoleonOpenUrl ?? '', '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
              Open Foleon (site)
            </HbcButton>
          </span>
        ) : (
          <span className={shell.actionUnavailable} title={props.openFoleonUnavailableReason}>
            <HbcButton variant="secondary" disabled>
              Open Foleon (site)
            </HbcButton>
            <span className={shell.actionUnavailableReason}>{props.openFoleonUnavailableReason}</span>
          </span>
        )}
        <HbcButton variant="secondary" onClick={props.onViewDiagnostics}>
          View diagnostics
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
        <p className={shell.syncBlockReason}>Sync readiness: {props.syncBlockReason ?? 'sync path is not ready'}.</p>
      ) : null}
    </header>
  );
}
