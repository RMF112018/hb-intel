/**
 * Panel UI state store — SF29-T04
 * React context + useState. No external state library.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { IMyWorkSavedGrouping } from '../types/index.js';

export interface IMyWorkPanelState {
  isPanelOpen: boolean;
  grouping: IMyWorkSavedGrouping | null;
  expandedGroups: Set<string>;
}

export interface IMyWorkPanelActions {
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setGrouping: (grouping: IMyWorkSavedGrouping | null) => void;
  toggleGroup: (groupKey: string) => void;
}

export type IMyWorkPanelStore = IMyWorkPanelState & IMyWorkPanelActions;

const PanelStoreContext = createContext<IMyWorkPanelStore | null>(null);

export function MyWorkPanelStoreProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [grouping, setGrouping] = useState<IMyWorkSavedGrouping | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((prev) => !prev), []);

  const handleSetGrouping = useCallback((g: IMyWorkSavedGrouping | null) => {
    setGrouping(g);
    setExpandedGroups(new Set());
  }, []);

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  const value = useMemo<IMyWorkPanelStore>(
    () => ({
      isPanelOpen,
      grouping,
      expandedGroups,
      openPanel,
      closePanel,
      togglePanel,
      setGrouping: handleSetGrouping,
      toggleGroup,
    }),
    [isPanelOpen, grouping, expandedGroups, openPanel, closePanel, togglePanel, handleSetGrouping, toggleGroup],
  );

  return <PanelStoreContext.Provider value={value}>{children}</PanelStoreContext.Provider>;
}

export function useMyWorkPanelStore(): IMyWorkPanelStore {
  const value = useContext(PanelStoreContext);
  if (!value) {
    throw new Error('useMyWorkPanelStore must be used within a MyWorkPanelStoreProvider');
  }
  return value;
}
