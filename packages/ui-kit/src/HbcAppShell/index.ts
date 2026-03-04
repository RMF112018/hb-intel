// HbcAppShell — Barrel export
// PH4.4 §Step 7 | Blueprint §1f, §2c

// Components
export { HbcConnectivityBar } from './HbcConnectivityBar.js';
export { HbcHeader } from './HbcHeader.js';
export { HbcProjectSelector } from './HbcProjectSelector.js';
export { HbcToolboxFlyout } from './HbcToolboxFlyout.js';
export { HbcFavoriteTools } from './HbcFavoriteTools.js';
export { HbcGlobalSearch } from './HbcGlobalSearch.js';
export { HbcCreateButton } from './HbcCreateButton.js';
export { HbcNotificationBell } from './HbcNotificationBell.js';
export { HbcUserMenu } from './HbcUserMenu.js';
export { HbcSidebar } from './HbcSidebar.js';
export { HbcAppShell } from './HbcAppShell.js';

// Hooks
export { useOnlineStatus, useFieldMode, useSidebarState, useKeyboardShortcut } from './hooks/index.js';
export type { UseFieldModeReturn } from './hooks/index.js';
export type { UseSidebarStateReturn } from './hooks/index.js';

// Types
export type {
  ConnectivityStatus,
  HbcConnectivityBarProps,
  SidebarNavItem,
  SidebarNavGroup,
  HbcSidebarProps,
  ShellUser,
  HbcHeaderProps,
  HbcUserMenuProps,
  HbcAppShellProps,
  HbcProjectSelectorProps,
  HbcToolboxFlyoutProps,
  HbcFavoriteToolsProps,
  HbcGlobalSearchProps,
  HbcCreateButtonProps,
  HbcNotificationBellProps,
} from './types.js';
