import { create } from 'zustand';
import { NAV_ITEMS } from '../module-configs/nav-config.js';
import type { WorkspaceId, ToolPickerItem, SidebarItem } from '../types.js';
import { WORKSPACE_IDS } from '../types.js';

/**
 * Minimal TanStack-compatible history surface used by D-04 synchronization.
 * The store stays router-library agnostic by consuming only `location` + `subscribe`.
 */
export interface RouterHistoryLike {
  location: { pathname: string };
  subscribe: (listener: () => void) => () => void;
}

/**
 * Router-derived nav snapshot used by store sync and tests.
 */
export interface NavRouteState {
  activeWorkspace: WorkspaceId | null;
  activeItemId?: string;
}

const NAV_ITEMS_BY_PATH = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);

let navSyncUnsubscribe: (() => void) | null = null;

function matchesPath(pathname: string, routePath: string): boolean {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

/**
 * D-04 source of truth:
 * 1) Prefer canonical NAV_ITEMS path matches for active workspace/item resolution.
 * 2) Fall back to workspace root segment matching for routes without sidebar item entries.
 * 3) Unmatched paths clear active workspace/item instead of forcing a default.
 */
export function resolveNavRouteState(pathname: string): NavRouteState {
  const matchedItem = NAV_ITEMS_BY_PATH.find((item) => matchesPath(pathname, item.path));
  if (matchedItem) {
    return { activeWorkspace: matchedItem.workspace, activeItemId: matchedItem.key };
  }

  const [rootSegment] = pathname.split('/').filter(Boolean);
  const workspaceFromRoot = WORKSPACE_IDS.find((workspaceId) => workspaceId === rootSegment) ?? null;
  return { activeWorkspace: workspaceFromRoot, activeItemId: undefined };
}

export interface NavState {
  activeWorkspace: WorkspaceId | null;
  activeItemId?: string;
  toolPickerItems: ToolPickerItem[];
  sidebarItems: SidebarItem[];
  isSidebarOpen: boolean;
  isAppLauncherOpen: boolean;
  setActiveWorkspace: (workspace: WorkspaceId | null) => void;
  setActiveItemId: (itemId?: string) => void;
  setToolPickerItems: (items: ToolPickerItem[]) => void;
  setSidebarItems: (items: SidebarItem[]) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setAppLauncherOpen: (open: boolean) => void;
  toggleAppLauncher: () => void;
  syncFromPathname: (pathname: string) => void;
  startNavSync: (history: RouterHistoryLike) => void;
  stopNavSync: () => void;
}

/**
 * Zustand store for navigation state — Blueprint §2c, §2e.
 * setActiveWorkspace atomically clears tool-picker and sidebar items
 * to prevent stale nav flash between workspace transitions.
 */
export const useNavStore = create<NavState>((set) => ({
  activeWorkspace: null,
  activeItemId: undefined,
  toolPickerItems: [],
  sidebarItems: [],
  isSidebarOpen: true,
  isAppLauncherOpen: false,
  setActiveWorkspace: (activeWorkspace) =>
    set({ activeWorkspace, activeItemId: undefined, toolPickerItems: [], sidebarItems: [] }),
  setActiveItemId: (activeItemId) => set({ activeItemId }),
  setToolPickerItems: (toolPickerItems) => set({ toolPickerItems }),
  setSidebarItems: (sidebarItems) => set({ sidebarItems }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setAppLauncherOpen: (isAppLauncherOpen) => set({ isAppLauncherOpen }),
  toggleAppLauncher: () => set((s) => ({ isAppLauncherOpen: !s.isAppLauncherOpen })),
  syncFromPathname: (pathname) => {
    const { activeWorkspace, activeItemId } = resolveNavRouteState(pathname);
    set({ activeWorkspace, activeItemId });
  },
  startNavSync: (history) => {
    if (navSyncUnsubscribe) {
      navSyncUnsubscribe();
      navSyncUnsubscribe = null;
    }

    const sync = () => {
      const { syncFromPathname } = useNavStore.getState();
      syncFromPathname(history.location.pathname);
    };

    sync();
    navSyncUnsubscribe = history.subscribe(sync);
  },
  stopNavSync: () => {
    if (navSyncUnsubscribe) {
      navSyncUnsubscribe();
      navSyncUnsubscribe = null;
    }
  },
}));
