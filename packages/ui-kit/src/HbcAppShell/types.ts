/**
 * HbcAppShell — Type definitions
 * PH4.4 §Step 1 | Blueprint §1f, §2c
 */
import type { ReactNode } from 'react';
import type { ShellStatusAction, ShellStatusSnapshot } from '@hbc/shell';

/** Connectivity status for the ambient bar */
export type ConnectivityStatus = 'online' | 'syncing' | 'offline';

/** Props for the 2px connectivity bar */
export interface HbcConnectivityBarProps {
  /** Override auto-detected status (useful in Storybook) */
  status?: ConnectivityStatus;
  /** Unified shell-status snapshot (Phase 5.6 canonical path). */
  shellStatus?: ShellStatusSnapshot;
  /** Approved shell-status action callback. */
  onShellAction?: (action: ShellStatusAction) => void;
}

/** A navigation item within a sidebar group */
export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  isFavorite?: boolean;
  /** Permission required to see this item. Hidden (not disabled) if not met. PH4B.5 §4b.5.4 */
  requiredPermission?: string;
}

/** A group of navigation items in the sidebar */
export interface SidebarNavGroup {
  id: string;
  label: string;
  requiredPermission?: string;
  items: SidebarNavItem[];
}

/** Props for the collapsible sidebar */
export interface HbcSidebarProps {
  groups: SidebarNavGroup[];
  activeItemId?: string;
  onNavigate?: (href: string) => void;
  onToggleFavorite?: (itemId: string) => void;
}

/** User info passed to header components */
export interface ShellUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
}

/** Props for the dark header bar */
export interface HbcHeaderProps {
  user?: ShellUser | null;
  logo?: ReactNode;
  onSignOut?: () => void;
  onCreateClick?: () => void;
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
  /** Live unread/blocked notification count for the bell badge. 0 = badge hidden. */
  notificationCount?: number;
  onProjectSelect?: (projectId: string) => void;
  onToolboxOpen?: () => void;
  /** Extra content rendered inside the user menu dropdown, above Sign Out. Dev tooling slot. */
  userMenuExtra?: ReactNode;
  /**
   * When false the project selector is hidden from the header.
   * Use on pages that are not scoped to a single project (e.g. My Work).
   * Defaults to true.
   */
  showProjectSelector?: boolean;
}

/** Props for the user menu dropdown */
export interface HbcUserMenuProps {
  user: ShellUser;
  isFieldMode: boolean;
  onToggleFieldMode: () => void;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  /** Extra content rendered inside the dropdown above Sign Out. Intended for dev tooling. */
  userMenuExtra?: ReactNode;
}

/** Props for the full application shell orchestrator */
export interface HbcAppShellProps {
  children: ReactNode;
  user?: ShellUser | null;
  sidebarGroups: SidebarNavGroup[];
  mode?: 'pwa' | 'spfx';
  /** Active sidebar/bottom-nav item id for highlight — PH4.14.5 */
  activeItemId?: string;
  onSignOut?: () => void;
  onNavigate?: (href: string) => void;
  /** Extra content rendered inside the user menu dropdown, above Sign Out. Dev tooling slot. */
  userMenuExtra?: ReactNode;
  /**
   * When false the project selector is hidden from the header.
   * Use on pages that are not scoped to a single project (e.g. My Work).
   * Defaults to true.
   */
  showProjectSelector?: boolean;
}

/** Props for the project selector */
export interface HbcProjectSelectorProps {
  onProjectSelect?: (projectId: string) => void;
}

/** Props for the toolbox flyout */
export interface HbcToolboxFlyoutProps {
  onToolboxOpen?: () => void;
}

/** Props for favorite tools strip */
export interface HbcFavoriteToolsProps {
  items?: SidebarNavItem[];
}

/** Props for global search */
export interface HbcGlobalSearchProps {
  onSearchOpen?: () => void;
}

/** Props for the create button */
export interface HbcCreateButtonProps {
  onClick?: () => void;
}

/** Props for the notification bell */
export interface HbcNotificationBellProps {
  unreadCount?: number;
  onClick?: () => void;
}
