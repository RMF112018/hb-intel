// Types (Blueprint §1f — shell-specific navigation types)
export type {
  WorkspaceId,
  ToolPickerItem,
  SidebarItem,
  WorkspaceDescriptor,
} from './types.js';
export { WORKSPACE_IDS } from './types.js';

// Stores (Blueprint §2e — Zustand exclusively)
export { useProjectStore } from './stores/index.js';
export type { ProjectState } from './stores/index.js';
export { useNavStore } from './stores/index.js';
export type { NavState } from './stores/index.js';

// Components (Blueprint §1f, §2c — Procore-inspired shell)
export { HeaderBar } from './HeaderBar/index.js';
export type { HeaderBarProps } from './HeaderBar/index.js';
export { AppLauncher } from './AppLauncher/index.js';
export type { AppLauncherProps } from './AppLauncher/index.js';
export { ProjectPicker } from './ProjectPicker/index.js';
export type { ProjectPickerProps } from './ProjectPicker/index.js';
export { BackToProjectHub } from './BackToProjectHub/index.js';
export type { BackToProjectHubProps } from './BackToProjectHub/index.js';
export { ContextualSidebar } from './ContextualSidebar/index.js';
export type { ContextualSidebarProps } from './ContextualSidebar/index.js';
export { ShellLayout } from './ShellLayout/index.js';
export type { ShellLayoutProps } from './ShellLayout/index.js';

// Module Configurations (PH4B.2 §Step 3 — moved from ui-kit, F-014)
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
} from './module-configs/index.js';
export type {
  ModuleTableConfig,
  ModuleLandingConfig,
  ModuleDetailConfig,
} from './module-configs/index.js';
