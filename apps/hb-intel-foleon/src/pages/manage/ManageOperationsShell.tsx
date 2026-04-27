import { HbcButton } from '@hbc/ui-kit/homepage';
import { ExternalLink } from 'lucide-react';
import { CommandHeader, type CommandHeaderProps } from './CommandHeader.js';
import {
  ManagerPrimaryNav,
  navButtonId,
  navPanelId,
  type ManagerPrimaryNavKey,
} from './ManagerPrimaryNav.js';
import { StatusSummaryStrip } from './StatusSummaryStrip.js';
import type { ManagerOperationsCount } from './managerOperationsViewModel.js';
import shell from './manageShell.module.css';

export interface ManageOperationsShellProps {
  readonly headerProps: CommandHeaderProps;
  readonly counts: ReadonlyArray<ManagerOperationsCount>;
  readonly selectedNav: ManagerPrimaryNavKey;
  readonly onSelectNav: (key: ManagerPrimaryNavKey) => void;
  readonly onOpenFoleonFromPreview: () => void;
  readonly canOpenFoleon: boolean;
  readonly openFoleonUnavailableReason?: string;
  readonly recommendedAction?: React.ReactNode;
  readonly banners?: React.ReactNode;
  readonly children: React.ReactNode;
}

export function ManageOperationsShell(props: ManageOperationsShellProps): React.ReactNode {
  return (
    <div className={shell.operationsShell}>
      <CommandHeader {...props.headerProps} />
      <StatusSummaryStrip counts={props.counts} />
      {props.recommendedAction}
      {props.banners}
      <ManagerPrimaryNav selected={props.selectedNav} onSelect={props.onSelectNav} />
      {props.selectedNav === 'preview' ? (
        <PreviewPlaceholderPanel
          onUseContentOperations={(): void => props.onSelectNav('content-operations')}
          onOpenFoleon={props.onOpenFoleonFromPreview}
          canOpenFoleon={props.canOpenFoleon}
          openFoleonUnavailableReason={props.openFoleonUnavailableReason}
        />
      ) : null}
      {props.selectedNav !== 'preview' ? props.children : null}
    </div>
  );
}

function PreviewPlaceholderPanel(props: {
  readonly onUseContentOperations: () => void;
  readonly onOpenFoleon: () => void;
  readonly canOpenFoleon: boolean;
  readonly openFoleonUnavailableReason?: string;
}): React.ReactNode {
  return (
    <section
      role="tabpanel"
      id={navPanelId('preview')}
      aria-labelledby={navButtonId('preview')}
      aria-label="Preview"
      className={shell.placeholderPanel}
      data-foleon-placeholder="preview"
    >
      <header className={shell.placeholderHeader}>
        <p className={shell.placeholderKicker}>Workspace</p>
        <h3 className={shell.placeholderTitle}>Preview</h3>
      </header>
      <dl className={shell.placeholderBody}>
        <div>
          <dt>Purpose</dt>
          <dd>
            This workspace will provide employee-facing reader previews before content is activated on
            HB Central.
          </dd>
        </div>
        <div>
          <dt>Current availability</dt>
          <dd>Preview routing is not active in this wave.</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>
            Use Open Foleon for source review and Content Operations for readiness validation until the
            governed reader preview workflow is implemented.
          </dd>
        </div>
      </dl>
      <div className={shell.placeholderActions}>
        {props.canOpenFoleon ? (
          <HbcButton variant="primary" onClick={props.onOpenFoleon}>
            <ExternalLink size={16} className={shell.buttonIcon} aria-hidden />
            Open Foleon
          </HbcButton>
        ) : (
          <span className={shell.actionUnavailable}>
            <HbcButton variant="primary" disabled>
              <ExternalLink size={16} className={shell.buttonIcon} aria-hidden />
              Open Foleon
            </HbcButton>
            {props.openFoleonUnavailableReason ? (
              <span className={shell.actionUnavailableReason}>{props.openFoleonUnavailableReason}</span>
            ) : null}
          </span>
        )}
        <HbcButton variant="secondary" onClick={props.onUseContentOperations}>
          Open Content Operations
        </HbcButton>
      </div>
    </section>
  );
}
