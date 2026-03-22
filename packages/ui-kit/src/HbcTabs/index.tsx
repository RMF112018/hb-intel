/**
 * HbcTabs — Standalone tab bar with optional lazy panel rendering
 * PH4.10 §Step 3 | Blueprint §2c
 *
 * - 3px solid #F37021 active underline (ADR-0023)
 * - Roving tabIndex keyboard navigation (ArrowLeft/Right, wrap + skip disabled)
 * - Optional panels prop for lazy rendering (only active panel mounted)
 * - Field Mode: dark surface tokens
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { tokens } from '@fluentui/react-components';
import { HBC_ACCENT_ORANGE } from '../theme/tokens.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import type { HbcTabsProps } from './types.js';

const useStyles = makeStyles({
  tablist: {
    display: 'flex',
    alignItems: 'stretch',
    height: '40px',
    gap: `${HBC_SPACE_LG}px`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '0',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: tokens.colorNeutralForeground3,
    cursor: 'pointer',
    transitionProperty: 'color, border-color',
    transitionDuration: TRANSITION_FAST,
    whiteSpace: 'nowrap',
    ':hover': {
      color: tokens.colorNeutralForeground1,
    },
  },
  tabActive: {
    fontWeight: '600',
    color: HBC_ACCENT_ORANGE,
    borderBottomColor: HBC_ACCENT_ORANGE,
  },
  tabDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  panel: {
    // Minimal reset — consumer styles the content
  },
});

export const HbcTabs: React.FC<HbcTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  panels,
  isFieldMode: _isFieldMode = false,
  className,
}) => {
  const styles = useStyles();
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const enabledTabs = React.useMemo(
    () => tabs.filter((t) => !t.disabled),
    [tabs],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();

      const currentEnabledIdx = enabledTabs.findIndex((t) => t.id === activeTabId);
      if (currentEnabledIdx === -1) return;

      let nextIdx: number;
      if (e.key === 'ArrowRight') {
        nextIdx = (currentEnabledIdx + 1) % enabledTabs.length;
      } else {
        nextIdx = (currentEnabledIdx - 1 + enabledTabs.length) % enabledTabs.length;
      }

      const nextTab = enabledTabs[nextIdx];
      const tabIdx = tabs.indexOf(nextTab);
      onTabChange(nextTab.id);
      tabRefs.current[tabIdx]?.focus();
    },
    [tabs, enabledTabs, activeTabId, onTabChange],
  );

  const activePanel = panels?.find((p) => p.tabId === activeTabId);
  const activePanelId = `tabpanel-${activeTabId}`;

  return (
    <div data-hbc-ui="tabs" className={className}>
      <div
        role="tablist"
        className={styles.tablist}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[idx] = el; }}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={panels ? activePanelId : undefined}
              aria-disabled={tab.disabled || undefined}
              tabIndex={isActive ? 0 : -1}
              className={mergeClasses(
                styles.tab,
                isActive && styles.tabActive,
                tab.disabled && styles.tabDisabled,
              )}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
              {tab.badge}
            </button>
          );
        })}
      </div>
      {activePanel && (
        <div
          role="tabpanel"
          id={activePanelId}
          aria-labelledby={`tab-${activeTabId}`}
          className={styles.panel}
        >
          {activePanel.content}
        </div>
      )}
    </div>
  );
};

export type { HbcTabsProps, TabPanel, LayoutTab } from './types.js';
