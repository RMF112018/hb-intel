import { create } from 'zustand';
import type { WorkspaceId, ToolPickerItem, SidebarItem } from '../types.js';

export interface NavState {
  activeWorkspace: WorkspaceId | null;
  toolPickerItems: ToolPickerItem[];
  sidebarItems: SidebarItem[];
  isSidebarOpen: boolean;
  isAppLauncherOpen: boolean;
  setActiveWorkspace: (workspace: WorkspaceId | null) => void;
  setToolPickerItems: (items: ToolPickerItem[]) => void;
  setSidebarItems: (items: SidebarItem[]) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setAppLauncherOpen: (open: boolean) => void;
  toggleAppLauncher: () => void;
}

/**
 * Zustand store for navigation state — Blueprint §2c, §2e.
 * setActiveWorkspace atomically clears tool-picker and sidebar items
 * to prevent stale nav flash between workspace transitions.
 */
export const useNavStore = create<NavState>((set) => ({
  activeWorkspace: null,
  toolPickerItems: [],
  sidebarItems: [],
  isSidebarOpen: true,
  isAppLauncherOpen: false,
  setActiveWorkspace: (activeWorkspace) =>
    set({ activeWorkspace, toolPickerItems: [], sidebarItems: [] }),
  setToolPickerItems: (toolPickerItems) => set({ toolPickerItems }),
  setSidebarItems: (sidebarItems) => set({ sidebarItems }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setAppLauncherOpen: (isAppLauncherOpen) => set({ isAppLauncherOpen }),
  toggleAppLauncher: () => set((s) => ({ isAppLauncherOpen: !s.isAppLauncherOpen })),
}));
