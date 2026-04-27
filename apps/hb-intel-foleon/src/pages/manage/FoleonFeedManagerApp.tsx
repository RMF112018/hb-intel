import { FeedManagerHeader } from './FeedManagerHeader.js';
import { FeedManagerNav } from './FeedManagerNav.js';
import {
  feedManagerNavButtonId,
  feedManagerNavPanelId,
  type FeedManagerHeaderModel,
  type FeedManagerWorkspaceKey,
} from './feedManagerViewModel.js';
import shell from './manageShell.module.css';

export interface FoleonFeedManagerAppProps {
  readonly selectedKey: FeedManagerWorkspaceKey;
  readonly onSelectKey: (key: FeedManagerWorkspaceKey) => void;
  readonly headerModel: FeedManagerHeaderModel;
  readonly tokenDegradedBanner?: React.ReactNode;
  readonly statusBanner?: React.ReactNode;
  readonly feedDeskBody: React.ReactNode;
  readonly adminPanel: React.ReactNode;
}

export function FoleonFeedManagerApp(props: FoleonFeedManagerAppProps): React.ReactNode {
  return (
    <div className={shell.feedManagerShell}>
      <FeedManagerHeader model={props.headerModel} />
      {props.tokenDegradedBanner}
      {props.statusBanner}
      <FeedManagerNav selected={props.selectedKey} onSelect={props.onSelectKey} />
      {props.selectedKey === 'feed-desk' ? <FeedDeskPanel>{props.feedDeskBody}</FeedDeskPanel> : null}
      {props.selectedKey === 'schedule' ? <SchedulePanel /> : null}
      {props.selectedKey === 'preview' ? <PreviewPanel /> : null}
      {props.selectedKey === 'admin' ? <AdminPanel>{props.adminPanel}</AdminPanel> : null}
    </div>
  );
}

function workspacePanelProps(key: FeedManagerWorkspaceKey): {
  readonly role: 'tabpanel';
  readonly id: string;
  readonly 'aria-labelledby': string;
  readonly 'data-feed-manager-workspace': string;
} {
  return {
    role: 'tabpanel',
    id: feedManagerNavPanelId(key),
    'aria-labelledby': feedManagerNavButtonId(key),
    'data-feed-manager-workspace': key,
  };
}

function FeedDeskPanel(props: { readonly children: React.ReactNode }): React.ReactNode {
  return (
    <section
      {...workspacePanelProps('feed-desk')}
      aria-label="Feed Desk"
      className={shell.feedDeskPanel}
    >
      {props.children}
    </section>
  );
}

function SchedulePanel(): React.ReactNode {
  return (
    <section
      {...workspacePanelProps('schedule')}
      aria-label="Schedule"
      className={shell.workspacePanel}
    >
      <header className={shell.workspacePanelHeader}>
        <h3 className={shell.workspacePanelHeading}>Schedule</h3>
        <p className={shell.workspacePanelIntro}>
          Display windows for placed Foleon content appear here.
        </p>
      </header>
      <div className={shell.workspacePanelBody}>
        <p className={shell.feedDeskEmpty}>No scheduled content yet.</p>
      </div>
    </section>
  );
}

function PreviewPanel(): React.ReactNode {
  return (
    <section
      {...workspacePanelProps('preview')}
      aria-label="Preview"
      className={shell.workspacePanel}
    >
      <header className={shell.workspacePanelHeader}>
        <h3 className={shell.workspacePanelHeading}>Preview</h3>
        <p className={shell.workspacePanelIntro}>
          Employee-facing preview of placed Foleon content. Preview is unavailable until a
          placement is scheduled.
        </p>
      </header>
    </section>
  );
}

function AdminPanel(props: { readonly children: React.ReactNode }): React.ReactNode {
  return (
    <section
      {...workspacePanelProps('admin')}
      aria-label="Admin"
      className={shell.workspacePanel}
    >
      {props.children}
    </section>
  );
}
