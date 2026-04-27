import type { ManagerStatusChip } from './manageHeaderStatusModel.js';

export type FeedManagerWorkspaceKey = 'feed-desk' | 'schedule' | 'preview' | 'admin';

export interface FeedManagerNavEntry {
  readonly key: FeedManagerWorkspaceKey;
  readonly label: string;
}

export const FEED_MANAGER_NAV_ENTRIES: ReadonlyArray<FeedManagerNavEntry> = [
  { key: 'feed-desk', label: 'Feed Desk' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'preview', label: 'Preview' },
  { key: 'admin', label: 'Admin' },
];

export const FEED_MANAGER_TITLE = 'Foleon Feed Manager';
export const FEED_MANAGER_SUBTITLE =
  'Place Foleon-produced content into HB Central feeds, schedule display windows, and validate what employees will see.';

export function feedManagerNavButtonId(key: FeedManagerWorkspaceKey): string {
  return `foleon-feed-manager-nav-${key}`;
}

export function feedManagerNavPanelId(key: FeedManagerWorkspaceKey): string {
  return `foleon-feed-manager-panel-${key}`;
}

export type FeedManagerPrimaryActionId = 'sync-foleon' | 'open-admin-diagnostics';
export type FeedManagerUtilityActionId = 'open-foleon' | 'admin-diagnostics' | 'back';

export interface FeedManagerHeaderPrimaryAction {
  readonly id: FeedManagerPrimaryActionId;
  readonly label: string;
  readonly onClick: () => void;
}

export interface FeedManagerHeaderUtilityAction {
  readonly id: FeedManagerUtilityActionId;
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly disabledReason?: string;
}

export interface FeedManagerHeaderModel {
  readonly title: string;
  readonly subtitle: string;
  readonly primary: FeedManagerHeaderPrimaryAction;
  readonly utility: ReadonlyArray<FeedManagerHeaderUtilityAction>;
  readonly statusChips: ReadonlyArray<ManagerStatusChip>;
}

export interface BuildFeedManagerHeaderModelArgs {
  readonly canSync: boolean;
  readonly tokenAcquisitionDegraded: boolean;
  readonly safeFoleonOpenUrl: string | null;
  readonly openFoleonUnavailableReason?: string;
  readonly statusChips: ReadonlyArray<ManagerStatusChip>;
  readonly onSyncDocs: () => void;
  readonly onOpenAdminDiagnostics: () => void;
  readonly onOpenFoleon: () => void;
  readonly onBack: () => void;
}

/**
 * Pure resolver for the Feed Manager header.
 *
 * Primary action priority:
 *   1) token-acquisition degraded → "Open admin diagnostics"
 *   2) sync path blocked          → "Resolve sync block" (routes to admin)
 *   3) default                    → "Sync from Foleon"
 *
 * Utility actions are visually subordinate. Each utility entry carries a
 * structured disabled reason so disabled paths surface a real explanation
 * rather than a silent no-op.
 */
export function buildFeedManagerHeaderModel(
  args: BuildFeedManagerHeaderModelArgs,
): FeedManagerHeaderModel {
  let primary: FeedManagerHeaderPrimaryAction;
  if (args.tokenAcquisitionDegraded) {
    primary = {
      id: 'open-admin-diagnostics',
      label: 'Open admin diagnostics',
      onClick: args.onOpenAdminDiagnostics,
    };
  } else if (!args.canSync) {
    primary = {
      id: 'open-admin-diagnostics',
      label: 'Resolve sync block',
      onClick: args.onOpenAdminDiagnostics,
    };
  } else {
    primary = {
      id: 'sync-foleon',
      label: 'Sync from Foleon',
      onClick: args.onSyncDocs,
    };
  }

  const utility: ReadonlyArray<FeedManagerHeaderUtilityAction> = [
    {
      id: 'open-foleon',
      label: 'Open Foleon',
      onClick: args.onOpenFoleon,
      disabled: !args.safeFoleonOpenUrl,
      disabledReason: args.safeFoleonOpenUrl
        ? undefined
        : args.openFoleonUnavailableReason ??
          'Open Foleon needs an approved HTTPS viewer origin.',
    },
    {
      id: 'admin-diagnostics',
      label: 'Admin diagnostics',
      onClick: args.onOpenAdminDiagnostics,
      disabled: false,
    },
    {
      id: 'back',
      label: 'Back',
      onClick: args.onBack,
      disabled: false,
    },
  ];

  return {
    title: FEED_MANAGER_TITLE,
    subtitle: FEED_MANAGER_SUBTITLE,
    primary,
    utility,
    statusChips: args.statusChips,
  };
}
