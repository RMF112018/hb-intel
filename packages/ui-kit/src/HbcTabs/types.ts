/**
 * HbcTabs — Type definitions
 * PH4.10 §Step 3 | Blueprint §2c
 */
import type { ReactNode } from 'react';
import type { LayoutTab } from '../layouts/types.js';

export type { LayoutTab };

/** Content panel linked to a tab by tabId */
export interface TabPanel {
  tabId: string;
  content: ReactNode;
}

export interface HbcTabsProps {
  /** Tab definitions (reuses LayoutTab from layouts/types) */
  tabs: LayoutTab[];
  /** Currently active tab id */
  activeTabId: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Optional content panels — lazy rendered (only active panel mounted) */
  panels?: TabPanel[];
  /** When true, uses HBC_SURFACE_FIELD dark tokens */
  isFieldMode?: boolean;
  /** Additional CSS class */
  className?: string;
}
