import { HbcButton } from '@hbc/ui-kit/homepage';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import shell from './manageShell.module.css';

export function ManageShellHeader(props: {
  readonly onBack: () => void;
  readonly onSyncDocs: () => void;
  readonly onSyncProjects: () => void;
  readonly canSync?: boolean;
  readonly syncBlockReason?: string;
}): React.ReactNode {
  return (
    <header className={shell.header}>
      <div>
        <p className={shell.kicker}>Governed Marketing Operations</p>
        <h2 className={shell.title}>Foleon Connector</h2>
        <p className={shell.subtitle}>
          Manage registry metadata, reader validation, homepage placements, and backend sync proof without opening
          the SharePoint lists directly.
        </p>
      </div>
      <div className={shell.actions}>
        <HbcButton variant="secondary" onClick={props.onBack}>
          <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
          Back to highlights
        </HbcButton>
        <HbcButton variant="primary" disabled={props.canSync === false} onClick={props.onSyncDocs}>
          <RefreshCw size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
          {props.canSync === false ? 'Sync blocked' : 'Sync Docs'}
        </HbcButton>
        <HbcButton variant="secondary" disabled={props.canSync === false} onClick={props.onSyncProjects}>
          Sync Projects
        </HbcButton>
      </div>
      {props.canSync === false ? (
        <p className={shell.syncBlockReason}>Sync readiness: {props.syncBlockReason ?? 'sync path is not ready'}.</p>
      ) : null}
    </header>
  );
}
