/**
 * MyWorkHubTileContext — hub-specific state for canvas tile adapters.
 *
 * Provides UIF-008 KPI filter state and team mode to tile adapter components
 * that wrap existing card components. This avoids modifying the ICanvasTileProps
 * contract from @hbc/project-canvas.
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { TeamMode } from '@hbc/shell';

export interface MyWorkHubTileContextValue {
  /** UIF-008: Active KPI filter key (e.g. 'action-now', 'blocked', 'unread'). */
  activeFilter?: string | null;
  /** UIF-008: Callback when a KPI card is clicked. */
  onFilterChange?: (filter: string) => void;
  /** P2-D5: Current team mode selection. */
  teamMode: TeamMode;
}

const MyWorkHubTileCtx = createContext<MyWorkHubTileContextValue | null>(null);

export interface MyWorkHubTileProviderProps {
  value: MyWorkHubTileContextValue;
  children: ReactNode;
}

export function MyWorkHubTileProvider({ value, children }: MyWorkHubTileProviderProps): ReactNode {
  return <MyWorkHubTileCtx.Provider value={value}>{children}</MyWorkHubTileCtx.Provider>;
}

/** Default fallback when rendered outside a MyWorkHubTileProvider (e.g. tertiary zone). */
const DEFAULT_TILE_CONTEXT: MyWorkHubTileContextValue = {
  activeFilter: null,
  onFilterChange: undefined,
  teamMode: 'personal',
};

export function useMyWorkHubTileContext(): MyWorkHubTileContextValue {
  const ctx = useContext(MyWorkHubTileCtx);
  // Return safe defaults when no provider is present — tiles rendered by
  // HbcProjectCanvas in zones without MyWorkHubTileProvider (e.g. tertiary)
  // should degrade gracefully rather than crash.
  return ctx ?? DEFAULT_TILE_CONTEXT;
}
