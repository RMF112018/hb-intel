/**
 * @hbc/app-shell — PWA facade combining shell, auth, and ui-kit
 * PH4B.2 §Step 4 | Blueprint §1d, §1f
 *
 * Single import point for PWA pages needing shell + auth + UI components.
 */

// Shell navigation & stores
export {
  useProjectStore,
  useNavStore,
  HeaderBar,
  AppLauncher,
  ProjectPicker,
  BackToProjectHub,
  ContextualSidebar,
  ShellLayout,
  WORKSPACE_IDS,
} from '@hbc/shell';

export type {
  ProjectState,
  NavState,
  HeaderBarProps,
  AppLauncherProps,
  ProjectPickerProps,
  BackToProjectHubProps,
  ContextualSidebarProps,
  ShellLayoutProps,
  WorkspaceId,
  ToolPickerItem,
  SidebarItem,
  WorkspaceDescriptor,
} from '@hbc/shell';

// Module configs (from shell)
export {
  scorecardsLanding,
  scorecardsDetail,
  rfisLanding,
  rfisDetail,
  punchListLanding,
  punchListDetail,
  drawingsLanding,
  disciplineFilters,
  budgetLanding,
  dailyLogSections,
  dailyLogVoiceFields,
  turnoverLanding,
  turnoverDetail,
  turnoverTearsheetSteps,
  documentsLanding,
} from '@hbc/shell';

export type {
  ModuleTableConfig,
  ModuleLandingConfig,
  ModuleDetailConfig,
} from '@hbc/shell';

// UI-kit shell components
export {
  HbcAppShell,
  HbcConnectivityBar,
  HbcHeader,
  HbcSidebar,
  HbcProjectSelector,
  HbcToolboxFlyout,
  HbcFavoriteTools,
  HbcGlobalSearch,
  HbcCreateButton,
  HbcNotificationBell,
  HbcUserMenu,
} from '@hbc/ui-kit';

export type {
  HbcAppShellProps,
  HbcHeaderProps,
  HbcSidebarProps,
  HbcConnectivityBarProps,
  HbcUserMenuProps,
  HbcProjectSelectorProps,
  HbcToolboxFlyoutProps,
  HbcFavoriteToolsProps,
  HbcGlobalSearchProps,
  HbcCreateButtonProps,
  HbcNotificationBellProps,
} from '@hbc/ui-kit';

// WorkspacePageShell
export { WorkspacePageShell, ListConfigContext } from '@hbc/ui-kit';
export type {
  WorkspacePageShellProps,
  PageLayout,
  BannerConfig,
  ListConfig,
  FilterDef,
  BulkAction,
} from '@hbc/ui-kit';

// Auth adapter
export { useShellAuth } from './useShellAuth.js';
export type { ShellAuthContext } from './useShellAuth.js';
